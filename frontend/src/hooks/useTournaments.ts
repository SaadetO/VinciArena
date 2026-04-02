import { useSnackbar } from './useSnackbar';
import { useApi } from './useApi';
import { Dispatch, SetStateAction, useContext } from 'react';
import { UserContext } from '../contexts/UserContext';
import { ApiError, TournamentDetailsInfoDto, TournamentDto } from '../types';

interface UseTournamentOptions {
  setTournaments?: (tournaments: TournamentDto[]) => void;
  setTournament?: Dispatch<SetStateAction<TournamentDetailsInfoDto | undefined>>;
  setError?: Dispatch<
    SetStateAction<
      { code: number; message: string; subtitle?: string } | undefined
    >
  >;
}

export const useTournament = (config: UseTournamentOptions) => {
  const { setTournaments, setTournament, setError } = config;
  const { showSnackbar } = useSnackbar();
  const { authenticatedUser } = useContext(UserContext);

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
        throw new Error('Échec de la récupération des tournois !');
      }
      return response.json();
    },
    {
      onSuccess: (data) => setTournaments?.(data),
      onError: (err) => {
        showSnackbar({
          message:
            err instanceof Error
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
        const errorText = await response.text();
        throw new Error(errorText || 'Échec de la création');
      }
      return response.json();
    },
    {
      onSuccess: (data) => setTournament?.(data),
      onError: (err) => {
        showSnackbar({
          message:
            err instanceof Error
              ? err.message
              : 'Une erreur est survenue lors de la creation du tournoi !',
          severity: 'error',
        });
      },
    },
  );

  const { execute: update } = useApi(
    async (id, data) => {
      const response = await fetch(`/api/tournaments/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: authenticatedUser?.token ?? '',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Échec de la mise à jour');
      }

      return response.json();
    },
    {
      onSuccess: (data) => setTournament?.(data),
      onError: (err) => {
        showSnackbar({
          message:
            err instanceof Error
              ? err.message
              : 'Une erreur est survenue lors de la mise au jour du tournoi !',
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
    isGettingTournaments,
    isGettingTournamentById,
  };
};
