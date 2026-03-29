import { useState, MouseEvent } from 'react';
import {
  Badge,
  IconButton,
  Menu,
  Typography,
  Divider,
  Stack,
  Button,
} from '@mui/material';
import { Link } from 'react-router-dom';
import { NotificationItem } from '../../NotificationItem';
import { NotificationsOutlined } from '@mui/icons-material';
import { useNotifications } from '../../../hooks/useNotifications';

export const NotificationMenu = () => {
  const [menuPosition, setMenuPosition] = useState<null | HTMLElement>(null);
  const { unreadNotifications, unreadCount, getAll } = useNotifications();

  const isOpen = menuPosition != null;

  const handleMenuClick = (event: MouseEvent<HTMLElement>) => {
    setMenuPosition(event.currentTarget);
    getAll(true);
  };

  const handleClose = () => {
    setMenuPosition(null);
  };

  // TRI (récent → ancien)
  const sortedNotifications = [...unreadNotifications].sort(
    (a, b) => new Date(b.dateTime).getTime() - new Date(a.dateTime).getTime(),
  );

  // GROUPES
  const today = new Date();

  const isToday = (date: Date) => date.toDateString() === today.toDateString();

  const isYesterday = (date: Date) => {
    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);
    return date.toDateString() === yesterday.toDateString();
  };

  const todayNotifs = sortedNotifications.filter((n) =>
    isToday(new Date(n.dateTime)),
  );

  const yesterdayNotifs = sortedNotifications.filter((n) =>
    isYesterday(new Date(n.dateTime)),
  );

  const olderNotifs = sortedNotifications.filter(
    (n) => !isToday(new Date(n.dateTime)) && !isYesterday(new Date(n.dateTime)),
  );

  return (
    <>
      <IconButton
        size="small"
        onClick={handleMenuClick}
        sx={{
          background: (theme) =>
            isOpen ? theme.palette.background.s4 : 'transparent',
        }}
      >
        <Badge badgeContent={unreadCount} color="primary">
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
        sx={{
          '& .MuiPaper-root': {
            marginTop: '0.375rem',
          },
        }}
      >
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
          minWidth="15rem"
          padding="0.5rem 1.5rem 0.875rem 1.5rem"
        >
          <Typography variant="h4">Notifications</Typography>
          <Button
            component={Link}
            to="/notifications"
            onClick={handleClose}
            variant="contained"
            color="secondary"
            size="small"
          >
            Voir Tout
          </Button>
        </Stack>

        <Divider />

        {sortedNotifications.length === 0 ? (
          <Stack padding="2rem 1.5rem" spacing="0.25rem" alignItems="center">
            <Typography variant="h5" textAlign="center">
              Rien à signaler !
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
          <Stack divider={<Divider />}>
            {/* AUJOURD'HUI */}
            {todayNotifs.length > 0 && (
              <>
                <Typography
                  sx={{ px: 2, pt: 1 }}
                  variant="body2"
                  color="text.secondary"
                >
                  Aujourd'hui
                </Typography>
                {todayNotifs.map((notif) => (
                  <NotificationItem
                    key={notif.idNotification}
                    notification={notif}
                  />
                ))}
              </>
            )}

            {/* HIER */}
            {yesterdayNotifs.length > 0 && (
              <>
                <Typography
                  sx={{ px: 2, pt: 1 }}
                  variant="body2"
                  color="text.secondary"
                >
                  Hier
                </Typography>
                {yesterdayNotifs.map((notif) => (
                  <NotificationItem
                    key={notif.idNotification}
                    notification={notif}
                  />
                ))}
              </>
            )}

            {/* AVANT */}
            {olderNotifs.length > 0 && (
              <>
                <Typography
                  sx={{ px: 2, pt: 1 }}
                  variant="body2"
                  color="text.secondary"
                >
                  Plus ancien
                </Typography>
                {olderNotifs.map((notif) => (
                  <NotificationItem
                    key={notif.idNotification}
                    notification={notif}
                  />
                ))}
              </>
            )}
          </Stack>
        )}
      </Menu>
    </>
  );
};
