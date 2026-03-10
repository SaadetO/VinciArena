import { useState, MouseEvent, useContext } from 'react';
import {
  Badge,
  IconButton,
  Menu,
  MenuItem,
  Typography,
  Box,
  Divider,
  Link,
} from '@mui/material';
import NotificationsIcon from '@mui/icons-material/Notifications';
import { UserContext } from '../contexts/UserContext';

const NotificationMenu = () => {
  const { unreadCount } = useContext(UserContext);
  const [menuPosition, setMenuPosition] = useState<null | HTMLElement>(null);

  const isOpen = menuPosition != null;

  const handleClick = (event: MouseEvent<HTMLElement>) => {
    setMenuPosition(event.currentTarget);
  };

  const handleClose = () => {
    setMenuPosition(null);
  };

  return (
    <>
      <IconButton color="primary" onClick={handleClick}>
        <Badge badgeContent={unreadCount} color="warning">
          <NotificationsIcon />
        </Badge>
      </IconButton>

      <Menu
        open={isOpen}
        onClose={handleClose}
        anchorEl={menuPosition}
        slotProps={{
          paper: {
            sx: {
              width: '50ch',
              maxHeight: 350,
              // GLOBAL STYLES for items (Handles wrapping)
              '& .MuiMenuItem-root': {
                whiteSpace: 'normal',
                wordWrap: 'break-word',
                py: 1.5,
                borderBottom: '1px solid gray',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'flex-start',
                '&:last-child': { borderBottom: 'none' },
                cursor: 'default',
              },
            },
          },
        }}
      >
        <Box
          sx={{
            px: 2,
            py: 1,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <Typography variant="subtitle2" fontWeight="bold">
            Notifications
          </Typography>
          <Link variant="caption" color="primary" sx={{ cursor: 'pointer' }}>
            Voir tous
          </Link>
        </Box>
        <Divider />
        {/* 1. Tournament Created */}
        <MenuItem>
          <Typography variant="body2" fontWeight="500">
            🏆 Nouveau Tournoi : Le Choc des Titans est ouvert !
          </Typography>
        </MenuItem>
        {/* 2. Selected for Lineup */}
        <MenuItem>
          <Typography variant="body2" fontWeight="500">
            ⚽ Composition : Vous êtes titulaire pour le match de ce soir contre
            Les Phénix d'Azur !
          </Typography>
        </MenuItem>
        {/* 3. Join Request Status (Accepted) */}
        <MenuItem>
          <Typography variant="body2" fontWeight="500">
            ✅ Félicitations ! Votre demande pour rejoindre Squadra Corse a été
            acceptée.
          </Typography>
        </MenuItem>
        {/* 4. Manager Join Request */}
        <MenuItem>
          <Typography variant="body2" fontWeight="500">
            📩 Chloé Masson souhaite rejoindre les Cyber Dragons.
          </Typography>
        </MenuItem>
        {/* 5. Result Confirmation */}
        <MenuItem>
          <Typography variant="body2" fontWeight="500">
            ⚠️ Confirmation requise : Score du match Olympique Bel-Air (3) - (1)
            AS Grigny.
          </Typography>
        </MenuItem>
        {/* 6. Result Published */}
        <MenuItem onClick={handleClose}>
          <Typography variant="body2" fontWeight="500">
            📊 Résultat publié : Victoire éclatante pour Les Lions de Lyon !
            Score final 4-0.
          </Typography>
        </MenuItem>
      </Menu>
    </>
  );
};

export default NotificationMenu;
