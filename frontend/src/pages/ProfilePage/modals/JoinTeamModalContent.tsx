import { useContext, useEffect, useState } from 'react';
import { Team } from '../../../types';
import { UserContext } from '../../../contexts/UserContext';
import { useModalController } from '../../../hooks/useModalController';
import { Autocomplete, TextField } from '@mui/material';

interface JoinTeamModalContentProps {
  onSelect: (team: Team | null) => void;
}

export const JoinTeamModalContent = ({
  onSelect,
}: JoinTeamModalContentProps) => {
  const [teams, setTeams] = useState<Team[]>([]);
  const [localError, setLocalError] = useState<string | null>(null);
  const [requestedTeam, setRequestedTeam] = useState<Team | null>(null);

  const { authenticatedUser } = useContext(UserContext);
  const { setError, setConfirmDisabled } = useModalController();

  useEffect(() => {
    // Disable confirm button strictly if no team is selected
    setConfirmDisabled(!requestedTeam);
    onSelect(requestedTeam);
  }, [requestedTeam, setConfirmDisabled, onSelect]);

  useEffect(() => {
    (async () => {
      try {
        const response = await fetch('/api/teams', {
          method: 'GET',
          headers: {
            Authorization: authenticatedUser?.token ?? '',
          },
        });

        if (!response.ok) throw new Error('Erreur lors du fetch des teams');

        const fetchedTeams = await response.json();
        setTeams(fetchedTeams);
      } catch (err: unknown) {
        const errorMsg =
          err instanceof Error ? err.message : 'Une erreur est survenue.';
        setError(errorMsg);
        setLocalError(errorMsg);
      }
    })();
  }, [authenticatedUser, setError]);

  return (
    <>
      <Autocomplete
        options={teams}
        fullWidth
        getOptionLabel={(team) => team.name}
        autoHighlight
        onChange={(_, value) => {
          setRequestedTeam(value);
          if (localError) {
            setLocalError(null);
            setError(null);
          }
        }}
        renderInput={(params) => (
          <TextField
            {...params}
            placeholder="Nom de Team"
            error={!!localError}
            helperText={localError}
            autoFocus
          />
        )}
      />
    </>
  );
};
