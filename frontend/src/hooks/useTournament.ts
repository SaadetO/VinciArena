import { useSnackbar } from './useSnackbar';
import { useApi } from './useApi';
import { useContext } from 'react';
import { UserContext } from '../contexts/UserContext';
import { TournamentDetailsInfoDto, TournamentDto } from '../types';

interface UseTournamentOptions {
  setTournaments?: (tournaments: TournamentDto[]) => void;
  setTournament?: (tournament: TournamentDetailsInfoDto) => void;
}

export const useTournament = (config: UseTournamentOptions) => {
  const { setTournaments, setTournament } = config;
  const { showSnackbar } = useSnackbar();
  const { authenticatedUser } = useContext(UserContext);

  const { execute: getAll, loading: isGettingTournaments } = useApi(
    async ({
      timeframe,
      members,
      teams,
    }: {
      timeframe: 'past' | 'current' | 'future' | undefined;
      members: number[] | undefined;
      teams: number[] | undefined;
    }) => {
      let query = timeframe ? `?timeframe=${timeframe}` : '';
      if (members)
        query += (query ? '&' : '?') + 'membersIds=' + members.join(',');
      if (teams) query += (query ? '&' : '?') + 'teamsIds=' + teams.join(',');
      const response = await fetch(`/api/tournaments${query}`);
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
        throw new Error('Échec de la récupération du tournoi !');
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
              : 'Une erreur est survenue lors de la récupération du tournoi !',
          severity: 'error',
        });
      },
    },
  );

  // insert new tournament
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
      return await response.json();
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

  // update existing tournament (TO BE TESTED)
  // METHOD PUT TO BE IMPLEMENTED IN THE BACKEND
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

      return await response.json();
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
