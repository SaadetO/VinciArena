import { useEffect, useState } from 'react';
import { Team } from '../../../types';
import { useModalController } from '../../../hooks/useModalController';
import { Autocomplete, TextField } from '@mui/material';
import { useTeams } from '../../../hooks/useTeams';

interface JoinTeamModalContentProps {
  onSelect: (team: Team | null) => void;
}

export const JoinTeamModalContent = ({
  onSelect,
}: JoinTeamModalContentProps) => {
  const [teams, setTeams] = useState<Team[]>([]);
  const [localError, setLocalError] = useState<string | null>(null);
  const [requestedTeam, setRequestedTeam] = useState<Team | null>(null);

  const { setError } = useModalController();
  const { getAll } = useTeams({ setTeams });

  useEffect(() => {
    onSelect(requestedTeam);
  }, [requestedTeam, onSelect]);

  useEffect(() => {
    getAll({ isActive: true });
  }, [getAll]);

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
            placeholder="Sélectionnez une équipe"
            error={!!localError}
            helperText={localError}
            required
            autoFocus
            inputProps={{
              ...params.inputProps,
              ...{ ['data-testid' as string]: 'join-team-autocomplete-input' },
            }}
          />
        )}
      />
    </>
  );
};
