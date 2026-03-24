import {
  Button,
  IconButton,
  Skeleton,
  Stack,
  Tooltip,
  Typography,
} from '@mui/material';
import { Add, ArrowOutward } from '@mui/icons-material';
import { Dispatch, SetStateAction, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { ProfileInfoDto, Team } from '../../../types';
import { UserContext } from '../../../contexts/UserContext';
import { useModal } from '../../../hooks/useModal';
import { useSnackbar } from '../../../hooks/useSnackbar';
import { createTeamModal } from '../modals/createTeamModal';
import { joinTeamModal } from '../modals/joinTeamModal';
import { quitConfirmationModal } from '../modals/quitConfirmationModal';

interface TeamItemProps {
  user?: ProfileInfoDto;
  setUser: Dispatch<SetStateAction<ProfileInfoDto | undefined>>;
}

export const TeamItem = ({ user, setUser }: TeamItemProps) => {
  const navigate = useNavigate();
  const { authenticatedUser } = useContext(UserContext);
  const { openModal } = useModal();
  const { showSnackbar } = useSnackbar();

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
      const previousTeam = user?.team;
      setUser((prev) =>
        prev
          ? { ...prev, team: { id: -1, name: selectedName!, isManager: true } }
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
          if (response.status === 409)
            throw new Error('Une équipe avec ce nom existe déjà');
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

  const handleViewTeam = () => {
    if (user?.team) {
      navigate(`/teams/${user.team.id}`);
    }
  };

  const handleQuit = () => {
    const onConfirm = async (close: () => void) => {
      close();
      if (!user?.team) return;
      const previousTeam = user.team;
      setUser((prev) => (prev ? { ...prev, team: null } : prev));
      try {
        const response = await fetch('/api/teams/quit', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: authenticatedUser?.token ?? '',
          },
        });
        if (!response.ok) throw new Error('Erreur lors du départ de la team.');
        showSnackbar({
          message: "Vous avez quitté l'équipe avec succès.",
          severity: 'success',
        });
      } catch (err) {
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
    openModal(quitConfirmationModal({ onConfirm }));
  };

  return (
    <Stack
      direction="row"
      justifyContent="space-between"
      alignItems="center"
      padding="1.25rem 0"
    >
      <Stack>
        <Typography variant="h6" color="text.secondary">
          {user ? 'Votre Team' : <Skeleton variant="text" width="6rem" />}
        </Typography>
        <Typography
          variant="h4"
          color={user?.team ? 'text.primary' : 'text.secondary'}
        >
          {user ? (
            user.team ? (
              user.team.name
            ) : (
              'Aucune team'
            )
          ) : (
            <Skeleton variant="text" width="10rem" />
          )}
        </Typography>
      </Stack>

      <Stack direction="row" spacing={1} alignItems="center">
        {!user ? (
          <>
            <Skeleton
              variant="rounded"
              width="6rem"
              height="2rem"
              sx={{ borderRadius: '0.75rem' }}
            />
            <Skeleton
              variant="rounded"
              width="2rem"
              height="2rem"
              sx={{ borderRadius: '0.75rem' }}
            />
          </>
        ) : (
          <>
            <Button
              onClick={user.team ? handleQuit : handleJoin}
              variant="contained"
              color="secondary"
            >
              {user.team ? 'Quitter' : 'Rejoindre'}
            </Button>
            <Tooltip
              title={user.team ? 'Voir la team' : 'Créer une team'}
              arrow
              placement="bottom"
            >
              <IconButton
                onClick={user.team ? handleViewTeam : handleCreate}
                color="secondary"
                size="small"
              >
                {user.team ? <ArrowOutward /> : <Add />}
              </IconButton>
            </Tooltip>
          </>
        )}
      </Stack>
    </Stack>
  );
};
