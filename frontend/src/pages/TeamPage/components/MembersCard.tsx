import { useContext, memo } from 'react';
import { TeamDetailsInfoDto } from '../../../types';
import { UserContext } from '../../../contexts/UserContext';
import { Avatar, Chip, Skeleton, Stack, Typography } from '@mui/material';
import { Link } from 'react-router-dom';

interface MembersCardProps {
  team?: TeamDetailsInfoDto;
}

export const MembersCard = memo(({ team }: MembersCardProps) => {
  const { authenticatedUser } = useContext(UserContext);

  return (
    <>
      <Stack
        sx={{ background: (theme) => theme.palette.background.s1 }}
        padding="1.25rem 1rem 1rem"
        borderRadius="1.5rem"
        spacing="1.25rem"
      >
        <Typography variant="h4">Membres</Typography>
        <Stack gap="0.75rem" direction="row" flexWrap="wrap">
          {!team ? (
            <>
              {Array.from({ length: 4 }).map((_, index) => (
                <Stack
                  key={index}
                  direction="row"
                  gap="0.5rem"
                  alignItems="center"
                  height="2.75rem"
                  padding="0 1rem 0 0.75rem"
                  sx={{
                    background: (theme) => theme.palette.background.s2,
                  }}
                  borderRadius="0.75rem"
                >
                  <Skeleton variant="circular" width="1.5rem" height="1.5rem" />
                  <Skeleton
                    variant="text"
                    width={`${4 + (index % 3) * 1.5}rem`}
                    height={22}
                  />
                </Stack>
              ))}
            </>
          ) : team.members ? (
            team.members.map((member) => (
              <Chip
                sx={{
                  cursor: 'pointer',
                  '&:hover': {
                    background: (theme) => theme.palette.background.s4,
                  },
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
