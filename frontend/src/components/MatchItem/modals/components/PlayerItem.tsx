import {
  Avatar,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Skeleton,
  ListItemButton,
} from '@mui/material';
import { MemberSummaryDto } from '../../../../types';

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
    <ListItem disablePadding sx={{ mb: '0.5rem' }}>
      <ListItemButton
        onClick={onToggle}
        sx={{
          borderRadius: '0.75rem',
          py: 1.5,
          border: '2px solid',
          // Toggle border color based on selection
          borderColor: isSelected ? 'primary.main' : 'divider',
          backgroundColor: isSelected ? 'action.selected' : 'transparent',
          transition: 'all 0.2s ease-in-out',
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
            sx={{
              border: isSelected ? '2px solid' : 'none',
              borderColor: 'primary.main',
              width: 40,
              height: 40,
            }}
          >
            {player.tag.charAt(0).toUpperCase()}
          </Avatar>
        </ListItemAvatar>

        <ListItemText
          primary={player.tag}
          secondary={isSelected ? 'Sélectionné' : 'Cliquer pour ajouter'}
          slotProps={{
            primary: {
              variant: 'h5',
              fontWeight: isSelected ? 700 : 500,
              color: isSelected ? 'text.primary' : 'text.secondary',
            },
            secondary: {
              variant: 'body2',
              sx: { opacity: isSelected ? 1 : 0.7 },
            },
          }}
        />
      </ListItemButton>
    </ListItem>
  );
};
