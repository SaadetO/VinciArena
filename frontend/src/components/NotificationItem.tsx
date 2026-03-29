import { ListItem, ListItemText, IconButton, Tooltip } from '@mui/material';
import { NotificationDto } from '../types';
import { useContext } from 'react';
import { UserContext } from '../contexts/UserContext';
import { MarkEmailReadOutlined } from '@mui/icons-material';
import { formatRelativeTime } from '../utils/date';
import { useNotifications } from '../hooks/useNotifications';
import { NotificationContext } from '../contexts/NotificationContext';

interface Props {
  notification: NotificationDto;
}

export const NotificationItem = ({ notification }: Props) => {
  const { authenticatedUser } = useContext(UserContext);
  const { handleNotificationClick } = useContext(NotificationContext);
  const { markAsRead } = useNotifications();

  const isClickable = !!notification.idReference;

  if (!authenticatedUser) return null;

  return (
    <ListItem
      onClick={
        isClickable ? () => handleNotificationClick(notification) : undefined
      }
      sx={{
        alignItems: 'center',
        transition: 'all 0.2s ease-in-out',
        backgroundColor: (theme) =>
          notification.isRead ? 'transparent' : theme.palette.background.s3,
        opacity: notification.isRead ? 0.8 : 1,
        cursor: isClickable ? 'pointer' : 'default',
        '&:hover': {
          backgroundColor: (theme) =>
            isClickable
              ? theme.palette.action.hover
              : notification.isRead
                ? 'transparent'
                : theme.palette.background.s3,
          opacity: isClickable ? 1 : notification.isRead ? 0.8 : 1,
        },
      }}
      secondaryAction={
        !notification.isRead && (
          <Tooltip title="Marquer comme lu" placement="left" arrow>
            <IconButton
              size="small"
              color="primary"
              onClick={(e) => {
                e.stopPropagation();
                markAsRead(notification.idNotification);
              }}
            >
              <MarkEmailReadOutlined />
            </IconButton>
          </Tooltip>
        )
      }
    >
      <ListItemText
        primary={
          <span style={{ whiteSpace: 'pre-line' }}>{notification.content}</span>
        }
        secondary={formatRelativeTime(notification.dateTime)}
        slotProps={{
          primary: {
            variant: 'h5',
            fontWeight: notification.isRead ? 400 : 800,
          },
          secondary: {
            variant: 'body2',
            sx: {
              color: 'text.disabled',
              mt: 0.5,
            },
          },
        }}
      />
    </ListItem>
  );
};
