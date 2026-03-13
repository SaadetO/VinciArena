import { Avatar, Stack, Typography, Skeleton, Chip } from '@mui/material';
import { TeamDetailsInfoDto } from '../../../types';
import { Link } from 'react-router-dom';
import { useContext } from 'react';
import { UserContext } from '../../../contexts/UserContext';

export const ManagerCard = ({ team }: { team?: TeamDetailsInfoDto }) => {
  const { authenticatedUser } = useContext(UserContext);
  return (
    <Stack
      sx={{ background: (theme) => theme.palette.background.s1 }}
      padding="1.25rem 1rem 1rem"
      borderRadius="0.5rem"
      spacing="1rem"
    >
      <Typography variant="h4">Responsables</Typography>
      <Stack spacing="0.75rem" direction="row" flexWrap="wrap">
        {team ? (
          team.managers.map((manager) => (
            <Chip
              sx={{
                cursor: 'pointer',
                '&:hover': {
                  background: (theme) => theme.palette.background.s4,
                },
                textTransform: 'none',
                key: manager.id,
              }}
              component={Link}
              to={`/users/${manager.id}`}
              label={manager.tag}
              avatar={<Avatar src={`/assets/avatars/${manager.avatar}`} />}
              variant={
                manager.id === authenticatedUser?.id ? 'active' : 'filled'
              }
            />
          ))
        ) : (
          <>
            {[1, 2].map((i) => (
              <Stack
                key={i}
                direction="row"
                spacing="0.75rem"
                alignItems="center"
              >
                <Skeleton variant="circular" width="2rem" height="2rem" />
                <Skeleton width="8rem" />
              </Stack>
            ))}
          </>
        )}
      </Stack>
    </Stack>
  );
};
