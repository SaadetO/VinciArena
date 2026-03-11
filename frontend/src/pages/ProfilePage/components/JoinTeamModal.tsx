import { Dispatch, SetStateAction, useEffect, useState } from 'react';
import { Team } from '../../../types';
import {
  Autocomplete,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  Typography,
} from '@mui/material';
import { getAuthenticatedUser } from '../../../utils/session';

interface JoinTeamModalProps {
  teams: Team[];
  setTeams: Dispatch<SetStateAction<Team[]>>;
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const JoinTeamModal = ({
  teams,
  setTeams,
  open,
  onClose,
  onSuccess,
}: JoinTeamModalProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [requestedTeam, setRequestedTeam] = useState<Team | null>(null);

  const handleClose = () => {
    setError(null);
    setRequestedTeam(null);
    onClose();
  };

  const handleJoinRequest = async () => {
    setIsLoading(true);
    setError(null);

    const idTeam = requestedTeam?.idTeam;
    if (!idTeam) return;

    const user = getAuthenticatedUser();

    try {
      const response = await fetch(`/api/teams/${idTeam}/join-requests`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: user ? user.token : '',
        },
      });

      if (!response.ok) {
        throw new Error(
          'Vous avez déjà une demande en attente pour cette équipe.',
        );
      }
      onSuccess();
      handleClose();
    } catch (err: unknown) {
      if (err instanceof Error) setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (teams.length) return;
    console.log("blabla");

    const user = getAuthenticatedUser();

    setIsLoading(true);
    setError(null);
    (async () => {
      try {
        const response = await fetch('/api/teams', {
          method: 'GET',
          headers: {
            Authorization: user ? user.token : '',
          },
        });

        if (!response.ok) throw new Error('Erreur lors du fetch des teams');

        const fetchedTeams = await response.json();
        setTeams(fetchedTeams);
      } catch (err: unknown) {
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError('Une erreur est survenue.');
        }
      } finally {
        setIsLoading(false);
      }
    })();
  }, [setTeams, teams]);

  return (
    <Dialog open={open} onClose={handleClose} fullWidth>
      <DialogTitle variant="h2">Rechercher une Team</DialogTitle>
      <Typography textAlign="center" padding="0 2rem 1rem" color="secondary">
        Demandez à rejoindre une Team ci-dessous
      </Typography>
      <DialogContent>
        <Autocomplete
          options={teams}
          fullWidth
          getOptionLabel={(team) => team.name}
          autoHighlight
          onChange={(_, value) => setRequestedTeam(value)}
          renderInput={(params) => (
            <TextField
              {...params}
              placeholder="Nom de Team"
              error={!!error}
              helperText={error}
            />
          )}
        />
      </DialogContent>
      <DialogActions>
        <Button
          variant="contained"
          color="secondary"
          onClick={handleClose}
          disabled={isLoading}
          fullWidth
        >
          Annuler
        </Button>
        <Button
          fullWidth
          variant="contained"
          disabled={isLoading || !requestedTeam}
          onClick={handleJoinRequest}
        >
          Demander
        </Button>
      </DialogActions>
    </Dialog>
  );
};
