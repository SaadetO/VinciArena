import { useEffect, useState } from 'react';
import {
  Checkbox,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  CircularProgress,
  Stack,
} from '@mui/material';
import { MemberSummaryDto } from '../../../types';
import { useMatches } from '../../../hooks/useMatches';

interface LineupModalProps {
  matchId: number;
  teamId: number;
  // This callback allows the modal's "Confirm" button to get the final list
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

  useEffect(() => {
    const loadData = async () => {
      try {
        // Use the logic from your hook instead of raw fetch
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
        // The hook's onError handles the controller state,
        // but we catch here to stop the loading spinner
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [matchId, teamId]);

  const handleToggle = (id: number) => {
    const newSelection = selectedIds.includes(id)
      ? selectedIds.filter((i) => i !== id)
      : [...selectedIds, id];

    setSelectedIds(newSelection);
    onSelectionChange(newSelection); // Keep the parent (Modal) in sync
  };

  if (loading)
    return (
      <Stack alignItems="center" p={4}>
        <CircularProgress />
      </Stack>
    );

  return (
    <List>
      {allMembers.map((member) => (
        <ListItem key={member.id} disablePadding>
          <ListItemButton onClick={() => handleToggle(member.id)} dense>
            <Checkbox
              edge="start"
              checked={selectedIds.includes(member.id)}
              tabIndex={-1}
              disableRipple
            />
            <ListItemText primary={member.tag} />
          </ListItemButton>
        </ListItem>
      ))}
    </List>
  );
};
