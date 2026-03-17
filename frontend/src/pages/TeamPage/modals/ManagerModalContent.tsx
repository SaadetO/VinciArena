import { useEffect, useState } from 'react';
import { useModalController } from '../../../hooks/useModalController';
import { ProfileInfoDto, TeamDetailsInfoDto } from '../../../types';
import { Autocomplete, TextField } from '@mui/material';

interface ManagerModalContentProps {
  team: TeamDetailsInfoDto | undefined;
  onSelect: (user: ProfileInfoDto | null) => void;
}

export const ManagerModalContent = ({
  team,
  onSelect,
}: ManagerModalContentProps) => {
  const [localError, setLocalError] = useState<string | null>(null);
  const [selectedUser, setSelectedUser] = useState<ProfileInfoDto | null>(null);

  const { setError, setConfirmDisabled } = useModalController();

  useEffect(() => {
    setConfirmDisabled(!selectedUser);
    onSelect(selectedUser);
  }, [selectedUser, setConfirmDisabled, onSelect]);

  return (
    <>
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
    </>
  );
};
