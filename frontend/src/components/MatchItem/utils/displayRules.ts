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

  const team1 = match.team1;
  const team2 = match.team2;

  const managedTeam: MatchTeamDto | null =
    team1?.idTeam === managedTeamId
      ? team1
      : team2?.idTeam === managedTeamId
        ? team2
        : null;

  const isManagerOfParticipant = !!managedTeam;

  const bothTeamsScoresHaveBeenConfirmed =
    team1?.hasConfirmedResults === true && team2?.hasConfirmedResults === true;

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
  const isInProgress = match.status === 'IN_PROGRESS';
  const isPlayed = match.status === 'PLAYED';
  const isForfeit = match.status === 'FORFEIT';

  const bothTeamsKnown = team1 && team2;

  const showForfeit =
    isPlanned && !isForfeit && isManagerOfParticipant && bothTeamsKnown;

  const showEditComposition = isManagerOfParticipant && isPlanned;
  const showTeamSection = showForfeit || showEditComposition;

  const hasContestedScore =
    team1?.hasConfirmedResults === false ||
    team2?.hasConfirmedResults === false;

  const showScoresSection =
    isManagerOfParticipant &&
    isPlayed &&
    !managedTeamScoresHaveBeenConfirmedOrContested;

  const showAdminEncode = isAdmin && isInProgress;

  const showAdminModify =
    isAdmin &&
    (match.status === 'AWAITING_VALIDATION' || isPlayed) &&
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

  const isInProgress = match.status === 'IN_PROGRESS';

  const team =
    match.team1?.idTeam === authenticatedUser?.managedTeamId
      ? match.team1
      : match.team2?.idTeam === authenticatedUser?.managedTeamId
        ? match.team2
        : null;

  const canConfirmScores = team?.hasConfirmedResults === null && isPlayed;

  // TODO: check if the user already has registered members in the match for canEditComposition
  const canEditComposition = team && isPlanned;

  const canEncodeScores = isAdmin && isInProgress;

  const canEditScores =
    isAdmin &&
    (match.status === 'AWAITING_VALIDATION' || isPlayed) &&
    (match?.team1.hasConfirmedResults === false ||
      match?.team2.hasConfirmedResults === false);

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
