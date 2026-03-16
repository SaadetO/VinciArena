import { ModalConfig } from '../../../types';
import { CreateTeamModalContent } from './CreateTeamModalContent';

export const createTeamModal = ({
  onSuccess,
}: {
  onSuccess: (team: { id: number; name: string; isManager: boolean }) => void;
}): ModalConfig => ({
  title: 'Créer une Team',
  subtitle: "Comment s'appelle votre Team ?",
  confirmLabel: 'Créer',
  cancelLabel: 'Annuler',
  confirmDisabled: true,
  children: <CreateTeamModalContent 
    onSuccess={onSuccess} 
    close={() => {}} // Will be injected via cloning or we can just trigger submit via DOM
  />,
  onConfirm: () => {
    // We trigger the form submit so CreateTeamModalContent can handle its own state
    document.getElementById('create-team-form')?.dispatchEvent(new Event('submit', { cancelable: true, bubbles: true }));
  },
});
