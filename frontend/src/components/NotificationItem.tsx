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
  if (!authenticatedUser) return;
  return (
    <ListItem
      onClick={
        isClickable ? () => handleNotificationClick(notification) : undefined
      }
      sx={{
        backgroundColor: (theme) =>
          notification.isRead ? 'transparent' : theme.palette.background.s3,
        alignItems: 'center',
        cursor: isClickable ? 'pointer' : 'default',
        '&:hover': {
          backgroundColor: (theme) =>
            isClickable ? theme.palette.action.hover : 'transparent',
        },
      }}
      secondaryAction={
        !notification.isRead && (
          <Tooltip title="Marquer comme lu" placement="left" arrow>
            <IconButton
              size="small"
              color="primary"
              onClick={(e) => {
                // exclude navigation when mark as read is clicked
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
            color: 'text.primary',
            sx: {
              textOverflow: 'ellipsis',
              overflow: 'hidden',
              whiteSpace: 'nowrap',
            },
          },
          secondary: {
            variant: 'body2',
            sx: {
              textOverflow: 'ellipsis',
              overflow: 'hidden',
              whiteSpace: 'nowrap',
            },
          },
        }}
      />
    </ListItem>
  );
};
