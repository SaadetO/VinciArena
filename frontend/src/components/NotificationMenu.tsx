import { useState, MouseEvent } from 'react';
import { Badge, IconButton, Menu, MenuItem, Button } from '@mui/material';
import NotificationsIcon from '@mui/icons-material/Notifications';

const NotificationMenu = () => {
  const [menuPosition, setMenuPosition] = useState<null | HTMLElement>();
  const ITEM_HEIGHT = 60;
  let isOpen = false;
  if (menuPosition) {
    isOpen = true;
  }
  const handleClick = (event: MouseEvent<HTMLElement>) => {
    setMenuPosition(event.currentTarget);
    isOpen = true;
  };
  const handleClose = () => {
    setMenuPosition(null);
    isOpen = false;
  };

  return (
    <>
      <IconButton color="primary" onClick={handleClick}>
        <Badge badgeContent={0} color="warning">
          <NotificationsIcon />
        </Badge>
      </IconButton>
      <Menu
        open={isOpen}
        onClose={handleClose}
        anchorEl={menuPosition}
        slotProps={{
          paper: {
            style: {
              maxHeight: ITEM_HEIGHT * 4.5,
              width: '50ch',
            },
          },
        }}
      >
        <Button>Voir tous</Button>
        <MenuItem sx={{ height: ITEM_HEIGHT }} onClick={handleClose}>
          Nouveau Tournoi : Le Choc des Titans est ouvert !
        </MenuItem>
        <MenuItem sx={{ height: ITEM_HEIGHT }} onClick={handleClose}>
          Vous êtes dans le composition. Match prévu ce soir à 20h30 contre Les
          Phénix d'Azur.
        </MenuItem>
        <MenuItem sx={{ height: ITEM_HEIGHT }} onClick={handleClose}>
          Chloé Masson souhaite rejoindre les Cyber Dragons.
        </MenuItem>
        <MenuItem sx={{ height: ITEM_HEIGHT }} onClick={handleClose}>
          Score à valider : Olympique Bel-Air (3) - (1) AS Grigny.
        </MenuItem>
        <MenuItem sx={{ height: ITEM_HEIGHT }} onClick={handleClose}>
          Résultat publié : Victoire éclatante pour Les Lions de Lyon !
        </MenuItem>
      </Menu>
    </>
  );
};
export default NotificationMenu;
