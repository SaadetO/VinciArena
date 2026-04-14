import { Stack, Typography } from '@mui/material';
import { MatchDayGroup } from './MatchDayGroup';
import { DayGroup } from '../utils/matchUtils';

interface MatchYearGroupProps {
  year: string;
  daysData: DayGroup[];
  showYearLabel?: boolean;
}

export const MatchYearGroup = ({
  year,
  daysData,
  showYearLabel = true,
}: MatchYearGroupProps) => {
  return (
    <Stack spacing="1rem">
      {showYearLabel && (
        <Stack
          position="sticky"
          top="0.5rem"
          zIndex={1}
          bgcolor="background.s0"
          width="fit-content"
          borderRadius="0.75rem"
          padding=" 0.5rem 1rem"
          ml="0.75rem !important"
        >
          <Typography variant="h2">{year}</Typography>
        </Stack>
      )}
      {daysData.map((dayData) => (
        <MatchDayGroup
          key={dayData.dateKey}
          day={dayData.day}
          matches={dayData.matches}
        />
      ))}
    </Stack>
  );
};
