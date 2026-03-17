import { ProfileInfoDto, Team } from '../../../types';
import { Dispatch, SetStateAction, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserContext } from '../../../contexts/UserContext';
import { useModal } from '../../../hooks/useModal';
import { useSnackbar } from '../../../hooks/useSnackbar';
import { createTeamModal } from '../modals/createTeamModal';
import { joinTeamModal } from '../modals/joinTeamModal';
import { Button, Skeleton, Stack, Typography } from '@mui/material';

interface TeamCardProps {
  setUser: Dispatch<SetStateAction<ProfileInfoDto | undefined>>;
  user?: ProfileInfoDto;
  onQuitSuccess?: () => void;
  onError?: (errorMessage: string) => void;
}

export const TeamCard = ({
  user,
  setUser,
  onQuitSuccess,
  onError,
}: TeamCardProps) => {
  const navigate = useNavigate();
  const { authenticatedUser } = useContext(UserContext);
  const { openModal } = useModal();
  const { showSnackbar } = useSnackbar();

  const handleQuit = async () => {
    try {
      const response = await fetch('/api/teams/quit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: authenticatedUser?.token ?? '',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to quit team');
      }

      if (onQuitSuccess) {
        onQuitSuccess();
      }
    } catch (err) {
      if (onError) {
        onError('Une erreur est survenue en quittant la team.');
      }
    }
  };

  return (
    <Stack
      sx={{ background: (theme) => theme.palette.background.s1 }}
      padding="1.25rem 1rem 1rem"
      borderRadius="0.5rem"
      spacing="1rem"
    >
      <Typography variant="h4" display="flex" alignItems="center" gap="0.5rem">
        Team{' '}
        {user ? (
          (user.team?.name ?? '')
        ) : (
          <Skeleton variant="rounded" height="1.25rem" width="5rem" />
        )}
      </Typography>

      <Stack spacing="0.75rem" direction="row">
        {user?.team ? (
          <>
            <Button
              onClick={() => navigate(`/teams/${user.team?.id}`)}
              variant="contained"
              color="secondary"
              fullWidth
            >
              voir {user.team.name}
            </Button>
            <Button
              variant="contained"
              color="secondary"
              fullWidth
              onClick={() => handleQuit()}
            >
              quitter {user.team.name}
            </Button>
          </>
        ) : (
          <>
            <Button
              onClick={() => {
                let selectedTeam: Team | null = null;
                openModal(
                  joinTeamModal({
                    onSelect: (team) => {
                      selectedTeam = team;
                    },
                    onConfirm: async (close) => {
                      const idTeam = selectedTeam?.idTeam;
                      if (!idTeam) return;

                      close();

                      try {
                        const response = await fetch(`/api/teams/${idTeam}/join-requests`, {
                          method: 'POST',
                          headers: {
                            'Content-Type': 'application/json',
                            Authorization: authenticatedUser?.token ?? '',
                          },
                        });

                        if (!response.ok) {
                          throw new Error(
                            'Vous avez déjà une demande en attente pour cette équipe.',
                          );
                        }

                        showSnackbar({
                          message: 'Demande effectuée avec succès !',
                          severity: 'success',
                        });
                      } catch (err: unknown) {
                        showSnackbar({
                          message: err instanceof Error ? err.message : 'Une erreur est survenue.',
                          severity: 'error',
                        });
                      }
                    },
                  })
                );
              }}
              variant="contained"
              color="secondary"
              fullWidth
            >
              rejoindre une team
            </Button>
            <Button
              onClick={() => {
                let selectedName: string | null = null;
                openModal(
                  createTeamModal({
                    onSelect: (name) => {
                      selectedName = name;
                    },
                    onConfirm: async (close) => {
                      if (!selectedName) return;
                      close();

                      try {
                        const response = await fetch('/api/teams/', {
                          method: 'POST',
                          headers: {
                            'Content-Type': 'application/json',
                            Authorization: authenticatedUser?.token ?? '',
                          },
                          body: JSON.stringify({ name: selectedName }),
                        });

                        if (!response.ok) {
                          if (response.status === 409) {
                            throw new Error('Une équipe avec ce nom existe déjà');
                          }
                          throw new Error('Erreur lors de la création de la team.');
                        }

                        const createdTeam = await response.json();
                        const team = {
                          id: createdTeam.idTeam,
                          name: createdTeam.name,
                          isManager: true,
                        };

                        if (user) setUser({ ...user, team });

                        showSnackbar({
                          message: 'Team créée avec succès !',
                          severity: 'success',
                        });
                      } catch (err: unknown) {
                        showSnackbar({
                          message: err instanceof Error ? err.message : 'Une erreur est survenue.',
                          severity: 'error',
                        });
                      }
                    },
                  })
                );
              }}
              variant="contained"
              color="secondary"
              disabled={!user}
              fullWidth
            >
              créer une team
            </Button>
          </>
        )}
      </Stack>
    </Stack>
  );
};
