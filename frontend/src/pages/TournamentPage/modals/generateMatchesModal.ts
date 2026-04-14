import { ModalConfig } from '../../../types';

export const generateMatchesModal = (
  onConfirm: (close: () => void) => void,
): ModalConfig => ({
  title: 'Générer les matchs',
  subtitle:
    'Êtes-vous sûr de vouloir générer les matchs pour ce tournoi ? Cette action ne pourra plus être annulée.',
  confirmLabel: 'Générer',
  onConfirm: (close) => onConfirm(close),
  onCancel: (close) => close(),
});
