import { useContext, memo } from 'react';
import { TeamDetailsInfoDto } from '../../../types';
import { UserContext } from '../../../contexts/UserContext';
import { Avatar, Chip, Skeleton, Stack, Typography } from '@mui/material';
import { Link } from 'react-router-dom';

interface MembersCardProps {
  isLoading: boolean;
  team: TeamDetailsInfoDto | undefined;
}

export const MembersCard = memo(({ team, isLoading }: MembersCardProps) => {
  const { authenticatedUser } = useContext(UserContext);

  return (
    <>
      <Stack
        sx={{ background: (theme) => theme.palette.background.s1 }}
        padding="1.25rem 1rem 1rem"
        borderRadius="0.5rem"
        spacing="1rem"
      >
        <Typography variant="h4">Membres</Typography>
        <Stack spacing="0.75rem" direction="row" flexWrap="wrap">
          {isLoading ? (
            <Stack direction="row" spacing="0.75rem" alignItems="center">
              <Skeleton variant="circular" width="2rem" height="2rem" />
              <Skeleton width="8rem" />
            </Stack>
          ) : team ? (
            team.members.map((member) => (
              <Chip
                sx={{
                  cursor: 'pointer',
                  '&:hover': {
                    background: (theme) => theme.palette.background.s4,
                  },
                  textTransform: 'none',
                }}
                key={member.id}
                component={Link}
                to={`/users/${member.id}`}
                label={member.tag}
                avatar={<Avatar src={`/assets/avatars/${member.avatar}`} />}
                variant={
                  member.id === authenticatedUser?.id ? 'active' : 'filled'
                }
              />
            ))
          ) : (
            <Stack
              padding="1rem 1.5rem"
              spacing="0.25rem"
              alignItems="center"
              width="100%"
            >
              <Typography variant="h5" textAlign="center">
                Aucun membre
              </Typography>
              <Typography
                variant="body2"
                textAlign="center"
                width="14rem"
                color="text.secondary"
              >
                Rien à signaler !
              </Typography>
            </Stack>
          )}
        </Stack>
      </Stack>
    </>
  );
});
