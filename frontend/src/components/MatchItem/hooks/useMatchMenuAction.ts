import { useMatches } from '../../../hooks/useMatches';
import { useModal } from '../../../hooks/useModal';
import { useModalController } from '../../../hooks/useModalController';
import { ConfirmOrContestMatchParams, MatchSummaryDto } from '../../../types';
import { adminEncodeScoreModal } from '../modals/adminEncodeScoreModal';
import { scoresConfirmationModal } from '../modals/scoresConfirmationModal';

export const useMatchMenuAction = ({
  match,
  refetch,
}: {
  match: MatchSummaryDto;
  refetch: () => void;
}) => {
  const { confirmOrContestMatch, encodeMatchResult } = useMatches({ refetch });
  const { openModal } = useModal();
  const { setLoading } = useModalController();

  const handleForfeit = () => {};

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

  const handleEncodeScore = () => {
    openModal(
      adminEncodeScoreModal({
        match,
        onConfirm: async (score1, score2, close) => {
          setLoading(true);
          await encodeMatchResult({
            id: match.idMatch,
            dto: { scoreTeam1: score1, scoreTeam2: score2 },
          });
          close();
        },
      }),
    );
  };

  const handleEditScore = () => {
    openModal(
      adminEncodeScoreModal({
        match,
        isEdit: true,
        onConfirm: async (score1, score2, close) => {
          setLoading(true);
          await encodeMatchResult({
            id: match.idMatch,
            dto: { scoreTeam1: score1, scoreTeam2: score2 },
          });
          close();
        },
      }),
    );
  };

  return {
    handleForfeit,
    handleEditComposition,
    handleConfirmOrContestScore,
    handleEncodeScore,
    handleEditScore,
  };
};
