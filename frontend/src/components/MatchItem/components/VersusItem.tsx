import { Box, Grid2, Stack, Typography, TypographyProps } from '@mui/material';
import { MatchSummaryDto } from '../../../types';
import { Link } from 'react-router-dom';
import { useUser } from '../../../hooks/useUser';

interface VersusItemProps {
  match: MatchSummaryDto;
}

export const VersusItem = ({ match }: VersusItemProps) => {
  const { authenticatedUser } = useUser();
  const isPlayed = match.status === 'PLAYED';

  const isConfirmed =
    match.team1?.hasConfirmedResults && match.team2?.hasConfirmedResults;

  const isManager =
    authenticatedUser?.managedTeamId === match.team1?.idTeam ||
    authenticatedUser?.managedTeamId === match.team2?.idTeam;

  const revealScores = isConfirmed || isManager;

  const isFinal = match.isFinal;
  return (
    <Grid2 size={6} spacing="2.375rem" container position="relative">
      <Grid2
        size={6}
        display="flex"
        alignItems="center"
        justifyContent="flex-end"
        gap="1.25rem"
      >
        <TeamItem matchTeam={match.team1} isFinal={isFinal} />
        {isPlayed && (
          <Typography
            variant="h4"
            color={revealScores ? 'primary' : 'secondary'}
          >
            {revealScores ? match.team1?.score : '-'}
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
        {isPlayed && (
          <Typography
            variant="h4"
            color={revealScores ? 'primary' : 'secondary'}
          >
            {revealScores ? match.team2?.score : '-'}
          </Typography>
        )}
        <TeamItem matchTeam={match.team2} isFinal={isFinal} />
      </Grid2>
    </Grid2>
  );
};

const TeamItem = ({
  matchTeam,
  isFinal,
}: {
  matchTeam: MatchSummaryDto['team1'] | MatchSummaryDto['team2'];
  isFinal: boolean;
}) => {
  const isWinner = matchTeam.isWinner && isFinal;
  const props: TypographyProps = {
    variant: 'h4',
    borderRadius: '100rem',
    padding: isWinner ? '0.125rem 0.75rem' : '',
    sx: {
      opacity: matchTeam?.name ? 1 : 0.5,
      textDecoration: 'none',
      color: (theme) =>
        isWinner
          ? `${theme.palette.primary.main} !important`
          : `${theme.palette.text.primary} !important`,
      background: (theme) =>
        isWinner
          ? `color-mix(in srgb, ${theme.palette.primary.main} 10%, ${theme.palette.background.s3})`
          : `none`,
    },
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
