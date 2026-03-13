import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { SyntheticEvent, useContext, useState } from 'react';
import { UserContext } from '../../../contexts/UserContext';

interface CreateTeamModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: (team: { id: number; name: string; isManager: boolean }) => void;
}

export const CreateTeamModal = ({
  open,
  onClose,
  onSuccess,
}: CreateTeamModalProps) => {
  const [teamName, setTeamName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { authenticatedUser } = useContext(UserContext);

  const handleChange = (e: SyntheticEvent) => {
    const input = e.target as HTMLInputElement;
    setTeamName(input.value);
  };

  const handleCreate = async () => {
    if (!teamName.trim()) {
      setError("Le nom de l'équipe ne peut pas être vide.");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/teams/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: authenticatedUser?.token ?? '',
        },
        body: JSON.stringify({ name: teamName.trim() }),
      });

      if (!response.ok) {
        if (response.status === 409) {
          throw new Error('Une équipe avec ce nom existe déjà');
        }
        throw new Error('Erreur lors de la création de la team.');
      }

      const createdTeam = await response.json();

      onSuccess({
        id: createdTeam.idTeam,
        name: createdTeam.name,
        isManager: true,
      });
      onClose();
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Une erreur est survenue.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setTeamName('');
    setError(null);
    onClose();
  };

  return (
    <>
      <Dialog open={open} onClose={handleClose} fullWidth>
        <DialogTitle variant="h2">Créer une Team</DialogTitle>
        <Typography textAlign="center" padding="0 2rem 1rem" color="secondary">
          Comment s'appelle votre Team ?
        </Typography>
        <DialogContent>
          <Stack>
            <TextField
              id="teamName"
              name="teamName"
              placeholder="Nom de Team"
              onChange={handleChange}
              variant="outlined"
              error={!!error} // If error message, the first ! returns false, the second ! turns it into true
              helperText={error}
            ></TextField>
          </Stack>
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
            variant="contained"
            disabled={isLoading}
            onClick={handleCreate}
            fullWidth
          >
            Créer
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};
