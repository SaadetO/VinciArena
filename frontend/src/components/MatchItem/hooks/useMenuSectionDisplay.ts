import dayjs from 'dayjs';
import {
  MatchSummaryDto,
  MaybeAuthenticatedUser,
  TournamentStatus,
} from '../../../types';

interface UseMenuSectionDisplayProps {
  match: MatchSummaryDto;
  tournamentStatus: TournamentStatus;
  authenticatedUser: MaybeAuthenticatedUser;
}

export const useMenuSectionDisplay = ({
  match,
  tournamentStatus,
  authenticatedUser,
}: UseMenuSectionDisplayProps) => {
  const isAdmin = authenticatedUser?.admin ?? false;
  const managedTeamId = authenticatedUser?.managedTeamId;

  const isManagerOfParticipant =
    managedTeamId != null &&
    (match.team1?.idTeam === managedTeamId ||
      match.team2?.idTeam === managedTeamId);

  const isPlanned = match.status === 'PLANNED';
  const isPlayed = match.status === 'PLAYED';
  const matchDatePassed = dayjs(match.dateHour).isBefore(dayjs());

  const bothTeamsKnown = match.team1 != null && match.team2 != null;
  const showForfeit = isManagerOfParticipant && isPlanned && bothTeamsKnown;

  const showEditComposition =
    isManagerOfParticipant && isPlanned && !matchDatePassed;
  const showTeamSection = showForfeit || showEditComposition;

  const showScoresSection =
    isManagerOfParticipant && isPlayed && !match.isConfirmed;

  const showAdminEncode = isAdmin && isPlanned && matchDatePassed;

  const showAdminModify = isAdmin && isPlayed && !match.isConfirmed;
  const showAdminSection = showAdminEncode || showAdminModify;

  const visibleSections = [
    showTeamSection,
    showScoresSection,
    showAdminSection,
  ].filter(Boolean);
  const needsDividerAfterTeam = showTeamSection && visibleSections.length > 1;
  const needsDividerAfterScores = showScoresSection && showAdminSection;

  const hasAnySection =
    showTeamSection || showScoresSection || showAdminSection;

  const isTournamentPublic = tournamentStatus === 'PLANNED';

  const isTournamentDone = tournamentStatus === 'DONE';

  const displayMenu = hasAnySection && isTournamentPublic && !isTournamentDone;

  return {
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
  };
};
