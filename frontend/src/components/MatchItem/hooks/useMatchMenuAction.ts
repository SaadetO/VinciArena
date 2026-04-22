import { useMatches } from '../../../hooks/useMatches';
import { useModal } from '../../../hooks/useModal';
import { useModalController } from '../../../hooks/useModalController';
import {
  ConfirmOrContestMatchParams,
  DeclareForfeitMatchParams,
} from '../../../types';
import { declareForfeitModal } from '../modals/declareForfeitModal';
import { scoresConfirmationModal } from '../modals/scoresConfirmationModal';

export const useMatchMenuAction = ({ refetch }: { refetch: () => void }) => {
  const { confirmOrContestMatch } = useMatches({ refetch });
  const { declareForfeit } = useMatches({ refetch });
  const { openModal } = useModal();
  const { setLoading } = useModalController();

  const handleForfeit = (params: DeclareForfeitMatchParams) => {
    openModal(
      declareForfeitModal({
        onConfirm: async (close) => {
          setLoading(true);
          await declareForfeit(params);
          close();
        },
      }),
    );
  };

  const handleEditComposition = () => {};

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
    handleEditComposition,
    handleConfirmOrContestScore,
    handleEncodeScore,
    handleEditScore,
  };
};
