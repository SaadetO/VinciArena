import { useSnackbar } from './useSnackbar';
import { useApi } from './useApi';
import { TournamentDetailsInfoDto, TournamentDto } from '../types';

interface UseTournamentOptions {
  setTournaments?: (tournaments: TournamentDto[]) => void;
  setTournament?: (tournament: TournamentDetailsInfoDto) => void;
}

export const useTournament = (config: UseTournamentOptions) => {
  const { setTournaments, setTournament } = config;
  const { showSnackbar } = useSnackbar();

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

  return { getAll, getById, isGettingTournaments, isGettingTournamentById };
};
