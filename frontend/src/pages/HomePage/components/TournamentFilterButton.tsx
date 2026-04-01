import { IconButton, Badge, Tooltip } from '@mui/material';
import { useRef, useState } from 'react';
import { Tune } from '@mui/icons-material';
import { TournamentFilters } from '../../../utils/tournamentUtils';
import { useModal } from '../../../hooks/useModal';
import { filterModal } from '../modals/filterModal';
import { useTeams } from '../../../hooks/useTeams';
import { useMembers } from '../../../hooks/useMembers';
import { MemberSummaryDto, Team } from '../../../types';

interface TournamentFilterButtonProps {
  filters: TournamentFilters;
  setFilters: (filters: TournamentFilters) => void;
}

export const TournamentFilterButton = ({
  filters,
  setFilters,
}: TournamentFilterButtonProps) => {
  const { openModal } = useModal();

  const [allTeams, setAllTeams] = useState<Team[]>([]);
  const [allMembers, setAllMembers] = useState<MemberSummaryDto[]>([]);

  const { getAll: getAllTeams } = useTeams({ setTeams: setAllTeams });
  const { getAllSummaries: getAllMembers } = useMembers({
    setSummaries: setAllMembers,
  });

  // Ref to hold the latest local filter state from inside the modal
  const filtersRef = useRef({ teams: [] as number[], members: [] as number[] });

  const activeFilterCount = filters.teams.length + filters.members.length;

  const handleOpenFilterModal = () => {
    filtersRef.current = {
      teams: [...filters.teams],
      members: [...filters.members],
    };

    openModal(
      filterModal({
        initialTeams: filters.teams,
        initialMembers: filters.members,
        cachedTeams: allTeams,
        cachedMembers: allMembers,
        fetchTeams: getAllTeams,
        fetchMembers: getAllMembers,
        onFiltersChange: (f) => {
          filtersRef.current = f;
        },
        onConfirm: (close) => {
          setFilters({ ...filters, ...filtersRef.current });
          close();
        },
      }),
    );
  };

  return (
    <Tooltip
      title={
        activeFilterCount === 0
          ? 'Pas de filtre actif'
          : `${activeFilterCount} filtre${
              activeFilterCount > 1 ? 's' : ''
            } actif${activeFilterCount > 1 ? 's' : ''}`
      }
      arrow
      placement="bottom"
    >
      <Badge
        badgeContent={activeFilterCount}
        color="primary"
        overlap="circular"
        invisible={activeFilterCount === 0}
      >
        <IconButton
          size="medium"
          color="secondary"
          onClick={handleOpenFilterModal}
        >
          <Tune sx={{ color: 'text.secondary' }} />
        </IconButton>
      </Badge>
    </Tooltip>
  );
};
