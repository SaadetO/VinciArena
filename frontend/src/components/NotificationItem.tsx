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

  // Logic: Only clickable if it has a reference ID
  const isClickable = !!notification.idReference;

  if (!authenticatedUser) return null;

  return (
    <ListItem
      //  only trigger if there is a destination
      onClick={
        isClickable ? () => handleNotificationClick(notification) : undefined
      }
      sx={{
        alignItems: 'center',
        transition: 'all 0.2s ease-in-out',
        backgroundColor: (theme) =>
          notification.isRead ? 'transparent' : theme.palette.background.s3,

        // opacity for read vs unread
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
                // stops bubbling
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
        primary={notification.content}
        secondary={formatRelativeTime(notification.dateTime)}
        slotProps={{
          primary: {
            variant: 'h5',
            color: notification.isRead ? 'text.secondary' : 'text.primary',
            sx: {
              textOverflow: 'ellipsis',
              overflow: 'hidden',
              whiteSpace: 'nowrap',
              fontWeight: notification.isRead ? 400 : 800,
            },
          },
          secondary: {
            variant: 'body2',
            sx: {
              color: 'text.disabled',
              textOverflow: 'ellipsis',
              overflow: 'hidden',
              whiteSpace: 'nowrap',
              mt: 0.5, // separate time and content
            },
          },
        }}
      />
    </ListItem>
  );
};
