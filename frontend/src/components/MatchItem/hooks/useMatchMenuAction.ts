import { useSnackbar } from '../../../hooks/useSnackbar';
import { useUser } from '../../../hooks/useUser';

export const useMatchMenuAction = () => {
  const { showSnackbar } = useSnackbar();
  const { authenticatedUser } = useUser();

  const handleForfeit = () => {};

  const handleEditComposition = () => {};

  const handleContestScore = async (matchId: number) => {
    try {
      const response = await fetch(`/api/matches/${matchId}/contest`, {
        method: 'PATCH',
        headers: {
          Authorization: authenticatedUser?.token ?? '',
        },
      });

      if (!response.ok) {
        throw new Error();
      }

      showSnackbar({
        message: 'Résultat contesté !',
        severity: 'success',
      });

      window.location.reload();
    } catch (error) {
      showSnackbar({
        message: 'Erreur lors de la contestation',
        severity: 'error',
      });
    }
  };

  const handleConfirmScore = async (matchId: number) => {
    try {
      const response = await fetch(`/api/matches/${matchId}/confirm`, {
        method: 'PATCH',
        headers: {
          Authorization: authenticatedUser?.token ?? '',
        },
      });

      if (!response.ok) {
        throw new Error();
      }

      showSnackbar({
        message: 'Résultat confirmé !',
        severity: 'success',
      });

      window.location.reload();
    } catch (error) {
      showSnackbar({
        message: 'Erreur lors de la confirmation',
        severity: 'error',
      });
    }
  };

  const handleEncodeScore = () => {};

  const handleEditScore = () => {};

  return {
    handleForfeit,
    handleEditComposition,
    handleContestScore,
    handleConfirmScore,
    handleEncodeScore,
    handleEditScore,
  };
};
