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
import { Member } from '../../../types';

export const AdminModal = ({
  promote,
  open,
  onClose,
  onSuccess,
  onError,
}: {
  promote: boolean;
  open: boolean;
  onClose: () => void;
  onSuccess: (successMessage: string) => void;
  onError: (errorMessage: string) => void;
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedUser, setSelectedUser] = useState<Member | null>(null);
  const [users, setUsers] = useState<Member[]>([]);
  const { authenticatedUser } = useContext(UserContext);

  const handleClose = () => {
    onClose();
  };

  const handleToggleAdmin = async () => {
    setIsLoading(true);

    if (!selectedUser) {
      onError('Veuillez sélectionner un utilisateur.');
      return;
    }

    try {
      const response = await fetch(
        `/api/members/toggle-admin/${selectedUser.id}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: authenticatedUser?.token ?? '',
          },
        },
      );

      if (!response.ok) {
        throw new Error(`Failed to ${promote ? 'promote' : 'demote'} admin`);
      }
      onSuccess(
        promote
          ? 'Utilisateur promu admin avec succès !'
          : 'Utilisateur rétrogradé avec succès !',
      );
      handleClose();
      setUsers((prev) =>
        prev.map((user) =>
          user.id === selectedUser.id ? { ...user, admin: !user.admin } : user,
        ),
      );
    } catch (err: unknown) {
      if (err instanceof Error) {
        onError(err.message);
      }
    } finally {
      setIsLoading(false);
    }
  };
  useEffect(() => {
    console.log('users', users);

    if (users.length > 0) return;
    (async () => {
      try {
        setIsLoading(true);
        const response = await fetch('/api/members', {
          headers: {
            Authorization: authenticatedUser?.token ?? '',
          },
        });
        if (!response.ok)
          throw new Error('Erreur lors de la récupération des utilisateurs.');
        const data = await response.json();
        setUsers(data);
      } catch (err: unknown) {
        if (err instanceof Error) setError(err.message);
      } finally {
        setIsLoading(false);
      }
    })();
  }, [open]);

  useEffect(() => {
    if (open) {
      setError(null);
      setSelectedUser(null);
    }
  }, [users, promote, open]);
  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle variant="h2">
        {promote ? 'Désigner un Admin' : 'Supprimer un Admin'}
      </DialogTitle>
      <Typography textAlign="center" padding="0 2rem 1rem" color="secondary">
        {promote
          ? 'Choisissez un utilisateur à désigner comme admin.'
          : 'Choisissez un utilisateur à rétrograder.'}
      </Typography>
      <DialogContent>
        <Autocomplete
          options={users.filter(
            (user: Member) =>
              user.admin === !promote && user.id !== authenticatedUser?.id,
          )}
          fullWidth
          value={selectedUser}
          getOptionLabel={(user) => user.tag}
          autoHighlight
          onChange={(_, value) => setSelectedUser(value)}
          renderInput={(params) => (
            <TextField
              {...params}
              placeholder={
                promote
                  ? 'Utilisateur à promouvoir'
                  : 'Utilisateur à rétrograder'
              }
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
        <Button fullWidth variant="contained" onClick={handleToggleAdmin}>
          {promote ? 'Désigner' : 'Supprimer'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
