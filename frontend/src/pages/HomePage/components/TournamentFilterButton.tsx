import { IconButton, Badge, Tooltip, Box } from '@mui/material';
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
  disabled?: boolean;
  disabledTooltip?: string;
  onlyStatusFilter?: boolean;
  isAdmin?: boolean;
}

export const TournamentFilterButton = ({
  filters,
  setFilters,
  disabled = false,
  disabledTooltip,
  onlyStatusFilter = false,
  isAdmin = false,
}: TournamentFilterButtonProps) => {
  const { openModal } = useModal();

  const [allTeams, setAllTeams] = useState<Team[]>([]);
  const [allMembers, setAllMembers] = useState<MemberSummaryDto[]>([]);

  const { getAll: getAllTeams } = useTeams({ setTeams: setAllTeams });
  const { getAllSummaries: getAllMembers } = useMembers({
    setSummaries: setAllMembers,
  });

  // Ref to hold the latest local filter state from inside the modal
  const filtersRef = useRef({
    teams: [] as number[],
    members: [] as number[],
    statuses: [] as string[],
  });

  const activeFilterCount = onlyStatusFilter
    ? filters.statuses.length
    : filters.teams.length + filters.members.length + filters.statuses.length;

  const handleOpenFilterModal = () => {
    filtersRef.current = {
      teams: [...filters.teams],
      members: [...filters.members],
      statuses: [...filters.statuses],
    };

    openModal(
      filterModal({
        initialTeams: filters.teams,
        initialMembers: filters.members,
        initialStatuses: filters.statuses,
        showStatusFilter: filters.timeFrame === 'future',
        onlyStatusFilter,
        isAdmin,
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

  const tooltipTitle =
    disabled && disabledTooltip
      ? disabledTooltip
      : activeFilterCount === 0
        ? 'Pas de filtre actif'
        : `${activeFilterCount} filtre${
            activeFilterCount > 1 ? 's' : ''
          } actif${activeFilterCount > 1 ? 's' : ''}`;

  return (
    <Tooltip title={tooltipTitle} arrow placement="bottom">
      <Badge
        badgeContent={activeFilterCount}
        color="primary"
        overlap="circular"
        invisible={activeFilterCount === 0 || disabled}
      >
        <Box component="span">
          <IconButton
            size="medium"
            color="secondary"
            onClick={handleOpenFilterModal}
            disabled={disabled}
          >
            <Tune sx={{ color: 'text.secondary' }} />
          </IconButton>
        </Box>
      </Badge>
    </Tooltip>
  );
};
