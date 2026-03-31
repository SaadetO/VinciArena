import { Skeleton, Stack, Typography } from '@mui/material';
import { TournamentDetailsInfoDto } from '../../../types';
import tournamentHeroHeader from '../../../assets/images/tournament_hero_header.jpg';
import { TournamentStatusChip } from '../../../components/TournamentItem/components/TournamentStatusChip';
import { TournamentDate } from '../../../components/TournamentItem/components/TournamentDate';

export const TournamentBanner = ({
  tournament,
}: {
  tournament?: TournamentDetailsInfoDto;
}) => {
  return (
    <Stack
      sx={{
        background: `linear-gradient(0, rgba(0, 0, 0, 0.4)), url("${tournamentHeroHeader}") no-repeat center/cover`,
      }}
      spacing="0.375rem"
      width={1}
      height="fit-content"
      padding="5rem"
    >
      <Stack spacing="0.75rem" alignItems="center" direction="row">
        <Typography variant="h1">
          {tournament ? (
            tournament.name
          ) : (
            <Skeleton variant="text" height="3.375rem" width="15rem" />
          )}
        </Typography>
      </Stack>
      <Stack direction="row" spacing="0.25rem" alignItems="center">
        {tournament ? (
          <>
            <TournamentStatusChip status={tournament.status} />
            <TournamentDate
              startDate={tournament.startDate}
              endDate={tournament.endDate}
              component="Chip"
            />
          </>
        ) : (
          <>
            <Skeleton
              variant="rounded"
              width="6rem"
              height="1.5rem"
              sx={{ borderRadius: '100rem' }}
            />
            <Skeleton variant="text" width="5rem" height="1.75rem" />
          </>
        )}
      </Stack>
      <Typography variant="h5">
        {tournament ? (
          tournament.description
        ) : (
          <Skeleton variant="text" width="20rem" />
        )}
      </Typography>
    </Stack>
  );
};
