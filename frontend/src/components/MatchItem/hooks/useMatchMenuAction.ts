import { useMatches } from '../../../hooks/useMatches';
import { ConfirmOrContestMatchParams } from '../../../types';

export const useMatchMenuAction = ({ refetch }: { refetch: () => void }) => {
  const { confirmOrContestMatch } = useMatches({ refetch });

  const handleForfeit = () => {};

  const handleEditComposition = () => {};

  const handleConfirmScore = async (params: ConfirmOrContestMatchParams) => {
    await confirmOrContestMatch(params);
  };

  const handleContestScore = async (params: ConfirmOrContestMatchParams) => {
    await confirmOrContestMatch(params);
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
