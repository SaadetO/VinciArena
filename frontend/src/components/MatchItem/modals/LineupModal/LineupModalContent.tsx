import { List, CircularProgress, Stack, Typography, Box } from '@mui/material';
import { PlayerItem } from './components/PlayerItem';
import { MemberSummaryDto } from '../../../../types';
import { useLineup } from './LineupContext';
import { LineupProvider } from './LineupProvider';

interface LineupModalProps {
  matchId: number;
  teamId: number;
  onSelectionChange: (ids: number[]) => void;
}

// component using the context
const LineupModalContent = () => {
  const { allMembers, loading, selectedIds, remainingPlaces, handleToggle } =
    useLineup();

  if (loading)
    return (
      <Stack alignItems="center" p={4} minHeight="200px">
        <CircularProgress />
      </Stack>
    );

  return (
    <Box>
      <Box
        sx={{
          position: 'sticky',
          top: '-8px',
          bgcolor: 'background.paper',
          zIndex: 10,
          pb: 2,
        }}
      >
        <Typography
          variant="body2"
          textAlign="center"
          color={remainingPlaces > 0 ? 'secondary' : 'success.main'}
        >
          {remainingPlaces > 0
            ? `Il vous reste ${remainingPlaces} place${remainingPlaces > 1 ? 's' : ''} à définir`
            : `Votre équipe est prête !`}
        </Typography>
      </Box>
      <List sx={{ width: '100%', maxWidth: 500, mx: 'auto' }}>
        {allMembers.map((member: MemberSummaryDto) => (
          <PlayerItem
            key={member.id}
            player={member}
            isSelected={selectedIds.includes(member.id)}
            onToggle={() => handleToggle(member.id)}
          />
        ))}
      </List>
    </Box>
  );
};

// wrap the modal in the provider
export const LineupModal = (props: LineupModalProps) => (
  <LineupProvider {...props}>
    <LineupModalContent />
  </LineupProvider>
);
