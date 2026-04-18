import { useEffect, useState } from 'react';
import { List, CircularProgress, Stack, Typography, Box } from '@mui/material';
import { MemberSummaryDto } from '../../../types';
import { useMatches } from '../../../hooks/useMatches';
import { PlayerItem } from './components/PlayerItem';

interface LineupModalProps {
  matchId: number;
  teamId: number;
  onSelectionChange: (ids: number[]) => void;
}

export const LineupModal = ({
  matchId,
  teamId,
  onSelectionChange,
}: LineupModalProps) => {
  const [allMembers, setAllMembers] = useState<MemberSummaryDto[]>([]);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);

  const { getLineup, getAvailableMembers } = useMatches();

  // 1. Calculate this on the fly so it's always accurate
  const remainingPlaces = Math.max(0, 4 - selectedIds.length);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [members, lineup] = await Promise.all([
          getAvailableMembers({ matchId }),
          getLineup({ matchId, teamId }),
        ]);

        if (members) setAllMembers(members);
        if (lineup) {
          const initialIds = lineup.players.map((p: MemberSummaryDto) => p.id);
          setSelectedIds(initialIds);
          onSelectionChange(initialIds);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [getAvailableMembers, getLineup, matchId, onSelectionChange, teamId]);

  const handleToggle = (id: number) => {
    const isAlreadySelected = selectedIds.includes(id);

    const newSelection = isAlreadySelected
      ? selectedIds.filter((selectedId: number) => selectedId !== id) // Remove
      : [...selectedIds, id]; // Add

    setSelectedIds(newSelection);
    onSelectionChange(newSelection);
  };

  if (loading)
    return (
      <Stack alignItems="center" p={4}>
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

      <List sx={{ pt: 1 }}>
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
