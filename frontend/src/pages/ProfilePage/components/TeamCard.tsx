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
}

export const TeamCard = ({ user, setUser }: TeamCardProps) => {
  const handleJoin = () => {
    let selectedTeam: Team | null = null;

    const onSelect = (team: Team | null) => {
      selectedTeam = team;
    };

    const onConfirm = async (close: () => void) => {
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
          message:
            err instanceof Error ? err.message : 'Une erreur est survenue.',
          severity: 'error',
        });
      }
    };

    openModal(joinTeamModal({ onSelect, onConfirm }));
  };

  const handleCreate = () => {
    let selectedName: string | null = null;

    const onSelect = (name: string | null) => {
      selectedName = name;
    };

    const onConfirm = async (close: () => void) => {
      if (!selectedName) return;
      close();

      // Backup (know it's null or we wouldn't see the button)
      const previousTeam = user?.team;

      // Optimistic Update with temp data
      setUser((prev) =>
        prev
          ? {
              ...prev,
              team: {
                id: -1,
                name: selectedName!,
                isManager: true,
              },
            }
          : prev,
      );

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

        setUser((prev) => (prev ? { ...prev, team } : prev));

        showSnackbar({
          message: 'Team créée avec succès !',
          severity: 'success',
        });
      } catch (err: unknown) {
        // Rollback
        setUser((prev) =>
          prev ? { ...prev, team: previousTeam ?? null } : prev,
        );
        showSnackbar({
          message:
            err instanceof Error ? err.message : 'Une erreur est survenue.',
          severity: 'error',
        });
      }
    };

    openModal(createTeamModal({ onSelect, onConfirm }));
  };

  const navigate = useNavigate();
  const { authenticatedUser } = useContext(UserContext);
  const { openModal } = useModal();
  const { showSnackbar } = useSnackbar();

  const handleViewTeam = () => {
    if (user?.team) {
      navigate(`/teams/${user.team.id}`);
    }
  };

  const handleQuit = async () => {
    if (!user?.team) return;
    const previousTeam = user.team;

    // Optimistic update
    setUser((prev) => (prev ? { ...prev, team: null } : prev));

    try {
      const response = await fetch('/api/teams/quit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: authenticatedUser?.token ?? '',
        },
      });

      if (!response.ok) {
        throw new Error('Erreur lors du départ de la team.');
      }

      showSnackbar({
        message: "Vous avez quitté l'équipe avec succès.",
        severity: 'success',
      });
    } catch (err) {
      // Rollback
      setUser((prev) => (prev ? { ...prev, team: previousTeam } : prev));
      showSnackbar({
        message:
          err instanceof Error
            ? err.message
            : 'Une erreur est survenue en quittant la team.',
        severity: 'error',
      });
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

      <Stack spacing="0.75rem" direction={{ xs: 'column', sm: 'row' }}>
        {!user ? (
          <>
            <Skeleton
              variant="rounded"
              sx={{ borderRadius: '0.75rem' }}
              height="2rem"
              width="100%"
            />
            <Skeleton
              variant="rounded"
              sx={{ borderRadius: '0.75rem' }}
              height="2rem"
              width="100%"
            />
          </>
        ) : user.team ? (
          <>
            <Button
              onClick={handleViewTeam}
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
              onClick={handleQuit}
            >
              quitter {user.team.name}
            </Button>
          </>
        ) : (
          <>
            <Button
              onClick={handleJoin}
              variant="contained"
              color="secondary"
              fullWidth
            >
              rejoindre une team
            </Button>
            <Button
              onClick={handleCreate}
              variant="contained"
              color="secondary"
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
