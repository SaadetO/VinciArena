import {
  ListItem,
  ListItemText,
  Divider,
  IconButton,
  Tooltip,
  Stack,
  Skeleton,
} from '@mui/material';
import { NotificationDto } from '../types';
import { useContext } from 'react';
import { UserContext } from '../contexts/UserContext';
import { MarkEmailReadOutlined } from '@mui/icons-material';
import { formatRelativeTime } from '../utils/date';

interface Props {
  notification: NotificationDto;
  loading: boolean;
  onMarkAsRead: () => void;
}

export const NotificationItem = ({
  notification,
  loading,
  onMarkAsRead,
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
        onMarkAsRead();
      }
    } catch (err) {
      console.error('Failed to update notification status', err);
    }
  };

  if (loading)
    return (
      <Stack>
        <ListItem
          sx={{ alignItems: 'center' }}
          secondaryAction={
            <Skeleton variant="rounded" width={32} height={32} />
          }
        >
          <ListItemText
            primary={<Skeleton variant="text" width="80%" height={20} />}
            secondary={<Skeleton variant="text" width="40%" height={16} />}
          />
        </ListItem>
        <Divider
          component="li"
          sx={{ '&:last-of-type': { display: 'none' } }}
        />
      </Stack>
    );
  return (
    <Stack>
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
      <Divider component="li" sx={{ '&:last-of-type': { display: 'none' } }} />
    </Stack>
  );
};
