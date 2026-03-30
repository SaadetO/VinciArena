import { Stack, Typography } from '@mui/material';
import { TournamentMonthGroup } from './TournamentMonthGroup';
import { MonthGroup } from '../utils/tournamentUtils';

interface TournamentYearGroupProps {
  year: string;
  monthsData: MonthGroup[];
}

export const TournamentYearGroup = ({
  year,
  monthsData,
}: TournamentYearGroupProps) => {
  return (
    <Stack spacing="1rem">
      <Stack
        position="sticky"
        top="6.5rem"
        zIndex={1}
        bgcolor="background.s0"
        width="fit-content"
        borderRadius="0.75rem"
        padding=" 0.5rem 1rem"
        ml="0.75rem !important"
      >
        <Typography variant="h2">{year}</Typography>
      </Stack>
      {monthsData.map((monthData) => (
        <TournamentMonthGroup
          key={monthData.month}
          month={monthData.month}
          monthTournaments={monthData.tournaments}
        />
      ))}
    </Stack>
  );
};
