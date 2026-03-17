import { Autocomplete, TextField } from '@mui/material';
import { useContext, useEffect, useState } from 'react';
import { UserContext } from '../../../contexts/UserContext';
import { Member } from '../../../types';
import { useModalController } from '../../../hooks/useModalController';

interface AdminModalContentProps {
  promote: boolean;
  users: Member[];
  onSelect: (user: Member | null) => void;
}

export const AdminModalContent = ({
  promote,
  users,
  onSelect,
}: AdminModalContentProps) => {
  const [selectedUser, setSelectedUser] = useState<Member | null>(null);
  const { authenticatedUser } = useContext(UserContext);
  const { setConfirmDisabled } = useModalController();

  useEffect(() => {
    setConfirmDisabled(!selectedUser);
    onSelect(selectedUser);
  }, [selectedUser, setConfirmDisabled, onSelect]);

  return (
    <form
      id="admin-modal-form"
      onSubmit={(e) => {
        e.preventDefault();
      }}
    >
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
              promote ? 'Utilisateur à promouvoir' : 'Utilisateur à rétrograder'
            }
            autoFocus
          />
        )}
      />
    </form>
  );
};
