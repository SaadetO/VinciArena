import { MemberSummaryDto } from '../../../types';
import { Stack } from '@mui/material';
import { PlayerItem } from '../components/PlayerItem';
import { PlayerItemListSkeleton } from '../components/PlayerItemListSkeleton';
import { useLineupModalContent } from '../hooks/useLineupModalContent';

interface LineupModalContentProps {
  matchId: number;
  teamId: number;
  onChange: (ids: number[]) => void;
}

export const LineupModalContent = ({
  matchId,
  teamId,
  onChange,
}: LineupModalContentProps) => {
  const { allMembers, selectedIds, loading, handleToggle } =
    useLineupModalContent({ matchId, teamId, onChange });

  if (loading) return <PlayerItemListSkeleton />;

  return (
    <Stack spacing="0.25rem" px="0.625rem">
      {allMembers.map((member: MemberSummaryDto) => (
        <PlayerItem
          key={member.id}
          player={member}
          isSelected={selectedIds.includes(member.id)}
          onToggle={() => handleToggle(member.id)}
        />
      ))}
    </Stack>
  );
};
