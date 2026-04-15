import { useApi } from '../../../hooks/useApi';
import { useSnackbar } from '../../../hooks/useSnackbar';
import { useContext } from 'react';
import { UserContext } from '../../../contexts/UserContext';
import { ApiError } from '../../../types';

export const useMatchMenuAction = () => {
  const handleForfeit = () => {};

  const handleEditComposition = () => {};

  const handleContestScore = (matchId: number) => {};

  const handleConfirmScore = (matchId: number) => {};

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
