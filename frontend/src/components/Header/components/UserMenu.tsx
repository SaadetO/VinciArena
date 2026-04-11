import { Button, Menu, MenuItem, Typography } from '@mui/material';
import { MouseEvent, useContext, useState } from 'react';
import { UserContext } from '../../../contexts/UserContext';
import { ChevronDown } from '@gravity-ui/icons';
import { useNavigate } from 'react-router-dom';

export const UserMenu = () => {
  const navigate = useNavigate();
  const { authenticatedUser, clearUser } = useContext(UserContext);
  const [menuPosition, setMenuPosition] = useState<null | HTMLElement>(null);
  const isOpen = menuPosition != null;
  const handleMenuClick = (event: MouseEvent<HTMLElement>) => {
    setMenuPosition(event.currentTarget);
  };
  const handleClose = () => {
    setMenuPosition(null);
  };
  return (
    <>
      <Button
        variant="contained"
        color="secondary"
        onClick={handleMenuClick}
        endIcon={
          <ChevronDown
            style={{
              color: 'text.secondary',
              transition: 'transform 0.2s cubic-bezier(0.2, 0, 0, 1)',
              transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
            }}
          />
        }
      >
        {authenticatedUser?.tag}
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
        <MenuItem
          onClick={() => {
            navigate(`/users/${authenticatedUser?.id}`);
            handleClose();
          }}
        >
          <Typography variant="h5">Mon Profil</Typography>
        </MenuItem>
        <MenuItem
          onClick={() => {
            clearUser();
            handleClose();
            navigate('/');
          }}
        >
          <Typography variant="h5" color="error">
            Se Déconnecter
          </Typography>
        </MenuItem>
      </Menu>
    </>
  );
};
