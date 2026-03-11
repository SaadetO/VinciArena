import { useContext, useEffect, useState } from 'react';
import { UserContext } from '../contexts/UserContext';
import { LoadingIcon } from '../components/LoadingIcon';
import { Box, Container, List, Typography } from '@mui/material';
import { NotificationItem } from '../components/NotificationItem';
import { NotificationDto } from '../types';

export const NotificationsPage = () => {
  const [allNotifications, setAllNotifications] = useState<NotificationDto[]>(
    [],
  );
  const [loading, setLoading] = useState(true);
  const { authenticatedUser } = useContext(UserContext);

  const fetchAllNotifications = async () => {
    if (!authenticatedUser?.token) return;
    try {
      const response = await fetch(
        `/api/notifications/member/${authenticatedUser.id}`,
        { headers: { Authorization: authenticatedUser.token } },
      );
      if (response.ok) {
        const data = await response.json();
        console.log('Data from server:', data[0]);
        setAllNotifications(data);
      }
    } catch (err) {
      console.error('Failed to fetch allNotifications', err);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    fetchAllNotifications();
  }, [authenticatedUser]);
  if (loading) return <LoadingIcon></LoadingIcon>;
  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3, gap: 1.5 }}>
        <Typography variant="h4" component="h1" fontWeight="bold">
          Historique des notifications
        </Typography>
      </Box>
      <List sx={{ p: 0 }}>
        {allNotifications.map((notif, index) => (
          <NotificationItem
            key={notif.idNotification}
            notification={notif}
            isLast={index === allNotifications.length - 1}
            onRefresh={fetchAllNotifications}
          />
        ))}
      </List>
    </Container>
  );
};
