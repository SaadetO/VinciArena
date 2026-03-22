import { ListItem, ListItemText, IconButton, Tooltip } from '@mui/material';
import { NotificationDto } from '../types';
import { useContext } from 'react';
import { UserContext } from '../contexts/UserContext';
import { MarkEmailReadOutlined } from '@mui/icons-material';
import { formatRelativeTime } from '../utils/date';
import { useNotifications } from '../hooks/useNotifications';

interface Props {
  notification: NotificationDto;
}

export const NotificationItem = ({ notification }: Props) => {
  const { authenticatedUser } = useContext(UserContext);
  const { markAsRead } = useNotifications();
  if (!authenticatedUser) return;
  return (
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
              onClick={() => markAsRead(notification.idNotification)}
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
