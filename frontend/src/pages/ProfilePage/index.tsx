import {
  Container,
  Grid2,
  Slide,
  Snackbar,
  Stack,
  Typography,
} from '@mui/material';
import { PersonalInfoCard } from './components/PersonalInfoCard';
import { ProfileBanner } from './components/ProfileBanner';
import { TeamCard } from './components/TeamCard';
import { useContext, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { UserContext } from '../../contexts/UserContext';
import { useModal } from '../../hooks/useModal';
import { ProfileInfoDto } from '../../types';
import { NotFoundPage } from '../NotFoundPage';
import { UnavailabilitiesCard } from './components/UnavailabilitiesCard';
import { unavailabilitiesModal } from './modals/unavailabilitiesModal';
import { useSnackbar } from '../../hooks/useSnackbar';

export const ProfilePage = () => {
  const [snackBarMessage, setSnackBarMessage] = useState<{
    text: string;
    isError: boolean;
    isOpen: boolean;
  } | null>(null);
  const { id } = useParams();
  const idNbr = Number(id);
  const { authenticatedUser } = useContext(UserContext);
  const { openModal } = useModal();
  const { showSnackbar } = useSnackbar();
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
        if (!response.ok) throw new Error('Failed to fetch profile');

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

  useEffect(() => {
    console.log(user);
  }, [user]);

  if (error) return <NotFoundPage error={error} />;
  return (
    <>
      <ProfileBanner user={user} setUser={setUser} />
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
          {authenticatedUser?.id === idNbr && (
            <Grid2 size={{ xs: 12, lg: 5 }}>
              <Stack spacing="1.5rem">
                <PersonalInfoCard
                  user={user}
                />
                <TeamCard
                  user={user}
                  setUser={setUser}
                  onQuitSuccess={() => {
                    setSnackBarMessage({
                      text: "Vous avez quitté l'équipe avec succès.",
                      isError: false,
                      isOpen: true,
                    });
                    setUser((prev) => {
                      if (!prev) return prev;
                      return { ...prev, team: null };
                    });
                  }}
                  onError={(errorMessage: string) => {
                    setSnackBarMessage({
                      text: errorMessage,
                      isError: true,
                      isOpen: true,
                    });
                  }}
                />
                <UnavailabilitiesCard
                  user={user}
                  setUnavailabilitiesModal={() => {
                    let selectedDates: { tempId: number; startDate: string; endDate: string } | null = null;
                    
                    openModal(
                      unavailabilitiesModal({
                        unavailabilities: user?.unavailabilities ?? [],
                        onSelect: (dates) => {
                          selectedDates = dates;
                        },
                        onConfirm: async (close) => {
                          if (!selectedDates) return;
                          close();
                          
                          const { tempId, startDate, endDate } = selectedDates;

                          // Update UI optimistically
                          setUser((prev) => {
                            if (!prev) return prev;
                            return {
                              ...prev,
                              unavailabilities: [
                                ...(prev.unavailabilities ?? []),
                                { id: tempId, startDate, endDate },
                              ],
                            };
                          });

                          try {
                            const response = await fetch('/api/unavailabilities/me', {
                              method: 'POST',
                              headers: {
                                'Content-Type': 'application/json',
                                Authorization: authenticatedUser?.token ?? '',
                              },
                              body: JSON.stringify({
                                startDate,
                                endDate,
                              }),
                            });

                            if (!response.ok) {
                              throw new Error("Erreur lors de l'ajout de l'indisponibilité.");
                            }

                            const created = await response.json();
                            
                            // Resolve the ID
                            setUser((prev) => {
                              if (!prev) return prev;
                              return {
                                ...prev,
                                unavailabilities: (prev.unavailabilities ?? []).map((u) =>
                                  u.id === tempId ? { ...u, id: created.idUnavailability } : u,
                                ),
                              };
                            });

                            showSnackbar({
                              message: 'Indisponibilité ajoutée avec succès !',
                              severity: 'success',
                            });
                          } catch (err: unknown) {
                            showSnackbar({
                              message: err instanceof Error ? err.message : 'Une erreur est survenue.',
                              severity: 'error',
                            });
                            // Rollback
                            setUser((prev) => {
                              if (!prev) return prev;
                              return {
                                ...prev,
                                unavailabilities: (prev.unavailabilities ?? []).filter(
                                  (u) => u.id !== tempId,
                                ),
                              };
                            });
                          }
                        },
                      })
                    );
                  }}
                  onError={(errorMessage: string) => {
                    setSnackBarMessage({
                      text: errorMessage,
                      isError: true,
                      isOpen: true,
                    });
                  }}
                  onSuccessDelete={(id: number) => {
                    setSnackBarMessage({
                      text: 'Indisponibilité supprimée avec succès !',
                      isError: false,
                      isOpen: true,
                    });
                    setUser((prev) => {
                      if (!prev) return prev;
                      return {
                        ...prev,
                        unavailabilities: (prev.unavailabilities ?? []).filter(
                          (u) => u.id !== id,
                        ),
                      };
                    });
                  }}
                />
              </Stack>
            </Grid2>
          )}
        </Grid2>
      </Container>
      <Slide direction="up" in={snackBarMessage?.isOpen ?? false}>
        <Snackbar
          open={snackBarMessage?.isOpen ?? false}
          autoHideDuration={3000}
          onClose={() =>
            setSnackBarMessage((prev) =>
              prev ? { ...prev, isOpen: false } : null,
            )
          }
          message={
            snackBarMessage && (
              <Typography
                variant="body1"
                sx={{
                  color: (theme) =>
                    snackBarMessage.isError
                      ? theme.palette.error.main
                      : theme.palette.background.s0,
                }}
              >
                {snackBarMessage.text}
              </Typography>
            )
          }
        />
      </Slide>
    </>
  );
};
