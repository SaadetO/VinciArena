import { Dispatch, SetStateAction, useContext } from 'react';
import { ApiError, ProfileInfoDto, TeamDetailsInfoDto } from '../types';
import { UserContext } from '../contexts/UserContext';
import { useSnackbar } from './useSnackbar';
import { useApi } from './useApi';
import { useModalController } from './useModalController';

interface UseTeamsOptions {
  setUser?: Dispatch<SetStateAction<ProfileInfoDto | undefined>>;
  setTeam?: Dispatch<SetStateAction<TeamDetailsInfoDto | undefined>>;
  setError?: Dispatch<
    SetStateAction<
      { code: number; message: string; subtitle?: string } | undefined
    >
  >;
}

export const useTeams = (options?: UseTeamsOptions) => {
  const { setUser, setError, setTeam } = options ?? {};
  const { authenticatedUser } = useContext(UserContext);
  const { showSnackbar } = useSnackbar();
  const { setError: setErrorModal } = useModalController();

  const { execute: getById, loading: isGettingTeam } = useApi(
    async (idTeam: number) => {
      if (isNaN(idTeam) || idTeam <= 0) return;

      const response = await fetch(`/api/teams/${idTeam}/details`, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: authenticatedUser?.token ?? '',
        },
      });
      if (!response.ok) {
        if (response.status === 404)
          throw new ApiError('Equipe introuvable', response.status);
        throw new ApiError(
          'Échec de la récupération de la Team.',
          response.status,
        );
      }
      return response.json();
    },
    {
      onSuccess: (data) => setTeam?.(data),
      onError: (err) => {
        const status = err instanceof ApiError ? err.status : 500;
        setError?.({
          code: status,
          message:
            err instanceof ApiError ? err.message : 'Une erreur est survenue',
          subtitle:
            status === 404
              ? "La team que vous cherchez n'existe pas ou a été désactivée."
              : 'Une erreur est survenue lors de la récupération de la Team.',
        });
      },
    },
  );

  const { execute: createTeam } = useApi(
    async (selectedName: string) => {
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
          throw new ApiError('Nom de Team déjà pris', response.status);
        else if (response.status === 400)
          throw new ApiError(
            "Utilisateur déjà membre d'une Team",
            response.status,
          );
        else
          throw new ApiError('Échec de la création de Team', response.status);
      }

      return response.json();
    },
    {
      onSuccess: (data) => {
        const team = {
          id: data.idTeam,
          name: data.name,
          isManager: true,
        };
        setUser?.((prev) => (prev ? { ...prev, team } : prev));
        showSnackbar({
          message: 'Team créée avec succès !',
          severity: 'success',
        });
      },

      onError: (err) => {
        const status = err instanceof ApiError ? err.status : 500;
        const subtitle =
          status === 409
            ? 'Une équipe avec ce nom existe déjà.'
            : status === 400
              ? "Vous faites déjà parti d'une équipe." // Should never actually be displayed.
              : 'Une erreur est survenue lors de la création de la Team.';

        setErrorModal(subtitle);
      },
    },
  );

  const { execute: quitTeam, loading: isQuittingTeam } = useApi(
    async () => {
      const response = await fetch('/api/members/team/quit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: authenticatedUser?.token ?? '',
        },
      });

      if (!response.ok) {
        throw new ApiError(
          'Erreur lors du départ de la team.',
          response.status,
        );
      }
    },
    {
      onSuccess: () => {
        setUser?.((prev) => (prev ? { ...prev, team: null } : prev));
        showSnackbar({
          message: "Vous avez quitté l'équipe avec succès.",
          severity: 'success',
        });
      },

      onError: (err) => {
        showSnackbar({
          message:
            err instanceof ApiError
              ? err.message
              : 'Une erreur est survenue en quittant la team.',
          severity: 'error',
        });
      },
    },
  );

  const { execute: createJoinRequest } = useApi(
    async (idTeam: number) => {
      if (isNaN(idTeam) || idTeam <= 0) return;

      const response = await fetch(`/api/teams/${idTeam}/join-requests`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: authenticatedUser?.token ?? '',
        },
      });

      if (!response.ok) {
        if (response.status === 409) {
          throw new ApiError(
            "Vous avez déjà une demande en attente ou faites déjà partie d'une équipe.",
            response.status,
          );
        } else if (response.status === 404) {
          throw new ApiError("Cette équipe n'existe plus.", response.status);
        }
        throw new ApiError(
          "Impossible d'effectuer la demande.",
          response.status,
        );
      }
    },
    {
      onSuccess: () => {
        showSnackbar({
          message: 'Demande effectuée avec succès !',
          severity: 'success',
        });
      },
      onError: (err) => {
        showSnackbar({
          message:
            err instanceof ApiError ? err.message : 'Une erreur est survenue.',
          severity: 'error',
        });
      },
    },
  );

  return {
    getById,
    createTeam,
    quitTeam,
    createJoinRequest,
    isGettingTeam,
    isQuittingTeam,
  };
};
