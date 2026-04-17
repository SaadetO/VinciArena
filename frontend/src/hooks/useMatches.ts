import { Dispatch, SetStateAction } from 'react';
import { ApiError, MatchSummaryDto } from '../types';
import { useApi } from './useApi';
import { useSnackbar } from './useSnackbar';

interface UseMatchesOptions {
  setMatches?: Dispatch<SetStateAction<MatchSummaryDto[]>>;
}

export const useMatches = (config?: UseMatchesOptions) => {
  const { setMatches } = config ?? {};

  const { showSnackbar } = useSnackbar();

  const { execute: getAll, loading: isGettingMatches } = useApi(
    async ({
      memberId,
      teamId,
      searchQuery,
    }: {
      memberId?: number | undefined;
      teamId?: number | undefined;
      searchQuery?: string | undefined;
    }) => {
      const params = new URLSearchParams();
      if (memberId) params.append('memberId', memberId.toString());
      if (teamId) params.append('teamId', teamId.toString());
      if (searchQuery) params.append('searchQuery', searchQuery);

      console.log(
        'fetching matches',
        `/api/matches/${params.size > 0 ? '?' : ''}${params.toString()}`,
      );
      const response = await fetch(
        `/api/matches/${params.size > 0 ? '?' : ''}${params.toString()}`,
      );
      if (!response.ok) {
        throw new ApiError(
          'Échec de la récupération des matchs !',
          response.status,
        );
      }
      return response.json();
    },
    {
      onSuccess: (data) => {
        setMatches?.(data);
      },
      onError: (err) => {
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

  return { getAll, isGettingMatches };
};
