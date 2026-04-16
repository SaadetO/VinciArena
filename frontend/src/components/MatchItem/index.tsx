import { Grid2, Stack, Typography } from '@mui/material';
import { MatchSummaryDto, TournamentStatus } from '../../types';
import { VersusItem } from './components/VersusItem';
import dayjs from 'dayjs';
import { Link } from 'react-router-dom';
import { MatchMenu } from './components/MatchMenu';

interface MatchItemProps {
  match: MatchSummaryDto;
  tournamentStatus: TournamentStatus;
}

export const MatchItem = ({ match, tournamentStatus }: MatchItemProps) => {
  return (
    <Stack
      bgcolor="background.s2"
      borderRadius="0.75rem"
      overflow="hidden"
      border="1px solid"
      borderColor="divider"
    >
      <Grid2 height="4rem" spacing="1rem" container>
        <Grid2 pl="0.75rem" size={3} display="flex" alignItems="center">
          <Typography
            variant="h3"
            color={
              dayjs(match.dateHour).isBefore(dayjs()) ? 'secondary' : 'primary'
            }
          >
            {dayjs(match.dateHour).format('HH:mm')}
          </Typography>
        </Grid2>
        <VersusItem match={match} />
        <Grid2
          pr="0.75rem"
          size={3}
          display="flex"
          alignItems="center"
          justifyContent="flex-end"
        >
          <MatchMenu match={match} tournamentStatus={tournamentStatus} />
        </Grid2>
      </Grid2>
      <Stack
        width="100%"
        bgcolor="background.s3"
        height="2.5rem"
        alignItems="center"
        justifyContent="center"
        direction="row"
        px="0.75rem"
      >
        <Stack color="text.secondary" flex={1}>
          <Typography
            component={Link}
            sx={{ textDecoration: 'none' }}
            to={`/tournaments/${match.tournament.id}`}
            variant="h5"
            color="text.secondary"
            textOverflow="ellipsis"
            noWrap
            flex={1}
          >
            {match.tournament.name}
          </Typography>
        </Stack>
        <Stack color="text.secondary" alignItems="flex-end" flex={1}>
          <Typography variant="h5" color="text.secondary">
            Tour {match.turn}
          </Typography>
        </Stack>
      </Stack>
    </Stack>
  );
};
