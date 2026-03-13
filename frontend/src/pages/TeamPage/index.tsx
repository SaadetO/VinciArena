import { Container, Grid2, Snackbar, Stack, Typography } from '@mui/material';
import { useCallback, useContext, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { UserContext } from '../../contexts/UserContext';
import { TeamDetailsInfoDto } from '../../types';
import { NotFoundPage } from '../NotFoundPage';
import { TeamBanner } from './components/TeamBanner';
import { ManagerCard } from './components/ManagerCard';
import { MembersCard } from './components/MembersCard';
import { JoinRequestsCard } from './components/JoinRequestsCard';

export const TeamPage = () => {
  const [snackBarText, setSnackBarText] = useState<string | null>(null);
  const { id } = useParams();
  const [isLoading, setIsloading] = useState(false);
  const idNbr = Number(id);
  const { authenticatedUser } = useContext(UserContext);
  const [team, setTeam] = useState<TeamDetailsInfoDto | undefined>(undefined);
  const [error, setError] = useState<
    { code: number; message: string; subtitle?: string } | undefined
  >(undefined);

  const fetchTeam = useCallback(async () => {
    if (isNaN(idNbr) || idNbr <= 0) return;
    setIsloading(true);
    let response: Response | undefined = undefined;
    try {
      response = await fetch(`/api/teams/${idNbr}/details`, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: authenticatedUser?.token ?? '',
        },
      });
      if (response.status === 404) {
        return setError({
          code: 404,
          message: 'Équipe introuvable',
          subtitle:
            "La team que vous cherchez n'existe pas ou a été désactivée.",
        });
      }
      if (!response.ok) throw new Error('Failed to fetch team details');

      setTeam(await response.json());
    } catch (err) {
      setError({
        code: response?.status ?? 500,
        message: 'Une erreur est survenue',
        subtitle:
          'Une erreur est survenue lors de la récupération des détails de la team.',
      });
    } finally {
      setIsloading(false);
    }
  }, [idNbr, authenticatedUser]);

  useEffect(() => {
    setTeam(undefined);
    setError(undefined);
    fetchTeam();
  }, [idNbr, authenticatedUser, fetchTeam]);

  if (error) return <NotFoundPage error={error} />;

  return (
    <>
      <TeamBanner team={team} />
      <Container maxWidth="lg">
        <Grid2
          container
          spacing={3}
          paddingTop="1.5rem"
          direction={{ xs: 'column-reverse', lg: 'row' }}
          justifyContent="center"
        >
          <Grid2 size={{ xs: 12, lg: 7 }}>
            <Stack spacing="1.5rem">
              <Stack
                sx={{ background: (theme) => theme.palette.background.s1 }}
                padding="1.25rem 1rem 1rem"
                borderRadius="0.5rem"
              >
                <Typography variant="h5" textAlign="center">
                  Placeholder for tournament section
                </Typography>
              </Stack>
            </Stack>
          </Grid2>
          <Grid2 size={{ xs: 12, lg: 5 }}>
            <Stack spacing="1.5rem">
              <ManagerCard team={team} />
              <MembersCard isLoading={isLoading} team={team} />
              {team?.managers.find((e) => e.id === authenticatedUser?.id) && (
                <JoinRequestsCard
                  isLoading={isLoading}
                  team={team}
                  showNotification={(msg) => setSnackBarText(msg)}
                  onActionSuccess={fetchTeam}
                />
              )}
            </Stack>
          </Grid2>
        </Grid2>
      </Container>
      <Snackbar
        open={!!snackBarText}
        autoHideDuration={3000}
        onClose={() => setSnackBarText(null)}
        message={snackBarText}
      />
    </>
  );
};
