import { MatchTeamDto } from '../types';

export const isConfirmed = (team: MatchTeamDto) => {
  return (
    team.confirmationStatus === 'CONFIRMED' ||
    team.confirmationStatus === 'ADMIN_LOCKED'
  );
};

export const isContested = (team: MatchTeamDto) => {
  return team.confirmationStatus === 'CONTESTED';
};

export const isPending = (team: MatchTeamDto) => {
  return team.confirmationStatus === 'PENDING';
};
