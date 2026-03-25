import { Dispatch, SetStateAction, useContext, useRef } from 'react';
import { ProfileInfoDto, TeamDetailsInfoDto } from '../types';
import { UserContext } from '../contexts/UserContext';
//import { useSnackbar } from './useSnackbar';
import { useApi } from './useApi';

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
  const { setError, setTeam } = options ?? {};
  const { authenticatedUser } = useContext(UserContext);
  //const { showSnackbar } = useSnackbar();

  const response = useRef<Response | undefined>(undefined);

  const { execute: getById, loading: isGettingTeam } = useApi(
    async (idTeam: number) => {
      if (isNaN(idTeam) || idTeam <= 0) return;

      response.current = await fetch(`/api/teams/${idTeam}/details`, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: authenticatedUser?.token ?? '',
        },
      });
      if (!response.current.ok) {
        if (response.current.status === 404)
          throw new Error('Equipe introuvable');
        throw new Error('Échec de la récupération de la Team.');
      }
      return response.current.json();
    },
    {
      onSuccess: (data) => setTeam?.(data),
      onError: (err) =>
        setError?.({
          code: response.current?.status ?? 500,
          message:
            err instanceof Error ? err.message : 'Une erreur est survenue',
          subtitle:
            response.current?.status === 404
              ? "La team que vous cherchez n'existe pas ou a été désactivée."
              : 'Une erreur est survenue lors de la récupération de la Team',
        }),
    },
  );

  return {
    getById,
    isGettingTeam,
  };
};
