import { Button, Menu, MenuItem, Snackbar, Typography } from '@mui/material';
import { MouseEvent, useContext, useState } from 'react';
import { UserContext } from '../../../contexts/UserContext';
import { ArrowDropDown } from '@mui/icons-material';
import { AdminModal } from './AdminModal';

export const AdminMenu = () => {
  const { authenticatedUser } = useContext(UserContext);
  console.log(authenticatedUser);

  const [menuPosition, setMenuPosition] = useState<null | HTMLElement>(null);
  const [open, setOpen] = useState({
    open: false,
    promote: false,
  });
  const [snackBarMessage, setSnackBarMessage] = useState<{ isOpen: boolean; text: string; isError: boolean } | null>(null);
  const isOpen = menuPosition != null;
  const handleMenuClick = (event: MouseEvent<HTMLElement>) => {
    setMenuPosition(event.currentTarget);
  };

  const handleClose = () => {
    setMenuPosition(null);
  };

  const handlePromote = () => {
    handleClose();
    setOpen({
      open: true,
      promote: true,
    });
  }

  const handleDemote = () => {
    handleClose();
    setOpen({
      open: true,
      promote: false,
    });
  }
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
      <AdminModal
        promote={open.promote}
        open={open.open}
        onClose={() => setOpen((prev) => ({ ...prev, open: false }))}
        onSuccess={(successMessage: string) => {
          setSnackBarMessage({
            isOpen: true,
            text: successMessage,
            isError: false,
          });
        }}
        onError={(errorMessage: string) => {
          setSnackBarMessage({
            isOpen: true,
            text: errorMessage,
            isError: true,
          });
        }}
      />
      <Snackbar
        open={snackBarMessage?.isOpen ?? false}
        autoHideDuration={3000}
        onClose={() =>
          setSnackBarMessage((prev) =>
            prev ? { ...prev, isOpen: false } : null,
          )
        }
        message={
          snackBarMessage && (
            <Typography
              variant="body1"
              sx={{
                color: (theme) =>
                  snackBarMessage.isError
                    ? theme.palette.error.main
                    : theme.palette.background.s0,
              }}
            >
              {snackBarMessage.text}
            </Typography>
          )
        }
      />
    </>
  );
};
