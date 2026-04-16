import { Stack, Typography } from '@mui/material';
import { MatchSummaryDto, TournamentStatus } from '../types';
import { MatchItem } from './MatchItem';

interface MatchDayGroupProps {
  day: string;
  matches: MatchSummaryDto[];
  tournamentStatus: TournamentStatus;
}

export const MatchDayGroup = ({
  day,
  matches,
  tournamentStatus,
}: MatchDayGroupProps) => {
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
        <MatchItem
          key={match.idMatch}
          match={match}
          tournamentStatus={tournamentStatus}
        />
      ))}
    </Stack>
  );
};
