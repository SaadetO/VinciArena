import { Dispatch, SetStateAction } from 'react';
import {
  ApiError,
  ConfirmOrContestMatchParams,
  EncodeMatchResultDto,
  MatchSummaryDto,
} from '../types';
import { useApi } from './useApi';
import { useSnackbar } from './useSnackbar';
import { useUser } from './useUser';

interface UseMatchesOptions {
  setMatches?: Dispatch<SetStateAction<MatchSummaryDto[]>>;
  refetch?: () => void;
}

export const useMatches = (config?: UseMatchesOptions) => {
  const { setMatches, refetch } = config ?? {};
  const { showSnackbar } = useSnackbar();
  const { authenticatedUser } = useUser();

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

  const {
    execute: confirmOrContestMatch,
    loading: isConfirmingOrContestingMatch,
  } = useApi(
    async ({
      id,
      isTeam1,
      isConfirming,
      previousMatch,
    }: ConfirmOrContestMatchParams) => {
      void previousMatch, isTeam1, isConfirming;
      if (isNaN(id) || id <= 0) return;

      const query = isConfirming
        ? `/api/matches/${id}/confirm`
        : `/api/matches/${id}/contest`;
      const response = await fetch(query, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: authenticatedUser?.token ?? '',
        },
      });
      if (!response.ok) {
        throw new ApiError(
          'Échec de la mise à jour du match !',
          response.status,
        );
      }
    },
    {
      onSuccess: (_, { isConfirming }) => {
        refetch?.();
        showSnackbar({
          message: `Scores ${isConfirming ? 'confirmés' : 'contestés'} avec succès !`,
          severity: 'success',
        });
      },
      onError: (err) => {
        showSnackbar({
          message:
            err instanceof ApiError
              ? err.message
              : 'Une erreur est survenue lors de la mise à jour du match !',
          severity: 'error',
        });
      },
    },
  );

  const { execute: encodeMatchResult, loading: isEncodingMatchResult } = useApi(
    async ({ id, dto }: { id: number; dto: EncodeMatchResultDto }) => {
      if (isNaN(id) || id <= 0) return;

      const response = await fetch(`/api/matches/${id}/result`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: authenticatedUser?.token ?? '',
        },
        body: JSON.stringify(dto),
      });
      if (!response.ok) {
        throw new ApiError("Échec de l'encodage des scores !", response.status);
      }
    },
    {
      onSuccess: () => {
        refetch?.();
        showSnackbar({
          message: 'Scores encodés avec succès !',
          severity: 'success',
        });
      },
      onError: (err) => {
        showSnackbar({
          message:
            err instanceof ApiError
              ? err.message
              : "Une erreur est survenue lors de l'encodage des scores !",
          severity: 'error',
        });
      },
    },
  );

  return {
    getAll,
    isGettingMatches,
    confirmOrContestMatch,
    isConfirmingOrContestingMatch,
    encodeMatchResult,
    isEncodingMatchResult,
  };
};
