import { IconButton, Badge, Tooltip, Box } from '@mui/material';
import { useRef } from 'react';
import { Sliders } from '@gravity-ui/icons';
import { TournamentFilters } from '../../../utils/tournamentUtils';
import { useModal } from '../../../hooks/useModal';
import { filterModal } from '../modals/filterModal';

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

  // Ref to hold the latest local filter state from inside the modal
  const filtersRef = useRef<Partial<TournamentFilters>>({
    teams: [],
    members: [],
    statuses: [],
    dates: {
      minDate: undefined,
      maxDate: undefined,
    },
  });

  const activeFilterCount = onlyStatusFilter
    ? filters.statuses.length
    : filters.teams.length +
      filters.members.length +
      filters.statuses.length +
      (filters.dates?.minDate ? 1 : 0) +
      (filters.dates?.maxDate ? 1 : 0);

  const handleOpenFilterModal = () => {
    filtersRef.current = {
      teams: [...filters.teams],
      members: [...filters.members],
      statuses: [...filters.statuses],
      dates: { ...filters.dates },
    };

    openModal(
      filterModal({
        initialFilters: {
          teams: filters.teams,
          members: filters.members,
          statuses: filters.statuses,
          dates: filters.dates,
        },
        showStatusFilter: filters.timeFrame === 'future',
        onlyStatusFilter,
        isAdmin,
        onFiltersChange: (f) => {
          filtersRef.current = f;
        },
        onConfirm: (close) => {
          setFilters({ ...filters, ...filtersRef.current });
          console.log(filtersRef.current);
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
            <Sliders style={{ color: 'text.secondary' }} />
          </IconButton>
        </Box>
      </Badge>
    </Tooltip>
  );
};
