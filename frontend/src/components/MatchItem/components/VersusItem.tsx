import {
  Box,
  BoxProps,
  Grid2,
  Stack,
  Typography,
  TypographyProps,
} from '@mui/material';
import { MatchSummaryDto, MaybeAuthenticatedUser } from '../../../types';
import { Link } from 'react-router-dom';
import { useUser } from '../../../hooks/useUser';
import { Flag } from '@gravity-ui/icons';

interface VersusItemProps {
  match: MatchSummaryDto;
}

const boxProps: BoxProps = {
  display: 'contents',
  sx: {
    color: (theme) => theme.palette.text.secondary,
  },
};

import { TeamLineupHover } from './TeamLineupHover'; // Adjust the path as necessary

export const VersusItem = ({ match }: VersusItemProps) => {
  const { authenticatedUser } = useUser();

  const isAdmin = authenticatedUser?.admin;
  const isPlayed = match.status === 'PLAYED';
  const isForfeit = match.status === 'FORFEIT';

  const showScoresSection = isPlayed || isForfeit;

  const isConfirmed =
    match.team1?.hasConfirmedResults && match.team2?.hasConfirmedResults;

  const isManager =
    authenticatedUser?.managedTeamId === match.team1?.idTeam ||
    authenticatedUser?.managedTeamId === match.team2?.idTeam;

  const revealScores = isConfirmed || isManager || isAdmin;

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
        <TeamItem
          matchTeam={match.team1}
          isFinal={isFinal}
          isForfeit={isForfeit}
          matchDate={match.dateHour}
          authenticatedUser={authenticatedUser}
        />
        {showScoresSection && (
          <Typography
            variant="h4"
            display="flex"
            alignItems="center"
            color={
              revealScores && !match.team1?.hasForfeited
                ? 'primary'
                : 'secondary'
            }
          >
            {match.team1?.hasForfeited || !match.team1 ? (
              <Box {...boxProps}>
                <Flag />
              </Box>
            ) : revealScores ? (
              match.team1?.score
            ) : (
              '-'
            )}
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
        {showScoresSection && (
          <Typography
            variant="h4"
            display="flex"
            alignItems="center"
            color={
              revealScores && !match.team2?.hasForfeited
                ? 'primary'
                : 'secondary'
            }
          >
            {match.team2?.hasForfeited || match?.team2 === null ? (
              <Box {...boxProps}>
                <Flag />
              </Box>
            ) : revealScores ? (
              match.team2?.score
            ) : (
              '-'
            )}
          </Typography>
        )}
        <TeamItem
          matchTeam={match.team2}
          isFinal={isFinal}
          isForfeit={isForfeit}
          matchDate={match.dateHour}
          authenticatedUser={authenticatedUser}
        />
      </Grid2>
    </Grid2>
  );
};

const TeamItem = ({
  matchTeam,
  isFinal,
  isForfeit,
  matchDate,
  authenticatedUser,
}: {
  matchTeam: MatchSummaryDto['team1'] | MatchSummaryDto['team2'];
  isFinal: boolean;
  isForfeit: boolean;
  matchDate: string;
  authenticatedUser: MaybeAuthenticatedUser;
}) => {
  const isWinner = matchTeam?.isWinner && isFinal;
  const props: TypographyProps = {
    variant: 'h4',
    borderRadius: isWinner ? '100rem' : '0.25rem',
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

  if (!matchTeam?.idTeam || !matchTeam?.name)
    return (
      <Typography {...props}>
        {isForfeit ? "Pas d'adversaire" : 'TBD'}
      </Typography>
    );

  return (
    <TeamLineupHover
      team={matchTeam}
      matchDate={matchDate}
      authenticatedUser={authenticatedUser}
    >
      <Typography
        component={Link}
        to={`/teams/${matchTeam?.idTeam}`}
        {...props}
      >
        {matchTeam?.name}
      </Typography>
    </TeamLineupHover>
  );
};
