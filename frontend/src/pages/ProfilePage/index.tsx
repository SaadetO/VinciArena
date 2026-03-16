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
import { CreateTeamModal } from './components/CreateTeamModal';
import { useContext, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { UserContext } from '../../contexts/UserContext';
import { ProfileInfoDto, Team } from '../../types';
import { NotFoundPage } from '../NotFoundPage';
import { UnavailabilitiesCard } from './components/UnavailabilitiesCard';
import { UnavailabilitiesModal } from './components/UnavailabilitiesModal';
import { JoinTeamModal } from './components/JoinTeamModal';

export const ProfilePage = () => {
  const [snackBarMessage, setSnackBarMessage] = useState<{
    text: string;
    isError: boolean;
    isOpen: boolean;
  } | null>(null);
  const [teams, setTeams] = useState<Team[]>([]);
  const [openJoin, setOpenJoin] = useState(false);
  const [openCreate, setOpenCreate] = useState(false);
  const { id } = useParams();
  const idNbr = Number(id);
  const { authenticatedUser } = useContext(UserContext);
  const [unavailabilitiesModal, setUnavailabilitiesModal] = useState(false);
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
                  setOpen={setOpenCreate}
                  setOpenJoin={setOpenJoin}
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
                  setUnavailabilitiesModal={setUnavailabilitiesModal}
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
      <CreateTeamModal
        open={openCreate}
        onClose={() => setOpenCreate(false)}
        onSuccess={(team) => {
          setSnackBarMessage({
            text: 'Team créée avec succès !',
            isError: false,
            isOpen: true,
          });
          setOpenCreate(false);
          if (user) setUser({ ...user, team });
        }}
      />
      <JoinTeamModal
        teams={teams}
        setTeams={setTeams}
        open={openJoin}
        onClose={() => setOpenJoin(false)}
        onSuccess={() =>
          setSnackBarMessage({
            text: 'Demande effectuée avec succès !',
            isError: false,
            isOpen: true,
          })
        }
      />
      <UnavailabilitiesModal
        open={unavailabilitiesModal}
        onClose={() => setUnavailabilitiesModal(false)}
        unavailabilities={user?.unavailabilities ?? null}
        onSuccess={({ tempId, startDate, endDate }) => {
          setSnackBarMessage({
            text: 'Indisponibilité ajoutée avec succès !',
            isError: false,
            isOpen: true,
          });
          if (user)
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
        }}
        onIdResolved={(tempId, realId) => {
          setUser((prev) => {
            if (!prev) return prev;
            return {
              ...prev,
              unavailabilities: (prev.unavailabilities ?? []).map((u) =>
                u.id === tempId ? { ...u, id: realId } : u,
              ),
            };
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
