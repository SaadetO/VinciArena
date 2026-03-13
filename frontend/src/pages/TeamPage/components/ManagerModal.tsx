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
import { useContext, useEffect, useState } from 'react';
import { UserContext } from '../../../contexts/UserContext';
import { ProfileInfoDto, TeamDetailsInfoDto } from '../../../types';

export const ManagerModal = ({
  open,
  onClose,
  onSuccess,
  onError,
  team,
}: {
  open: boolean;
  onClose: () => void;
  onSuccess: (successMessage: string, promotedUser?: ProfileInfoDto) => void;
  onError: (errorMessage: string) => void;
  team: TeamDetailsInfoDto | undefined;
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedUser, setSelectedUser] = useState<ProfileInfoDto | null>(null);
  const { authenticatedUser } = useContext(UserContext);

  const handleClose = () => {
    onClose();
  };

  const handlePromoteUser = async () => {
    setIsLoading(true);

    if (!selectedUser) {
      onError('Veuillez sélectionner un utilisateur.');
      return;
    }

    try {
      const response = await fetch(
        `/api/teams/${team?.idTeam}/manager/${selectedUser.id}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: authenticatedUser?.token ?? '',
          },
        },
      );

      if (!response.ok) {
        throw new Error(`Failed to promote user`);
      }
      onSuccess('Utilisateur promu manager avec succès !', selectedUser);
      handleClose();
    } catch (err: unknown) {
      if (err instanceof Error) {
        onError(err.message);
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (open) {
      setError(null);
      setSelectedUser(null);
    }
  }, [open]);
  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle variant="h2">Désigner un Manager</DialogTitle>
      <Typography textAlign="center" padding="0 2rem 1rem" color="secondary">
        Choisissez un utilisateur à désigner comme manager.
      </Typography>
      <DialogContent>
        <Autocomplete
          options={team?.members.filter(
            (user: ProfileInfoDto) =>
              !team?.managers.find((manager) => manager.id === user.id),
          ) ?? []}
          fullWidth
          value={selectedUser}
          getOptionLabel={(user) => user.tag}
          autoHighlight
          onChange={(_, value) => setSelectedUser(value)}
          renderInput={(params) => (
            <TextField
              {...params}
              placeholder="Utilisateur à promouvoir"
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
        <Button fullWidth variant="contained" onClick={handlePromoteUser}>
          Désigner
        </Button>
      </DialogActions>
    </Dialog>
  );
};
