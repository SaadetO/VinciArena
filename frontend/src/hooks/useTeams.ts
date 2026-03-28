import { Dispatch, SetStateAction, useContext } from 'react';
import {
  ApiError,
  ProfileInfoDto,
  TeamDetailsInfoDto,
  UserSummaryDto,
  Team,
} from '../types';
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
  setTeams?: Dispatch<SetStateAction<Team[]>>;
}

export const useTeams = (options?: UseTeamsOptions) => {
  const { setUser, setError, setTeam, setTeams } = options ?? {};
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

  const { execute: getAll } = useApi(
    async () => {
      const response = await fetch('/api/teams', {
        method: 'GET',
        headers: {
          Authorization: authenticatedUser?.token ?? '',
        },
      });

      if (!response.ok)
        throw new ApiError(
          'Erreur lors de la récupération des Teams',
          response.status,
        );

      return response.json();
    },
    {
      onSuccess: (data) => {
        setTeams?.(data);
      },
      onError: (err) => {
        setErrorModal(
          err instanceof ApiError ? err.message : 'Une erreur est survenue.',
        );
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
      const response = await fetch('/api/members/me/quit-team', {
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

  const { execute: promoteToManager } = useApi(
    async (idTeam: number, selectedManager: UserSummaryDto) => {
      const response = await fetch(
        `/api/teams/${idTeam}/manager/${selectedManager.id}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: authenticatedUser?.token ?? '',
          },
        },
      );

      if (!response.ok) {
        throw new ApiError(
          'Erreur lors de la promotion au rang de manager.',
          response.status,
        );
      }
    },
    {
      onOptimism: (_idTeam, selectedManager) => {
        setTeam?.((prev) =>
          prev
            ? {
                ...prev,
                managers: [...prev.managers, selectedManager!],
              }
            : undefined,
        );
      },
      onSuccess: () => {
        showSnackbar({
          message: 'Utilisateur promu manager avec succès !',
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
      onRollback: (_idTeam, selectedManager) => {
        setTeam?.((prev) =>
          prev
            ? {
                ...prev,
                managers: prev.managers.filter(
                  (m) => m.id !== selectedManager.id,
                ),
              }
            : undefined,
        );
      },
    },
  );

  return {
    getAll,
    getById,
    createTeam,
    quitTeam,
    promoteToManager,
    isGettingTeam,
    isQuittingTeam,
  };
};
