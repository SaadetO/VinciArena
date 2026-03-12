import { useState, MouseEvent, useContext, useEffect } from 'react';
import {
  Badge,
  IconButton,
  Menu,
  Typography,
  Divider,
  Link,
  Stack,
  Button,
} from '@mui/material';
import { UserContext } from '../contexts/UserContext';
import { useNavigate } from 'react-router-dom';
import { NotificationDto } from '../types';
import { NotificationItem } from './NotificationItem';
import { NotificationsOutlined } from '@mui/icons-material';

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
      setUnreadCount(0);
    }
  }, [authenticatedUser, fetchUnreadCount]);

  const fetchUnreadNotifications = async () => {
    if (!authenticatedUser?.token) return;
    try {
      const response = await fetch(
        `/api/notifications/member/${authenticatedUser.id}?unreadOnly=true`,
        { headers: { Authorization: authenticatedUser.token } },
      );
      if (response.ok) {
        const data = await response.json();
        setUnreadNotifications(data);
      }
    } catch (err) {
      console.error('Failed to fetch unreadNotifications', err);
    }
  };
  return (
    <>
      <IconButton size="small" onClick={handleMenuClick}>
        <Badge badgeContent={unreadCount} color="primary" variant="dot">
          <NotificationsOutlined />
        </Badge>
      </IconButton>
      <Menu
        open={isOpen}
        onClose={handleClose}
        anchorEl={menuPosition}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        // slotProps={{
        //   paper: {
        //     sx: {
        //       width: '50ch',
        //       maxHeight: 350,
        //       '& .MuiMenuItem-root': {
        //         whiteSpace: 'normal',
        //         wordWrap: 'break-word',
        //         py: 1.5,
        //         borderBottom: '1px solid gray',
        //         display: 'flex',
        //         flexDirection: 'column',
        //         alignItems: 'flex-start',
        //         '&:last-child': { borderBottom: 'none' },
        //         cursor: 'default',
        //         overflow: 'hidden',
        //         textOverflow: 'ellipsis',
        //       },
        //     },
        //   },
        // }}
      >
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
          minWidth="15rem"
          padding="0.5rem 1.5rem 0.75rem 1.5rem"
          sx={{
            outline: 'none',
          }}
        >
          <Typography variant="h4">Notifications</Typography>
          <Link
            onClick={handleSeeAllCLick}
            variant="caption"
            color="primary"
            sx={{ cursor: 'pointer' }}
          >
            <Button variant="contained" color="secondary" size="small">
              voir tout
            </Button>
          </Link>
        </Stack>
        <Divider />
        {unreadNotifications.length === 0 ? (
          <Stack padding="2rem 1.5rem" spacing="0.25rem" alignItems="center">
            <Typography variant="h5" textAlign="center">
              Rien à signaler!
            </Typography>
            <Typography
              variant="body2"
              textAlign="center"
              width="14rem"
              color="text.secondary"
            >
              Vous n'avez aucune nouvelle notification pour le moment.
            </Typography>
          </Stack>
        ) : (
          unreadNotifications.map((notif, index) => (
            <NotificationItem
              key={notif.idNotification}
              notification={notif}
              isLast={index === unreadNotifications.length - 1}
              onRefresh={() => {
                fetchUnreadNotifications();
                fetchUnreadCount(); // Refresh the badge too!
              }}
            />
          ))
        )}
      </Menu>
    </>
  );
};

export default NotificationMenu;
