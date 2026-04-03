import { useSnackbar } from './useSnackbar';
import { useApi } from './useApi';
import { Dispatch, SetStateAction, useContext } from 'react';
import { UserContext } from '../contexts/UserContext';
import { ApiError, TournamentDetailsInfoDto, TournamentDto } from '../types';
import { useNavigate } from 'react-router-dom';

interface UseTournamentOptions {
  setTournaments?: (tournaments: TournamentDto[]) => void;
  setTournament?: Dispatch<
    SetStateAction<TournamentDetailsInfoDto | undefined>
  >;
  setError?: Dispatch<
    SetStateAction<
      { code: number; message: string; subtitle?: string } | undefined
    >
  >;
  onSuccess?: (data: TournamentDetailsInfoDto) => void;
  onError?: (err: Error) => void;
}

export const useTournament = (config: UseTournamentOptions) => {
  const { setTournaments, setTournament, setError, onError, onSuccess } =
    config;
  const { showSnackbar } = useSnackbar();
  const { authenticatedUser } = useContext(UserContext);
  const navigate = useNavigate();

  const { execute: getAll, loading: isGettingTournaments } = useApi(
    async ({
      statuses,
      members,
      teams,
      searchQuery,
    }: {
      statuses: string[] | undefined;
      members: number[] | undefined;
      teams: number[] | undefined;
      searchQuery?: string | undefined;
    }) => {
      const params = new URLSearchParams();
      if (statuses && statuses.length > 0)
        params.append('statuses', statuses.join(','));
      if (members && members.length > 0)
        params.append('membersIds', members.join(','));
      if (teams && teams.length > 0) params.append('teamsIds', teams.join(','));
      if (searchQuery) params.append('search', searchQuery);

      const response = await fetch(
        `/api/tournaments${params.size > 0 ? '?' : ''}${params.toString()}`,
      );
      if (!response.ok) {
        throw new ApiError(
          'Échec de la récupération des tournois !',
          response.status,
        );
      }
      return response.json();
    },
    {
      onSuccess: (data) => {
        setTournaments?.(data);
        config.onSuccess?.(data);
      },
      onError: (err) => {
        config.onError?.(err);
        showSnackbar({
          message:
            err instanceof ApiError
              ? err.message
              : 'Une erreur est survenue lors de la récupération des tournois !',
          severity: 'error',
        });
      },
    },
  );

  const { execute: getById, loading: isGettingTournamentById } = useApi(
    async (id: number) => {
      const response = await fetch(`/api/tournaments/${id}`);
      if (!response.ok) {
        if (response.status === 404)
          throw new ApiError('Tournoi introuvable', response.status);
        throw new ApiError(
          'Échec de la récupération du tournoi !',
          response.status,
        );
      }
      return response.json();
    },
    {
      onSuccess: (data) => setTournament?.(data),
      onError: (err) => {
        const status = err instanceof ApiError ? err.status : 500;
        setError?.({
          code: status,
          message:
            err instanceof ApiError ? err.message : 'Une erreur est survenue',
          subtitle:
            status === 404
              ? "Le tournoi que vous cherchez n'existe pas ou a été supprimé."
              : 'Une erreur est survenue lors de la récupération du tournoi.',
        });
      },
    },
  );

  const { execute: create } = useApi(
    async (data: Partial<TournamentDetailsInfoDto>) => {
      const response = await fetch('/api/tournaments/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: authenticatedUser?.token ?? '',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new ApiError('Échec de la création du tournoi', response.status);
      }
      return response.json();
    },
    {
      onSuccess: (data) => {
        setTournament?.(data);
        onSuccess?.(data);
        if (data.idTournament) {
          navigate(`/tournaments/${data.idTournament}`);
        }
      },
      onError: (err) => {
        onError?.(err);
        showSnackbar({
          message:
            err instanceof ApiError
              ? err.message
              : 'Une erreur est survenue lors de la création du tournoi',
          severity: 'error',
        });
      },
    },
  );

  const { execute: update } = useApi(
    async (id: number, data: Partial<TournamentDetailsInfoDto>) => {
      const response = await fetch(`/api/tournaments/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: authenticatedUser?.token ?? '',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new ApiError('Échec de la mise à jour', response.status);
      }

      return response.json();
    },
    {
      onSuccess: (data) => {
        setTournament?.(data);
        onSuccess?.(data);
      },
      onError: (err) => {
        onError?.(err);
        showSnackbar({
          message:
            err instanceof ApiError
              ? err.message
              : 'Une erreur est survenue lors de la mise à jour du tournoi',
          severity: 'error',
        });
      },
    },
  );

  const { execute: publish } = useApi(
    async (id: number) => {
      const response = await fetch(`/api/tournaments/${id}/publish`, {
        method: 'PATCH',
        headers: {
          Authorization: authenticatedUser?.token ?? '',
        },
      });

      if (!response.ok) {
        throw new ApiError(
          'Échec de la publication du tournoi',
          response.status,
        );
      }

      return response.json();
    },
    {
      onOptimism: () => {
        setTournament?.((prev) => {
          if (!prev) return prev;
          return { ...prev, status: 'REGISTRATION_OPEN' };
        });
      },
      onSuccess: (data) => {
        setTournament?.((prev) => {
          if (!prev) return data;
          return { ...prev, ...data };
        });
        showSnackbar({
          message: 'Tournoi publié avec succès',
          severity: 'success',
        });
      },
      onRollback: () => {
        setTournament?.((prev) => {
          if (!prev) return prev;
          return { ...prev, status: 'IN_PREPARATION' };
        });
      },
      onError: (err) => {
        showSnackbar({
          message:
            err instanceof ApiError
              ? err.message
              : 'Une erreur est survenue lors de la publication du tournoi',
          severity: 'error',
        });
      },
    },
  );

  const { execute: register } = useApi(
    async (id: number) => {
      const response = await fetch(`/api/tournaments/${id}/register`, {
        method: 'POST',
        headers: {
          Authorization: authenticatedUser?.token ?? '',
        },
      });

      if (!response.ok) {
        if (response.status === 400)
          throw new ApiError(
            'Équipe inactive ou insuffisante.',
            response.status,
          );
        else if (response.status === 403)
          throw new ApiError('Droits de manager requis.', response.status);
        else if (response.status === 404)
          throw new ApiError('Tournoi introuvable.', response.status);
        else if (response.status === 409)
          throw new ApiError('Déjà inscrit.', response.status);
        throw new ApiError("Échec de l'inscription.", response.status);
      }

      return await response.json();
    },
    {
      onSuccess: (data) => {
        setTournament?.(data);
        showSnackbar({
          message: 'Votre équipe a été inscrite avec succès !',
          severity: 'success',
        });
      },
      onError: (err) => {
        const status = err instanceof ApiError ? err.status : 500;

        const message =
          status === 400
            ? 'Votre équipe ne contient pas assez de membres (4 minimum)'
            : status === 403
              ? "Seul un responsable d'équipe peut inscrire son équipe."
              : status === 404
                ? "Ce tournoi n'existe pas ou a été supprimé."
                : status === 409
                  ? 'Votre équipe est déjà inscrite à ce tournoi.'
                  : "Une erreur est survenue lors de l'inscription.";

        showSnackbar({
          message,
          severity: 'error',
        });
      },
    },
  );

  return {
    getAll,
    getById,
    create,
    update,
    publish,
    register,
    isGettingTournaments,
    isGettingTournamentById,
  };
};
