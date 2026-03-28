import { Dispatch, SetStateAction, useContext } from 'react';
import { ApiError, JoinRequestDto, TeamDetailsInfoDto } from '../types';
import { useApi } from './useApi';
import { useSnackbar } from './useSnackbar';
import { UserContext } from '../contexts/UserContext';

interface UseJoinRequestsOptions {
  setTeam?: Dispatch<SetStateAction<TeamDetailsInfoDto | undefined>>;
}

export const useJoinRequests = (options?: UseJoinRequestsOptions) => {
  const { setTeam } = options ?? {};
  const { authenticatedUser } = useContext(UserContext);
  const { showSnackbar } = useSnackbar();

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

  const { execute: updateJoinRequestStatus, loading: isUpdatingJoinRequest } =
    useApi(
      async (joinRequest: JoinRequestDto, status: 'ACCEPTED' | 'REJECTED') => {
        const response = await fetch(
          `/api/teams/join-requests/${joinRequest.idJoinRequest}`,
          {
            method: 'PATCH',
            headers: {
              'Content-Type': 'application/json',
              Authorization: authenticatedUser?.token ?? '',
            },
            body: JSON.stringify(status),
          },
        );

        if (!response.ok) {
          throw new ApiError('Une erreur est survenue.', response.status);
        }
      },
      {
        onOptimism: (joinRequest, status) => {
          setTeam?.((prev) => {
            if (!prev) return prev;

            const updatedRequests = (prev.joinRequests ?? []).filter(
              (jr) => jr.idJoinRequest !== joinRequest.idJoinRequest,
            );

            const updatedMembers =
              status === 'ACCEPTED'
                ? [...(prev.members ?? []), joinRequest.requester]
                : (prev.members ?? []);

            return {
              ...prev,
              joinRequests: updatedRequests,
              members: updatedMembers,
            };
          });
        },
        onSuccess: (_data, _joinRequest, status) => {
          showSnackbar({
            message:
              status === 'ACCEPTED' ? 'Demande acceptée !' : 'Demande refusée.',
            severity: 'success',
          });
        },
        onError: (err) => {
          showSnackbar({
            message:
              err instanceof ApiError
                ? err.message
                : 'Une erreur est survenue.',
            severity: 'error',
          });
        },
        onRollback: (joinRequest, _status) => {
          setTeam?.((prev) => {
            if (!prev) return prev;

            const rolledBackMembers = prev.members.filter(
              (m) => m.id !== joinRequest.requester.id,
            );

            return {
              ...prev,
              joinRequests: [...(prev.joinRequests ?? []), joinRequest],
              members: rolledBackMembers,
            };
          });
        },
      },
    );

  return {
    createJoinRequest,
    updateJoinRequestStatus,
    isUpdatingJoinRequest,
  };
};
