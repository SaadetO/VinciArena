import { useContext, useEffect, useState } from 'react';
import { useModalController } from '../../../hooks/useModalController';
import { useSnackbar } from '../../../hooks/useSnackbar';
import { UserContext } from '../../../contexts/UserContext';
import { ProfileInfoDto, TeamDetailsInfoDto } from '../../../types';
import { Autocomplete, TextField } from '@mui/material';

interface ManagerModalContentProps {
  team: TeamDetailsInfoDto | undefined;
  onSuccess: (successMessage: string, promotedUser?: ProfileInfoDto) => void;
  close: () => void;
}

export const ManagerModalContent = ({
  team,
  onSuccess,
  close,
}: ManagerModalContentProps) => {
  const [localError, setLocalError] = useState<string | null>(null);
  const [selectedUser, setSelectedUser] = useState<ProfileInfoDto | null>(null);
  
  const { authenticatedUser } = useContext(UserContext);
  const { setError, setConfirmDisabled } = useModalController();
  const { showSnackbar } = useSnackbar();

  useEffect(() => {
    setConfirmDisabled(!selectedUser);
  }, [selectedUser, setConfirmDisabled]);

  const handlePromoteUser = async () => {
    if (!selectedUser) return;

    setConfirmDisabled(true);
    setError(null);
    setLocalError(null);

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
        throw new Error('Failed to promote user');
      }

      onSuccess('Utilisateur promu manager avec succès !', selectedUser);
      showSnackbar({
        message: 'Utilisateur promu manager avec succès !',
        severity: 'success',
      });
      close();
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : 'Une erreur est survenue';
      setError(errMsg);
      setLocalError(errMsg);
      setConfirmDisabled(false);
    }
  };

  return (
    <form
      id="manager-modal-form"
      onSubmit={(e) => {
        e.preventDefault();
        handlePromoteUser();
      }}
    >
      <Autocomplete
        options={
          team?.members.filter(
            (user: ProfileInfoDto) =>
              !team?.managers.find((manager) => manager.id === user.id),
          ) ?? []
        }
        fullWidth
        value={selectedUser}
        getOptionLabel={(user) => user.tag}
        autoHighlight
        onChange={(_, value) => {
          setSelectedUser(value);
          if (localError) {
             setLocalError(null);
             setError(null);
          }
        }}
        renderInput={(params) => (
          <TextField
            {...params}
            placeholder="Utilisateur à promouvoir"
            error={!!localError}
            helperText={localError}
            autoFocus
          />
        )}
      />
    </form>
  );
};
