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
  const isForfeit = match.status === 'FORFEIT';
  const matchDatePassed = dayjs(match.dateHour).isBefore(dayjs());

  const bothTeamsKnown = match.team1 != null && match.team2 != null;

  const showForfeit =
    isPlanned && !isForfeit && isManagerOfParticipant && bothTeamsKnown;

  const showEditComposition =
    isManagerOfParticipant && isPlanned && !matchDatePassed;
  const showTeamSection = showForfeit || showEditComposition;

  const hasContestedScore =
    managedTeam?.hasConfirmedResults === false ||
    opponentTeam?.hasConfirmedResults === false;

  const showScoresSection =
    isManagerOfParticipant &&
    isPlayed &&
    !managedTeamScoresHaveBeenConfirmedOrContested;

  const showAdminEncode = isAdmin && isPlanned && matchDatePassed;

  const showAdminModify =
    isAdmin &&
    isPlayed &&
    !bothTeamsScoresHaveBeenConfirmed &&
    hasContestedScore;
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

  const isTournamentActive =
    match.tournament.status === 'PLANNED' ||
    match.tournament.status === 'IN_PROGRESS';

  const displayMenu = hasAnySection && isTournamentActive;

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

export const getOverlayDisplay = ({
  match,
  authenticatedUser,
}: {
  match: MatchSummaryDto;
  authenticatedUser: MaybeAuthenticatedUser;
}) => {
  if (match.tournament.status === 'REGISTRATION_CLOSED')
    return {
      displayOverlay: false,
      getOverlayLabel: () => '',
    };
  const isAdmin = authenticatedUser?.admin;

  const isPlanned = match.status === 'PLANNED';

  const isPlayed = match.status === 'PLAYED';

  const team =
    match.team1.idTeam === authenticatedUser?.managedTeamId
      ? match.team1
      : match.team2.idTeam === authenticatedUser?.managedTeamId
        ? match.team2
        : null;

  const matchDatePassed = dayjs(match.dateHour).isBefore(dayjs());

  const canConfirmScores = team?.hasConfirmedResults === null && isPlayed;

  // TODO: check if the user already has registered members in the match for canEditComposition
  const canEditComposition = team && isPlanned && !matchDatePassed;

  const canEncodeScores = isAdmin && isPlanned && matchDatePassed;

  const canEditScores =
    isAdmin &&
    isPlayed &&
    (match.team1.hasConfirmedResults === false ||
      match.team2.hasConfirmedResults === false);

  const displayOverlay =
    canConfirmScores || canEditComposition || canEncodeScores || canEditScores;

  const getOverlayLabel = () => {
    if (canEncodeScores) return 'Veuillez encoder les scores de ce match.';
    if (canEditScores) return 'Veuillez corriger les scores de ce match.';
    if (canConfirmScores)
      return 'Veuillez confirmer ou contester les scores de ce match.';
    if (canEditComposition)
      return 'Veuillez enregistrer des joueurs pour ce match.';
  };

  return {
    displayOverlay,
    getOverlayLabel,
  };
};
