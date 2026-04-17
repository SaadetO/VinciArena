import { Box, Grid2, Stack, Typography, TypographyProps } from '@mui/material';
import { MatchSummaryDto } from '../../../types';
import { Link } from 'react-router-dom';

interface VersusItemProps {
  match: MatchSummaryDto;
}

export const VersusItem = ({ match }: VersusItemProps) => {
  const showScore =
    match.team1 &&
    match.team1?.score !== 0 &&
    match.team2 &&
    match.team2?.score !== 0;
  return (
    <Grid2 size={6} spacing="2.375rem" container position="relative">
      <Grid2
        size={6}
        display="flex"
        alignItems="center"
        justifyContent="flex-end"
        gap="1.25rem"
      >
        <TeamItem matchTeam={match.team1} />
        {showScore && (
          <Typography
            variant="h4"
            color={match.isConfirmed ? 'primary' : 'secondary'}
          >
            {match.isConfirmed ? match.team1?.score : '-'}
          </Typography>
        )}
      </Grid2>
      <Stack
        width="0.375rem"
        position="absolute"
        top="50%"
        left="50%"
        sx={{ transform: 'translate(-50%, -50%)' }}
        alignItems="center"
      >
        <Box
          width="1px"
          height="1.25rem"
          sx={{ rotate: '30deg', background: (theme) => theme.palette.divider }}
        />
      </Stack>
      <Grid2 size={6} display="flex" alignItems="center" gap="1.25rem">
        {showScore && (
          <Typography
            variant="h4"
            color={match.isConfirmed ? 'primary' : 'secondary'}
          >
            {match.isConfirmed ? match.team2?.score : '-'}
          </Typography>
        )}
        <TeamItem matchTeam={match.team2} />
      </Grid2>
    </Grid2>
  );
};

const TeamItem = ({
  matchTeam,
}: {
  matchTeam: MatchSummaryDto['team1'] | MatchSummaryDto['team2'];
}) => {
  const props: TypographyProps = {
    variant: 'h4',
    sx: { opacity: matchTeam?.name ? 1 : 0.5, textDecoration: 'none' },
    textOverflow: 'ellipsis',
    noWrap: true,
  };
  if (!matchTeam?.idTeam || !matchTeam.name)
    return <Typography {...props}>TBD</Typography>;
  return (
    <Typography component={Link} to={`/teams/${matchTeam?.idTeam}`} {...props}>
      {matchTeam.name}
    </Typography>
  );
};
