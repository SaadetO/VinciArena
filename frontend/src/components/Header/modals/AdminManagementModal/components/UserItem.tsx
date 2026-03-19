import {
  Avatar,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Skeleton,
  Switch,
  Tooltip,
} from '@mui/material';
import { Member, AuthenticatedUser } from '../../../../../types';

interface UserItemProps {
  user: Member | null;
  handleToggleAdmin: (user: Member) => void;
  authenticatedUser: AuthenticatedUser | null;
  isPending: boolean;
}

export const UserItem = ({
  user,
  handleToggleAdmin,
  authenticatedUser,
  isPending,
}: UserItemProps) => {
  if (!user) {
    return (
      <ListItem
        sx={{
          borderRadius: '0.5rem',
          mb: '0.25rem',
        }}
        secondaryAction={
          <Skeleton
            variant="rectangular"
            width={46}
            height={26}
            sx={{ borderRadius: '1rem' }}
          />
        }
      >
        <ListItemAvatar>
          <Skeleton variant="circular">
            <Avatar />
          </Skeleton>
        </ListItemAvatar>
        <ListItemText
          primary={<Skeleton variant="text" width="60%" height={22} />}
          secondary={<Skeleton variant="text" width="40%" height={18} />}
        />
      </ListItem>
    );
  }

  return (
    <ListItem
      key={user.id}
      sx={{
        borderRadius: '0.5rem',
        mb: '0.25rem',
      }}
      secondaryAction={
        <Tooltip
          title={
            isPending
              ? 'Changement en cours...'
              : user.id === authenticatedUser?.id
                ? 'Impossible de modifier votre propre statut'
                : user.admin
                  ? 'Désactiver admin'
                  : 'Activer admin'
          }
          placement="left"
          arrow
        >
          <span>
            <Switch
              edge="end"
              checked={user.admin}
              onChange={() => !isPending && handleToggleAdmin(user)}
              disabled={isPending || user.id === authenticatedUser?.id}
            />
          </span>
        </Tooltip>
      }
    >
      <ListItemAvatar>
        <Avatar
          src={`/assets/avatars/${user.profileImage.path}`}
          alt={user.tag}
        />
      </ListItemAvatar>
      <ListItemText
        primary={user.tag}
        secondary={user.email}
        sx={{
          '& .MuiTypography-root': {
            whiteSpace: 'nowrap',
            textOverflow: 'ellipsis',
            overflow: 'hidden',
          },
        }}
        slotProps={{
          primary: { variant: 'h5' },
          secondary: { variant: 'body1' },
        }}
      />
    </ListItem>
  );
};
