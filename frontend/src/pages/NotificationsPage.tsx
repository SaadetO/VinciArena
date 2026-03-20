import { Box, Container, List, Typography } from '@mui/material';
import { NotificationItem } from '../components/NotificationItem';
import { useNotifications } from '../hooks/useNotifications';

export const NotificationsPage = () => {
  const { notifications, markAsRead, isGettingNotifications } = useNotifications();
  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3, gap: 1.5 }}>
        <Typography variant="h4" component="h1" fontWeight="bold">
          Historique des notifications
        </Typography>
      </Box>
      <List sx={{ p: 0 }}>
        {notifications.map((notif) => (
          <NotificationItem
            loading={isGettingNotifications && notifications.length === 0}
            key={notif.idNotification}
            notification={notif}
            onMarkAsRead={() => {
              markAsRead(notif.idNotification); 
            }}
          />
        ))}
      </List>
    </Container>
  );
};
