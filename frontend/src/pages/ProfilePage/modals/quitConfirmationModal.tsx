import { ModalConfig } from '../../../types';

export const quitConfirmationModal = ({
  onConfirm,
}: {
  onConfirm: (close: () => void) => void;
}): ModalConfig => ({
  title: 'Quitter la Team',
  subtitle:
    'Êtes-vous sûr de vouloir quitter cette Team ? Cette action est irréversible.',
  confirmLabel: 'Quitter',
  confirmColor: 'error',
  cancelLabel: 'Annuler',
  onConfirm: (close) => onConfirm(close),
  onCancel: (close) => close(),
});
