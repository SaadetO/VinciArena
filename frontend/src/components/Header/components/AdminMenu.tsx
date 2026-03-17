import { Button, Menu, MenuItem, Typography } from '@mui/material';
import { MouseEvent, useContext, useState, useEffect } from 'react';
import { UserContext } from '../../../contexts/UserContext';
import { useModal } from '../../../hooks/useModal';
import { useSnackbar } from '../../../hooks/useSnackbar';
import { ArrowDropDown } from '@mui/icons-material';
import { adminModal } from './modals/adminModal';
import { Member } from '../../../types';

export const AdminMenu = () => {
  const { authenticatedUser } = useContext(UserContext);
  console.log(authenticatedUser);

  const [menuPosition, setMenuPosition] = useState<null | HTMLElement>(null);
  const { openModal } = useModal();
  const { showSnackbar } = useSnackbar();
  const [users, setUsers] = useState<Member[]>([]);
  const isOpen = menuPosition != null;

  useEffect(() => {
    if (isOpen || users.length > 0) return; // Fetch if we open menu or keep them cached
    (async () => {
      try {
        const response = await fetch('/api/members', {
          headers: {
            Authorization: authenticatedUser?.token ?? '',
          },
        });
        if (response.ok) {
          setUsers(await response.json());
        }
      } catch (err) {
        console.error("Failed to fetch users", err);
      }
    })();
  }, [authenticatedUser, users.length]);
  const handleMenuClick = (event: MouseEvent<HTMLElement>) => {
    setMenuPosition(event.currentTarget);
  };

  const handleClose = () => {
    setMenuPosition(null);
  };

  const handleAction = (promote: boolean) => {
    handleClose();
    let selectedUser: Member | null = null;
    
    openModal(
      adminModal({
        promote,
        users,
        onSelect: (user) => {
          selectedUser = user;
        },
        onConfirm: async (close) => {
          if (!selectedUser) return;
          close();

          const previousUsers = [...users];

          // Optimistic update
          setUsers((prev) =>
            prev.map((user) =>
              user.id === selectedUser!.id ? { ...user, admin: !user.admin } : user,
            ),
          );

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
            
            showSnackbar({
              message: promote
                ? 'Utilisateur promu admin avec succès !'
                : 'Utilisateur rétrogradé avec succès !',
              severity: 'success',
            });
          } catch (err: unknown) {
            // Rollback
            setUsers(previousUsers);
            showSnackbar({
              message: err instanceof Error ? err.message : 'Une erreur est survenue',
              severity: 'error',
            });
          }
        },
      })
    );
  };

  const handlePromote = () => handleAction(true);
  const handleDemote = () => handleAction(false);
  return (
    <>
      <Button
        variant="contained"
        color="secondary"
        onClick={handleMenuClick}
        endIcon={
          <ArrowDropDown
            sx={{
              color: 'text.secondary',
              transition: 'transform 0.2s cubic-bezier(0.2, 0, 0, 1)',
              transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
            }}
          />
        }
      >
        Gérer les admins
      </Button>

      <Menu
        open={isOpen}
        onClose={handleClose}
        anchorEl={menuPosition}
        sx={{
          '& .MuiPaper-root': {
            width: 'fit-content',
          },
        }}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
      >
        <MenuItem onClick={handlePromote}>
          <Typography variant="h5">Désigner un Admin</Typography>
        </MenuItem>
        <MenuItem onClick={handleDemote}>
          <Typography variant="h5" color="error">
            Supprimer un Admin
          </Typography>
        </MenuItem>
      </Menu>
    </>
  );
};
