import { Stack } from '@mui/material';
import { TournamentSearchBar } from './TournamentSearchBar';
import { TournamentTimeFrameTabs } from './TournamentTimeFrameTabs';
import { TournamentFilterButton } from './TournamentFilterButton';
import { TournamentFilters } from '../../../utils/tournamentUtils';

interface TournamentControlsProps {
  filters: TournamentFilters;
  setFilters: (filters: TournamentFilters) => void;
  showFilterButton?: boolean;
  disabledFilter?: boolean;
  disabledFilterTooltip?: string;
  onlyStatusFilter?: boolean;
  isAdmin?: boolean;
}

export const TournamentControls = ({
  filters,
  setFilters,
  showFilterButton = true,
  disabledFilter = false,
  disabledFilterTooltip,
  onlyStatusFilter = false,
  isAdmin = false,
}: TournamentControlsProps) => {
  return (
    <Stack
      justifyContent="space-between"
      direction="row"
      bgcolor="background.s1"
      borderRadius="0 0 1.5rem 1.5rem"
      px="1.5rem"
      height="6rem"
      alignItems="center"
      position="sticky"
      top="0"
      zIndex={10}
      sx={{
        outline: '4px solid',
        outlineColor: 'background.s0',
      }}
    >
      <TournamentTimeFrameTabs
        timeFrame={filters.timeFrame}
        setTimeFrame={(timeFrame) =>
          setFilters({ ...filters, timeFrame, statuses: [] })
        }
      />
      <Stack direction="row" alignItems="center" spacing="0.75rem">
        <TournamentSearchBar
          searchQuery={filters.searchQuery}
          setSearchQuery={(searchQuery) =>
            setFilters({ ...filters, searchQuery })
          }
        />
        {showFilterButton && (
          <TournamentFilterButton
            filters={filters}
            setFilters={setFilters}
            disabled={disabledFilter}
            disabledTooltip={disabledFilterTooltip}
            onlyStatusFilter={onlyStatusFilter}
            isAdmin={isAdmin}
          />
        )}
      </Stack>
    </Stack>
  );
};
