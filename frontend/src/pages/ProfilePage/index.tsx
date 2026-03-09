import { Container, Grid2, Stack, Typography } from '@mui/material';
import { PersonalInfoCard } from './components/PersonalInfoCard';
import { ProfileBanner } from './components/ProfileBanner';
import { useParams } from 'react-router-dom';
import { useContext, useEffect } from 'react';
import { UserContext } from '../../contexts/UserContext';

export const ProfilePage = () => {
  const { id } = useParams();
  const { authenticatedUser } = useContext(UserContext);

  useEffect(() => {
    if (isNaN(Number(id))) return;
  }, [authenticatedUser, id]);

  const user = {
    id: 1,
    tag: 'Larry',
    avatar: '',
    email: 'larry@cae.com',
    specialty: 'architecte',
    creation_date: '2022-01-01',
    isAdmin: false,
    isSelf: false,
    team: {
      id: 1,
      name: 'M8',
      isManager: true,
    },
    unavailabilities: [],
  };
  console.log(user);
  return (
    <>
      <ProfileBanner user={user} />
      <Container maxWidth="lg">
        <Grid2
          container
          spacing={3}
          paddingTop="1.5rem"
          direction={{ xs: 'column-reverse', md: 'row' }}
        >
          <Grid2 size={{ xs: 12, md: 7 }}>
            <Stack spacing="1.5rem">
              <Stack
                sx={{ background: (theme) => theme.palette.background.s1 }}
                padding="1.25rem 1rem 1rem"
                borderRadius="0.5rem"
              >
                <Typography variant="h5" textAlign="center">
                  Placeholder for match & tournament section
                </Typography>
              </Stack>
            </Stack>
          </Grid2>
          <Grid2 size={{ xs: 12, md: 5 }}>
            <Stack spacing="1.5rem">
              <PersonalInfoCard user={user} />
            </Stack>
          </Grid2>
        </Grid2>
      </Container>
    </>
  );
};
