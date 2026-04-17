import { Stack, Typography } from '@mui/material';
import { MatchSummaryDto } from '../types';
import { MatchItem } from './MatchItem';

interface MatchDayGroupProps {
  day: string;
  matches: MatchSummaryDto[];
}

export const MatchDayGroup = ({ day, matches }: MatchDayGroupProps) => {
  return (
    <Stack
      padding="1.5rem 1rem 1rem"
      spacing="0.75rem"
      bgcolor="background.s1"
      borderRadius="1.5rem"
    >
      <Typography variant="h4" pb="1rem">
        {day}
      </Typography>
      {matches.map((match) => (
        <MatchItem key={match.idMatch} match={match} />
      ))}
    </Stack>
  );
};
