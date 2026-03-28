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
        top="0.5rem"
        zIndex={1}
        bgcolor="background.s0"
        width="fit-content"
        borderRadius="0.5rem"
        padding="0.5rem"
        ml="1rem !important"
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
