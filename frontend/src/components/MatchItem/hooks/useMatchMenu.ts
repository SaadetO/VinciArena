import { useTheme } from '@mui/material';
import { useMenuDisclosure } from '../../../hooks/useMenuDisclosure';
import { useUser } from '../../../hooks/useUser';
import { MatchSummaryDto, TournamentStatus } from '../../../types';
import { useMenuSectionDisplay } from './useMenuSectionDisplay';
import { useMatchMenuAction } from './useMatchMenuAction';

interface MatchMenuProps {
  match: MatchSummaryDto;
  tournamentStatus: TournamentStatus;
}

export const useMatchMenu = ({ match, tournamentStatus }: MatchMenuProps) => {
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
    displayMenu,
  } = useMenuSectionDisplay({ match, authenticatedUser, tournamentStatus });
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
    displayMenu,
    handleForfeit,
    handleEditComposition,
    handleContestScore: () => handleContestScore(match.idMatch),
    handleConfirmScore: () => handleConfirmScore(match.idMatch),
    handleEncodeScore,
    handleEditScore,
  };
};
