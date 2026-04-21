import {
  Avatar,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Skeleton,
  ListItemButton,
} from '@mui/material';
import { MemberSummaryDto } from '../../../../../types';

interface PlayerItemProps {
  player: MemberSummaryDto | null;
  isSelected: boolean;
  onToggle: () => void;
}

export const PlayerItem = ({
  player,
  isSelected,
  onToggle,
}: PlayerItemProps) => {
  if (!player) {
    return (
      <ListItem sx={{ px: 0, mb: '0.5rem' }}>
        <Skeleton
          variant="rectangular"
          width="100%"
          height={56}
          sx={{ borderRadius: '0.75rem' }}
        />
      </ListItem>
    );
  }

  return (
    <ListItem disablePadding sx={{ mb: '0.25rem', borderRadius: '0.5rem' }}>
      <ListItemButton
        onClick={onToggle}
        sx={{
          borderRadius: '1.5rem',
          py: 0.5,
          border: '2px solid',
          // border color depends on if its selected or not
          borderColor: isSelected ? 'primary.main' : 'divider',
          backgroundColor: isSelected ? 'action.selected' : 'transparent',
          '&:hover': {
            borderColor: isSelected ? 'primary.main' : 'text.secondary',
            backgroundColor: isSelected ? 'action.selected' : 'action.hover',
          },
        }}
      >
        <ListItemAvatar>
          <Avatar
            src={player.avatar ? `/assets/avatars/${player.avatar}` : undefined}
            alt={player.tag}
          >
            {player.tag.charAt(0).toUpperCase()}
          </Avatar>
        </ListItemAvatar>

        <ListItemText
          primary={player.tag}
          secondary={isSelected ? 'Sélectionné' : 'Cliquez pour ajouter'}
          slotProps={{
            primary: {
              variant: 'h5',
            },
            secondary: {
              variant: 'body1',
              sx: { opacity: isSelected ? 1 : 0.7 },
            },
          }}
        />
      </ListItemButton>
    </ListItem>
  );
};
