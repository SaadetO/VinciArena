import { ModalConfig } from '../../../types';
import { CreateTeamModalContent } from './CreateTeamModalContent';

export const createTeamModal = ({
  onSelect,
  onConfirm,
}: {
  onSelect: (teamName: string | null) => void;
  onConfirm: (close: () => void) => void;
}): ModalConfig => ({
  title: 'Créer une Team',
  subtitle: "Comment s'appelle votre Team ?",
  confirmLabel: 'Créer',
  cancelLabel: 'Annuler',
  confirmDisabled: true,
  children: <CreateTeamModalContent 
    onSelect={onSelect} 
  />,
  onConfirm: (close) => onConfirm(close),
});
