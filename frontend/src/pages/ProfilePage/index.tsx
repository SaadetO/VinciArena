import { Box, Chip, Stack, Typography } from '@mui/material';
import profileHeroHeader from '../../assets/images/profile_hero_header.jpg';

export const ProfilePage = () => {
  const user = {
    tag: 'Larry',
    avatar: null,
    email: 'larry@cae.com',
    specialty: 'architect',
    creation_date: '2022-01-01',
    team: {
      id: '1',
      name: 'M8',
    },
  };
  return (
    <>
      <Stack
        sx={{
          background: `linear-gradient(0, rgba(0, 0, 0, 0.2)), url("${profileHeroHeader}") no-repeat center/cover`,
        }}
        spacing="0.375rem"
        width={1}
        height="fit-content"
        padding="5rem 5rem"
      >
        <Stack spacing="0.75rem" alignItems="center" direction="row">
          <Box
            borderRadius="100rem"
            overflow="hidden"
            height="2.5rem"
            width="2.5rem"
          >
            <img
              src={
                user.avatar ??
                `https://api.dicebear.com/9.x/initials/svg?seed=${user.tag}`
              }
              width="100%"
              height="100%"
            />
          </Box>
          <Typography variant="h1">{user.tag}</Typography>
        </Stack>
        <Stack direction="row" spacing="0.25rem" alignItems="center">
          <Chip size="small" color="inverse" label={`team ${user.team.name}`} />
          <Chip
            size="medium"
            variant="text"
            label={`spécialité ${user.specialty}`}
          />
        </Stack>
      </Stack>
    </>
  );
};
