import { Container, Grid2, Stack, Typography } from '@mui/material';
import { PersonalInfoCard } from './components/PersonalInfoCard';
import { ProfileBanner } from './components/ProfileBanner';
import { useParams } from 'react-router-dom';
import { useContext, useEffect, useState } from 'react';
import { UserContext } from '../../contexts/UserContext';
import { ProfileInfoDto } from '../../types';
import { NotFoundPage } from '../NotFoundPage';

export const ProfilePage = () => {
  const { id } = useParams();
  const idNbr = Number(id);
  const { authenticatedUser } = useContext(UserContext);
  const [user, setUser] = useState<ProfileInfoDto | undefined>(undefined);
  const [error, setError] = useState<
    { code: number; message: string; subtitle?: string } | undefined
  >(undefined);

  useEffect(() => {
    setUser(undefined);
    setError(undefined);
    if (isNaN(idNbr) || idNbr <= 0) return;
    (async () => {
      let response: Response | undefined = undefined;
      try {
        response = await fetch(`/api/members/${idNbr}`, {
          headers: {
            'Content-Type': 'application/json',
            Authorization: authenticatedUser?.token ?? '',
          },
        });
        if (response.status === 404)
          return setError({
            code: 404,
            message: 'Membre introuvable',
            subtitle:
              "Le membre que vous cherchez n'existe pas ou a été surpprimé.",
          });
        if (!response.ok) {
          throw new Error('Failed to fetch profile');
        }
        setUser(await response.json());
      } catch (err) {
        setError({
          code: response?.status ?? 500,
          message: 'Une erreur est survenue',
          subtitle:
            'Une erreur est survenue lors de la récupération du profil.',
        });
      }
    })();
  }, [idNbr, authenticatedUser]);

  if (error) return <NotFoundPage error={error} />;
  return (
    <>
      <ProfileBanner user={user} />
      <Container maxWidth="lg">
        <Grid2
          container
          spacing={3}
          paddingTop="1.5rem"
          direction={{ xs: 'column-reverse', md: 'row' }}
          justifyContent="center"
        >
          <Grid2 size={{ xs: 12, md: 7 }}>
            <Stack spacing="1.5rem">
              {/* menu */}
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
          {(user === undefined || user?.isSelf) && (
            <Grid2 size={{ xs: 12, md: 5 }}>
              <Stack spacing="1.5rem">
                <PersonalInfoCard user={user} />
              </Stack>
            </Grid2>
          )}
        </Grid2>
      </Container>
    </>
  );
};
