import { ModalConfig } from '../../../types';

export const banModal = ({
  tag,
  onConfirm,
}: {
  tag: string;
  onConfirm: (close: () => void) => void;
}): ModalConfig => {
  return {
    title: 'Bannir ' + tag,
    subtitle:
      'Êtes-vous sûr de vouloir bannir ' +
      tag +
      ' ? Cette action est irréversible.',
    confirmLabel: 'Bannir',
    confirmColor: 'error',
    cancelLabel: 'Annuler',
    onConfirm: async (close) => {
      onConfirm(close);
    },
    onCancel: (close) => close(),
  };
};
