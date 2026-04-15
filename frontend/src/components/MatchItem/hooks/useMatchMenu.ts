import { useTheme } from '@mui/material';
import { useMenuDisclosure } from '../../../hooks/useMenuDisclosure';
import { useUser } from '../../../hooks/useUser';
import { MatchSummaryDto } from '../../../types';
import { useMenuSectionDisplay } from './useMenuSectionDisplay';
import { useMatchMenuAction } from './useMatchMenuAction';

interface MatchMenuProps {
  match: MatchSummaryDto;
}

export const useMatchMenu = ({ match }: MatchMenuProps) => {
  const theme = useTheme();
  const { anchorEl, handleClick, handleClose } = useMenuDisclosure();
  const { authenticatedUser } = useUser();
  const {
    showTeamSection,
    showForfeit,
    showEditComposition,
    showScoresSection,
    showAdminEncode,
    showAdminModify,
    showAdminSection,
    needsDividerAfterTeam,
    needsDividerAfterScores,
    hasAnySection,
  } = useMenuSectionDisplay({ match, authenticatedUser });
  const {
    handleForfeit,
    handleEditComposition,
    handleContestScore,
    handleConfirmScore,
    handleEncodeScore,
    handleEditScore,
  } = useMatchMenuAction();

  return {
    theme,
    anchorEl,
    handleClick,
    handleClose,
    showTeamSection,
    showForfeit,
    showEditComposition,
    showScoresSection,
    showAdminEncode,
    showAdminModify,
    showAdminSection,
    needsDividerAfterTeam,
    needsDividerAfterScores,
    hasAnySection,
    handleForfeit,
    handleEditComposition,
    handleContestScore,
    handleConfirmScore,
    handleEncodeScore,
    handleEditScore,
  };
};
