import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  Typography,
} from '@mui/material';
import { SyntheticEvent, useState } from 'react';
import { getAuthenticatedUser } from '../../../utils/session';

interface CreateTeamModalProps {
  open: boolean;
  onClose: () => void;
}

export const CreateTeamModal = ({ open, onClose }: CreateTeamModalProps) => {
  const [teamName, setTeamName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
    const user = getAuthenticatedUser();

    try {
      const response = await fetch('/api/teams/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: user ? user.token : '',
        },
        body: JSON.stringify({ name: teamName.trim() }),
      });

      if (!response.ok) {
        if (response.status === 409) {
          throw new Error('Une équipe avec ce nom existe déjà');
        }
        throw new Error('Erreur lors de la création de la team.');
      }

      onClose();
      // window.location.reload
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
        <DialogTitle variant="h4">Créer une Team</DialogTitle>
        <DialogContent>
          <Typography>Comment s'appelle votre team ? </Typography>
          <TextField
            id="teamName"
            name="teamName"
            placeholder="Votre nom de team"
            onChange={handleChange}
            variant="outlined"
            error={!!error} // If error message, the first ! returns false, the second ! turns it into true
            helperText={error}
          ></TextField>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} disabled={isLoading}>
            Annuler
          </Button>
          <Button
            variant="contained"
            disabled={isLoading}
            onClick={handleCreate}
          >
            Créer
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};
