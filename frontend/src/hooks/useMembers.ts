import { useApi } from './useApi';
import { useContext, useRef } from 'react';
import { UserContext } from '../contexts/UserContext';
import { Member, ProfileImage, ProfileInfoDto } from '../types';
import { useSnackbar } from './useSnackbar';

interface UseMembersOptions {
  setUser?: React.Dispatch<React.SetStateAction<ProfileInfoDto | undefined>>;
  setError?: React.Dispatch<
    React.SetStateAction<
      { code: number; message: string; subtitle?: string } | undefined
    >
  >;
  setUsers?: React.Dispatch<React.SetStateAction<Member[]>>;
  setPendingIds?: React.Dispatch<React.SetStateAction<number[]>>;
}

export const useMembers = (options?: UseMembersOptions) => {
  const { setUser, setError, setUsers, setPendingIds } = options ?? {};
  const { authenticatedUser } = useContext(UserContext);
  const { showSnackbar } = useSnackbar();

  const response = useRef<Response | undefined>(undefined);

  const { execute: getAll, loading: isGettingUsers } = useApi(
    async () => {
      const response = await fetch(`/api/members/full`, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: authenticatedUser?.token ?? '',
        },
      });
      if (!response.ok)
        throw new Error('Échec de la récupération des membres.');
      return response.json();
    },
    {
      onSuccess: (data) => setUsers?.(data),
      onError: (err) =>
        showSnackbar({
          message:
            err instanceof Error
              ? err.message
              : 'Une erreur est survenue lors de la récupération des membres.',
          severity: 'error',
        }),
    },
  );

  const { execute: getById } = useApi(
    async (id: number) => {
      if (isNaN(id) || id <= 0) return;

      response.current = await fetch(`/api/members/${id}`, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: authenticatedUser?.token ?? '',
        },
      });
      if (!response.current.ok)
        throw new Error('Échec de la récupération du profil.');
      return response.current.json();
    },
    {
      onSuccess: (data) => setUser?.(data),
      onError: (err) =>
        setError?.({
          code: response.current?.status ?? 500,
          message:
            err instanceof Error ? err.message : 'Une erreur est survenue',
          subtitle:
            'Une erreur est survenue lors de la récupération du profil.',
        }),
    },
  );

  const { execute: updatePassword } = useApi(
    async (newPassword: string) => {
      const response = await fetch(`/api/members/me/password`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: authenticatedUser?.token ?? '',
        },
        body: JSON.stringify({
          password: newPassword,
        }),
      });
      if (!response.ok)
        throw new Error('Échec de la mise à jour du mot de passe.');
    },
    {
      onSuccess: () => {
        showSnackbar({
          message: 'Mot de passe modifié avec succès !',
          severity: 'success',
        });
      },
      onError: (err) =>
        showSnackbar({
          message:
            err instanceof Error
              ? err.message
              : 'Une erreur est survenue lors de la mise à jour du mot de passe.',
          severity: 'error',
        }),
    },
  );

  const { execute: updateAvatar } = useApi(
    async (avatar: ProfileImage, previousAvatar: string) => {
      void previousAvatar;
      const response = await fetch(`/api/members/me/avatar`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: authenticatedUser?.token ?? '',
        },
        body: JSON.stringify(avatar),
      });
      if (!response.ok)
        throw new Error("Échec de la mise à jour de l'image de profil");
    },
    {
      onOptimism: (avatar) => {
        setUser?.((prev) => {
          if (!prev) return prev;
          return { ...prev, avatar: avatar.path };
        });
      },
      onRollback: (_avatar, previousAvatar) => {
        setUser?.((prev) => {
          if (!prev) return prev;
          return { ...prev, avatar: previousAvatar };
        });
      },
      onSuccess: () => {
        showSnackbar({
          message: 'Image de profil mise à jour avec succès !',
          severity: 'success',
        });
      },
      onError: (err) =>
        showSnackbar({
          message:
            err instanceof Error
              ? err.message
              : "Une erreur est survenue lors de la mise à jour de l'image de profil.",
          severity: 'error',
        }),
    },
  );

  const { execute: toggleAdmin } = useApi(
    async (id: number, wasAdmin: boolean) => {
      void wasAdmin;
      const response = await fetch(`/api/members/${id}/admin`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: authenticatedUser?.token ?? '',
        },
      });
      if (!response.ok)
        throw new Error('Échec de la mise à jour du statut administrateur.');
    },
    {
      onOptimism: (id) => {
        setPendingIds?.((prev) => [...prev, id]);
        setUsers?.((prev) => {
          if (!prev) return prev;
          return prev.map((u) => (u.id === id ? { ...u, admin: !u.admin } : u));
        });
      },
      onRollback: (id, wasAdmin) => {
        setUsers?.((prev) => {
          if (!prev) return prev;
          return prev.map((u) => (u.id === id ? { ...u, admin: wasAdmin } : u));
        });
      },
      onSuccess: (_, id, wasAdmin) => {
        setPendingIds?.((prev) => prev.filter((pid) => pid !== id));
        showSnackbar({
          message: wasAdmin
            ? 'Administrateur rétrogradé au rang de membre avec succès !'
            : "Membre promu au rang d'administrateur avec succès !",
          severity: 'success',
        });
      },
      onError: (err, id) => {
        setPendingIds?.((prev) => prev.filter((pid) => pid !== id));
        showSnackbar({
          message:
            err instanceof Error
              ? err.message
              : 'Une erreur est survenue lors de la mise à jour du statut administrateur.',
          severity: 'error',
        });
      },
    },
  );

  return {
    getAll,
    getById,
    updatePassword,
    updateAvatar,
    toggleAdmin,
    isGettingUsers,
  };
};
