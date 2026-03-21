import { Container, Grid2, Stack, Typography } from '@mui/material';
import { PersonalInfoCard } from './components/PersonalInfoCard';
import { ProfileBanner } from './components/ProfileBanner';
import { TeamCard } from './components/TeamCard';
import { useContext, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { UserContext } from '../../contexts/UserContext';
import { ProfileInfoDto } from '../../types';
import { NotFoundPage } from '../NotFoundPage';
import { UnavailabilitiesCard } from './components/UnavailabilitiesCard';
import { useMembers } from '../../hooks/useMembers';

export const ProfilePage = () => {
  const { id } = useParams();
  const idNbr = Number(id);
  const { authenticatedUser } = useContext(UserContext);
  const [user, setUser] = useState<ProfileInfoDto | undefined>(undefined);
  const [error, setError] = useState<
    { code: number; message: string; subtitle?: string } | undefined
  >(undefined);
  const { getById } = useMembers({ setUser, setError });

  useEffect(() => {
    if (authenticatedUser === undefined) return;
    setUser(undefined);
    setError(undefined);
    getById(idNbr);
  }, [idNbr, authenticatedUser, getById]);

  if (error) return <NotFoundPage error={error} />;
  return (
    <>
      <ProfileBanner user={user} setUser={setUser} />
      <Container maxWidth="lg">
        <Grid2
          container
          spacing={3}
          padding="1.5rem 0 4rem"
          direction={{ xs: 'column-reverse', lg: 'row' }}
          justifyContent="center"
        >
          <Grid2 size={{ xs: 12, lg: 7 }}>
            <Stack spacing="1.5rem">
              {/* menu */}
              <Stack
                sx={{ background: (theme) => theme.palette.background.s1 }}
                padding="1.25rem 1rem 1rem"
                borderRadius="1.5rem"
              >
                <Typography variant="h5" textAlign="center">
                  Placeholder for match & tournament section
                </Typography>
              </Stack>
            </Stack>
          </Grid2>
          {authenticatedUser?.id === idNbr && (
            <Grid2 size={{ xs: 12, lg: 5 }}>
              <Stack spacing="1.5rem">
                <PersonalInfoCard user={user} />
                <TeamCard user={user} setUser={setUser} />
                <UnavailabilitiesCard user={user} setUser={setUser} />
              </Stack>
            </Grid2>
          )}
        </Grid2>
      </Container>
    </>
  );
};
