import dayjs from 'dayjs';
import {
  MatchSummaryDto,
  MatchTeamDto,
  MaybeAuthenticatedUser,
} from '../../../types';

interface UseMenuSectionDisplayProps {
  match: MatchSummaryDto;
  authenticatedUser: MaybeAuthenticatedUser;
}

export const getMenuSectionDisplay = ({
  match,
  authenticatedUser,
}: UseMenuSectionDisplayProps) => {
  const isAdmin = authenticatedUser?.admin ?? false;
  const managedTeamId = authenticatedUser?.managedTeamId;

  let managedTeam: MatchTeamDto | undefined;
  let opponentTeam: MatchTeamDto | undefined;

  if (match.team1?.idTeam === managedTeamId) {
    managedTeam = match.team1;
    opponentTeam = match.team2;
  } else if (match.team2?.idTeam === managedTeamId) {
    managedTeam = match.team2;
    opponentTeam = match.team1;
  }

  const isManagerOfParticipant = managedTeam != undefined;

  const bothTeamsScoresHaveBeenConfirmed =
    managedTeam?.hasConfirmedResults === true &&
    opponentTeam?.hasConfirmedResults === true;

  if (bothTeamsScoresHaveBeenConfirmed)
    return {
      showTeamSection: false,
      showForfeit: false,
      showEditComposition: false,
      showScoresSection: false,
      showAdminEncode: false,
      showAdminModify: false,
      showAdminSection: false,
      needsDividerAfterTeam: false,
      needsDividerAfterScores: false,
      displayMenu: false,
    };

  const managedTeamScoresHaveBeenConfirmedOrContested =
    managedTeam?.hasConfirmedResults != null;

  const isPlanned = match.status === 'PLANNED';
  const isPlayed = match.status === 'PLAYED';
  const matchDatePassed = dayjs(match.dateHour).isBefore(dayjs());

  const bothTeamsKnown = match.team1 != null && match.team2 != null;
  const showForfeit = isManagerOfParticipant && isPlanned && bothTeamsKnown;

  const showEditComposition =
    isManagerOfParticipant && isPlanned && !matchDatePassed;
  const showTeamSection = showForfeit || showEditComposition;

  const showScoresSection =
    isManagerOfParticipant &&
    isPlayed &&
    !managedTeamScoresHaveBeenConfirmedOrContested;

  const showAdminEncode = isAdmin && isPlanned && matchDatePassed;

  const showAdminModify =
    isAdmin && isPlayed && !bothTeamsScoresHaveBeenConfirmed;
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

  const isTournamentPublic = match.tournament.status === 'PLANNED';

  const isTournamentDone = match.tournament.status === 'DONE';

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
