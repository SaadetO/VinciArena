import { Chip, Stack, StackProps, Typography } from '@mui/material';
import { Team } from '../../../types';
import { Link } from 'react-router-dom';

const props: StackProps = {
  borderRadius: '0.75rem',
  sx: {
    background: (theme) => theme.palette.background.s1,
    textDecoration: 'none',
  },
  overflow: 'hidden',
  border: '1px solid',
  borderColor: 'divider',
};

interface TeamItemProps {
  team?: Team;
}

export const TeamItem = ({ team }: TeamItemProps) => {
  if (!team) return 'skeleton';
  if (team.isActive)
    return (
      <Stack component={Link} to={`/teams/${team?.idTeam}`} {...props}>
        <TeamItemConent team={team} />
      </Stack>
    );
  return (
    <Stack {...props}>
      <TeamItemConent team={team} />
    </Stack>
  );
};

const TeamItemConent = ({ team }: { team: Team }) => {
  return (
    <>
      <Stack
        py="0.75rem"
        alignItems="center"
        sx={{ background: (theme) => theme.palette.background.s2 }}
      >
        <Typography variant="h5">{team?.name}</Typography>
      </Stack>
      <Stack
        padding="0.25rem 0.25rem 0.25rem 0.625rem"
        alignItems="center"
        direction="row"
      >
        <Typography variant="h6" color="secondary" flex="1">
          00 membres
        </Typography>
        <Chip
          size="small"
          sx={{ height: '1.375rem' }}
          color={team?.isActive ? 'primary' : 'secondary'}
          label={team?.isActive ? 'Active' : 'Inactive'}
        />
      </Stack>
    </>
  );
};
