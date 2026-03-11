// NotificationItem.tsx
import {
  ListItem,
  ListItemText,
  Divider,
  Box,
  IconButton,
  Tooltip,
} from '@mui/material';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import FiberManualRecordIcon from '@mui/icons-material/FiberManualRecord';
import { NotificationDto } from '../types';
import { useContext } from 'react';
import { UserContext } from '../contexts/UserContext';

interface Props {
  notification: NotificationDto;
  isLast: boolean;
  onRefresh: () => void;
}

export const NotificationItem = ({
  notification,
  isLast,
  onRefresh,
}: Props) => {
  const { authenticatedUser } = useContext(UserContext);
  if (!authenticatedUser) return;
  const handleMarkAsReadClick = () => {
    markAsRead(notification.idNotification);
  };
  const markAsRead = async (idNotification: number) => {
    try {
      const response = await fetch(
        `/api/notifications/${idNotification}/read`,
        {
          method: 'PATCH',
          headers: {
            Authorization: authenticatedUser.token,
          },
        },
      );
      if (response.ok) {
        onRefresh();
      }
    } catch (err) {
      console.error('Failed to update notification status', err);
    }
  };

  return (
    <Box>
      <ListItem
        sx={{
          py: 2,
          padding: 2.5,
          bgcolor: notification.isRead ? 'transparent' : 'action.hover',
        }}
        secondaryAction={
          !notification.isRead && (
            <Tooltip title="Marquer comme lu">
              <IconButton onClick={() => handleMarkAsReadClick()}>
                <CheckCircleOutlineIcon color="primary" />
              </IconButton>
            </Tooltip>
          )
        }
      >
        {!notification.isRead && (
          <FiberManualRecordIcon
            sx={{ fontSize: 12, color: 'primary.main', mr: 2, mt: 1 }}
          />
        )}
        <ListItemText
          primary={notification.content}
          secondary={new Date(notification.dateTime).toLocaleString('fr-FR')}
          slotProps={{
            primary: {
              variant: 'body1',
              fontWeight: notification.isRead ? 400 : 700,
              color: notification.isRead ? 'text.secondary' : 'text.primary',
              sx: {
                wordBreak: 'break-word',
                whiteSpace: 'normal',
                display: 'block',
              },
            },
            secondary: {
              variant: 'caption',
            },
          }}
        />
      </ListItem>
      {!isLast && <Divider component="li" />}
    </Box>
  );
};
