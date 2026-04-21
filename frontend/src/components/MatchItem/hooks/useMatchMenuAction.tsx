import { useMatches } from '../../../hooks/useMatches';
import { useModal } from '../../../hooks/useModal';
import { useModalController } from '../../../hooks/useModalController';
import { ConfirmOrContestMatchParams } from '../../../types';
import { scoresConfirmationModal } from '../modals/scoresConfirmationModal';
export const useMatchMenuAction = ({ refetch }: { refetch: () => void }) => {
  const { confirmOrContestMatch } = useMatches({ refetch });
  const { openModal } = useModal();
  const { setLoading } = useModalController();

  const handleForfeit = () => {};

  const handleConfirmOrContestScore = (params: ConfirmOrContestMatchParams) => {
    openModal(
      scoresConfirmationModal({
        isConfirm: params.isConfirming,
        onConfirm: async (close) => {
          setLoading(true);
          await confirmOrContestMatch(params);
          close();
        },
      }),
    );
  };

  const handleEncodeScore = () => {};

  const handleEditScore = () => {};

  return {
    handleForfeit,
    handleConfirmOrContestScore,
    handleEncodeScore,
    handleEditScore,
  };
};
