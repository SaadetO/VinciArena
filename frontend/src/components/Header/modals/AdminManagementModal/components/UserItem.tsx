import {
  Avatar,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Skeleton,
  Switch,
  Tooltip,
  IconButton,
} from '@mui/material';
import BlockIcon from '@mui/icons-material/Block';
import { Member, AuthenticatedUser } from '../../../../../types';

interface UserItemProps {
  user: Member | null;
  handleToggleAdmin: (user: Member) => void;
  handleBan: (id: number) => void;
  authenticatedUser: AuthenticatedUser | null;
  isPending: boolean;
}

export const UserItem = ({
  user,
  handleToggleAdmin,
  handleBan,
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
        opacity: user.deleted ? 0.4 : 1,
        filter: user.deleted ? 'grayscale(100%)' : 'none',
      }}
      secondaryAction={
        <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          {!user.admin &&
            user.id !== authenticatedUser?.id &&
            !user.deleted && (
              <Tooltip title="Bannir" placement="left" arrow>
                <span>
                  <IconButton
                    color="error"
                    onClick={() => handleBan(user.id)}
                    disabled={isPending || user.deleted}
                  >
                    <BlockIcon />
                  </IconButton>
                </span>
              </Tooltip>
            )}

          <Tooltip
            title={
              user.deleted
                ? 'Utilisateur banni'
                : isPending
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
                disabled={
                  isPending || user.id === authenticatedUser?.id || user.deleted
                }
              />
            </span>
          </Tooltip>
        </span>
      }
    >
      <ListItemAvatar>
        <Avatar
          src={`/assets/avatars/${user.profileImage.path}`}
          alt={user.tag}
        />
      </ListItemAvatar>

      <ListItemText
        primary={`${user.tag} ${user.deleted ? '(banni)' : ''}`}
        secondary={
          <>
            {user.email}
            {user.deleted && (
              <span style={{ color: 'red', marginLeft: '8px' }}>(Banni)</span>
            )}
          </>
        }
        sx={{
          '& .MuiTypography-root': {
            whiteSpace: 'nowrap',
            textOverflow: 'ellipsis',
            overflow: 'hidden',
            color: user.deleted ? 'gray' : 'inherit',
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
