// NotificationItem.tsx
import {
  ListItem,
  ListItemText,
  Divider,
  Box,
  IconButton,
  Tooltip,
} from '@mui/material';
import { NotificationDto } from '../types';
import { useContext } from 'react';
import { UserContext } from '../contexts/UserContext';
import { MarkEmailReadOutlined } from '@mui/icons-material';
import { formatRelativeTime } from '../utils/date';

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
          backgroundColor: (theme) =>
            notification.isRead ? 'transparent' : theme.palette.background.s3,
          alignItems: 'center',
        }}
        secondaryAction={
          !notification.isRead && (
            <Tooltip title="Marquer comme lu" placement="left" arrow>
              <IconButton
                size="small"
                color="primary"
                onClick={() => handleMarkAsReadClick()}
              >
                <MarkEmailReadOutlined />
              </IconButton>
            </Tooltip>
          )
        }
      >
        <ListItemText
          primary={notification.content}
          secondary={formatRelativeTime(notification.dateTime)}
          slotProps={{
            primary: {
              variant: 'h5',
              color: 'text.primary',
            },
            secondary: {
              variant: 'body2',
            },
          }}
        />
      </ListItem>
      {!isLast && <Divider component="li" />}
    </Box>
  );
};
