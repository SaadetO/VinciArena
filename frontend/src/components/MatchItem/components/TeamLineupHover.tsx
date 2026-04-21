import { Box, Stack, Tooltip, Typography } from '@mui/material';
import dayjs from 'dayjs';
import { MatchTeamDto, MaybeAuthenticatedUser } from '../../../types';

interface TeamLineupHoverProps {
  team: MatchTeamDto;
  matchDate: string;
  authenticatedUser: MaybeAuthenticatedUser;
  children: React.ReactNode;
}

export const TeamLineupHover = ({
  team,
  matchDate,
  authenticatedUser,
  children,
}: TeamLineupHoverProps) => {
  const isPast = dayjs(matchDate).isBefore(dayjs());
  const isMyTeam = authenticatedUser?.managedTeamId === team.idTeam;
  const canSee = isPast || isMyTeam;

  // If they aren't allowed to see it, just return the name without a tooltip
  if (!canSee) {
    return <>{children}</>;
  }

  // If they CAN see it, check if there are players to show
  const hasPlayers = team.lineup?.players && team.lineup.players.length > 0;

  const lineupContent = (
    <Stack spacing={0.5} sx={{ p: 0.5 }}>
      <Typography
        variant="caption"
        sx={{ fontWeight: 700, color: 'primary.main', mb: 0.5 }}
      >
        {team.name}
      </Typography>

      {hasPlayers ? (
        team.lineup?.players?.map((player) => (
          <Typography
            key={player.id}
            sx={{ fontSize: '0.75rem', lineHeight: 1.4 }}
          >
            • {player.tag}
          </Typography>
        ))
      ) : (
        <Typography variant="caption" color="text.secondary">
          Non définie
        </Typography>
      )}
    </Stack>
  );

  return (
    <Tooltip
      title={lineupContent}
      placement="top"
      arrow
      slotProps={{
        tooltip: {
          sx: {
            bgcolor: 'background.s3',
            border: '1px solid',
            borderColor: 'divider',
            boxShadow: 4,
          },
        },
        arrow: {
          sx: { color: 'background.s3' },
        },
      }}
    >
      <Box component="span" sx={{ cursor: 'help' }}>
        {children}
      </Box>
    </Tooltip>
  );
};
