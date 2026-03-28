import { Stack, Typography } from '@mui/material';
import { TournamentDto } from '../../types';
import { TournamentDate } from './components/TournamentDate';
import { TournamentStatusChip } from './components/TournamentStatusChip';

interface TournamentItemProps {
  tournament: TournamentDto;
}

export const TournamentItem = ({ tournament }: TournamentItemProps) => {
  return (
    <Stack
      bgcolor="background.s2"
      borderRadius="0.75rem"
      overflow="hidden"
      border="1px solid"
      borderColor="divider"
    >
      <Stack alignItems="center" justifyContent="center" height="4rem">
        <Typography variant="h3" textAlign="center">
          {tournament.name}
        </Typography>
      </Stack>
      <Stack
        width="100%"
        bgcolor="background.s3"
        height="2.5rem"
        alignItems="center"
        justifyContent="center"
        direction="row"
        px="0.75rem"
      >
        <TournamentDate
          startDate={tournament.startDate}
          endDate={tournament.endDate}
        />
        <Typography variant="body2" color="text.secondary">
          {tournament.description}
        </Typography>
        <Stack color="text.secondary" alignItems="flex-end" flex={1}>
          <TournamentStatusChip status={tournament.tournamentStatus} />
        </Stack>
      </Stack>
    </Stack>
  );
};
