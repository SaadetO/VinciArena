import { Dispatch, SetStateAction } from 'react';
import { ModalConfig } from '../../../types';
import { JoinTeamModalContent } from './JoinTeamModalContent';
import { Team } from '../../../types';

export const joinTeamModal = ({
  teams,
  setTeams,
  onSuccess,
}: {
  teams: Team[];
  setTeams: Dispatch<SetStateAction<Team[]>>;
  onSuccess: () => void;
}): ModalConfig => ({
  title: 'Rechercher une Team',
  subtitle: 'Demandez à rejoindre une Team ci-dessous',
  confirmLabel: 'Demander',
  cancelLabel: 'Annuler',
  confirmDisabled: true,
  children: <JoinTeamModalContent 
    teams={teams}
    setTeams={setTeams}
    onSuccess={onSuccess} 
    close={() => {}} 
  />,
  onConfirm: () => {
    document.getElementById('join-team-form')?.dispatchEvent(new Event('submit', { cancelable: true, bubbles: true }));
  },
});
