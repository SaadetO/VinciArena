import { Stack } from '@mui/material';
import { TournamentSearchBar } from './TournamentSearchBar';
import { TournamentTimeFrameTabs } from './TournamentTimeFrameTabs';
import { TournamentFilterButton } from './TournamentFilterButton';
import { TournamentFilters } from '../../../utils/tournamentUtils';

interface TournamentControlsProps {
  filters: TournamentFilters;
  setFilters: (filters: TournamentFilters) => void;
}

export const TournamentControls = ({
  filters,
  setFilters,
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
      zIndex={1}
      sx={{
        outline: '4px solid',
        outlineColor: 'background.s0',
      }}
    >
      <TournamentTimeFrameTabs
        timeFrame={filters.timeFrame}
        setTimeFrame={(timeFrame) => setFilters({ ...filters, timeFrame })}
      />
      <Stack direction="row" alignItems="center" spacing="0.75rem">
        <TournamentSearchBar
          searchQuery={filters.searchQuery}
          setSearchQuery={(searchQuery) =>
            setFilters({ ...filters, searchQuery })
          }
        />
        <TournamentFilterButton filters={filters} setFilters={setFilters} />
      </Stack>
    </Stack>
  );
};
