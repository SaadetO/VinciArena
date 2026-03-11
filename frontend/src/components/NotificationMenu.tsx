import { useState, MouseEvent, useContext, useEffect } from 'react';
import {
  Badge,
  IconButton,
  Menu,
  Typography,
  Box,
  Divider,
  Link,
} from '@mui/material';
import NotificationsIcon from '@mui/icons-material/Notifications';
import { UserContext } from '../contexts/UserContext';
import { useNavigate } from 'react-router-dom';
import { NotificationDto } from '../types';
import { NotificationItem } from './NotificationItem';

const NotificationMenu = () => {
  const [unreadCount, setUnreadCount] = useState(0);
  const { authenticatedUser } = useContext(UserContext);
  const [menuPosition, setMenuPosition] = useState<null | HTMLElement>(null);
  const [unreadNotifications, setUnreadNotifications] = useState<
    NotificationDto[]
  >([]);
  const navigate = useNavigate();

  const isOpen = menuPosition != null;

  const handleMenuClick = (event: MouseEvent<HTMLElement>) => {
    setMenuPosition(event.currentTarget);
    fetchUnreadNotifications();
  };

  const handleSeeAllCLick = () => {
    navigate('/notifications');
  };

  const handleClose = () => {
    setMenuPosition(null);
  };
  const fetchUnreadCount = async () => {
    if (!authenticatedUser?.token) return;
    try {
      const response = await fetch(
        `/api/notifications/member/${authenticatedUser.id}/unread-count`,
        { headers: { Authorization: authenticatedUser.token } },
      );
      if (response.ok) {
        const data = await response.text();
        setUnreadCount(parseInt(data));
      }
    } catch (err) {
      console.error('Failed to fetch unread count', err);
    }
  };

  useEffect(() => {
    if (authenticatedUser) {
      const id = setInterval(fetchUnreadCount, 3000);
      return () => clearInterval(id);
    } else {
      setUnreadCount(0); // Reset count if user logs out
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authenticatedUser]);

  const fetchUnreadNotifications = async () => {
    if (!authenticatedUser?.token) return;
    try {
      const response = await fetch(
        `/api/notifications/member/${authenticatedUser.id}?unreadOnly=true`,
        { headers: { Authorization: authenticatedUser.token } },
      );
      if (response.ok) {
        const data = await response.json();
        console.log('Data from server:', data[0]);
        setUnreadNotifications(data);
      }
    } catch (err) {
      console.error('Failed to fetch unreadNotifications', err);
    }
  };
  return (
    <>
      <IconButton color="primary" onClick={handleMenuClick}>
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
                overflow: 'hidden',
                textOverflow: 'ellipsis',
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
          <Link
            onClick={handleSeeAllCLick}
            variant="caption"
            color="primary"
            sx={{ cursor: 'pointer' }}
          >
            Voir tous
          </Link>
        </Box>
        <Divider />
        {unreadNotifications.map((notif, index) => (
          <NotificationItem
            key={notif.idNotification}
            notification={notif}
            isLast={index === unreadNotifications.length - 1}
            onRefresh={() => {
              fetchUnreadNotifications();
              fetchUnreadCount(); // Refresh the badge too!
            }}
          />
        ))}
      </Menu>
    </>
  );
};

export default NotificationMenu;
