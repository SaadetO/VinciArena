import {
  Dispatch,
  SetStateAction,
  useContext,
  useEffect,
  useState,
} from 'react';
import { Team } from '../../../types';
import { UserContext } from '../../../contexts/UserContext';
import { useModalController } from '../../../hooks/useModalController';
import { useSnackbar } from '../../../hooks/useSnackbar';
import { Autocomplete, TextField } from '@mui/material';

interface JoinTeamModalContentProps {
  teams: Team[];
  setTeams: Dispatch<SetStateAction<Team[]>>;
  onSuccess: () => void;
  close: () => void;
}

export const JoinTeamModalContent = ({
  teams,
  setTeams,
  onSuccess,
  close,
}: JoinTeamModalContentProps) => {
  const [localError, setLocalError] = useState<string | null>(null);
  const [requestedTeam, setRequestedTeam] = useState<Team | null>(null);
  
  const { authenticatedUser } = useContext(UserContext);
  const { setError, setConfirmDisabled } = useModalController();
  const { showSnackbar } = useSnackbar();

  useEffect(() => {
    // Disable confirm button strictly if no team is selected
    setConfirmDisabled(!requestedTeam);
  }, [requestedTeam, setConfirmDisabled]);

  const handleJoinRequest = async () => {
    const idTeam = requestedTeam?.idTeam;
    if (!idTeam) return;

    setConfirmDisabled(true);
    setError(null);
    setLocalError(null);

    try {
      const response = await fetch(`/api/teams/${idTeam}/join-requests`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: authenticatedUser?.token ?? '',
        },
      });

      if (!response.ok) {
        throw new Error(
          'Vous avez déjà une demande en attente pour cette équipe.',
        );
      }
      
      onSuccess();
      showSnackbar({
        message: 'Demande effectuée avec succès !',
        severity: 'success'
      });
      close();
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : 'Une erreur est survenue.';
      setError(errorMsg);
      setLocalError(errorMsg);
      setConfirmDisabled(false);
    }
  };

  useEffect(() => {
    if (teams.length) return;

    setConfirmDisabled(true);
    setError(null);
    
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
        const errorMsg = err instanceof Error ? err.message : 'Une erreur est survenue.';
        setError(errorMsg);
        setLocalError(errorMsg);
      } finally {
        if (!requestedTeam) setConfirmDisabled(true);
        else setConfirmDisabled(false);
      }
    })();
  }, [setTeams, teams, authenticatedUser, setError, setConfirmDisabled, requestedTeam]);

  return (
    <form
      id="join-team-form"
      onSubmit={(e) => {
        e.preventDefault();
        handleJoinRequest();
      }}
    >
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
    </form>
  );
};
