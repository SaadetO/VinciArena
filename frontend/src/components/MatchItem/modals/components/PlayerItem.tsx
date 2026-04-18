import {
  ListItem,
  ListItemButton,
  ListItemText,
  Checkbox,
  Avatar,
} from '@mui/material';
import { MemberSummaryDto } from '../../../../types';

interface PlayerItemProps {
  player: MemberSummaryDto;
  isSelected: boolean;
  onToggle: () => void;
}

export const PlayerItem = ({
  player,
  isSelected,
  onToggle,
}: PlayerItemProps) => {
  return (
    <ListItem
      disablePadding
      sx={{
        borderRadius: '0.75rem',
        marginBottom: '0.25rem',
        backgroundColor: isSelected ? 'action.hover' : 'transparent',
        transition: 'background-color 0.2s',
      }}
    >
      <ListItemButton onClick={onToggle} sx={{ borderRadius: '0.75rem' }}>
        <Avatar
          sx={{
            width: 32,
            height: 32,
            marginRight: '1rem',
            fontSize: '0.875rem',
          }}
        >
          {player.tag.charAt(0).toUpperCase()}
        </Avatar>
        <ListItemText
          primary={player.tag}
          primaryTypographyProps={{ fontWeight: isSelected ? 600 : 400 }}
        />
        <Checkbox checked={isSelected} edge="end" />
      </ListItemButton>
    </ListItem>
  );
};
