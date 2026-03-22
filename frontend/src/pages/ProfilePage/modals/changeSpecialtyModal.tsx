import { ModalConfig, SpecialtyDto } from '../../../types';
import { ChangeSpecialtyModalContent } from './ChangeSpecialtyModalContent';

export const changeSpecialtyModal = ({
  onSelect,
  onConfirm,
}: {
  onSelect: (specialty: SpecialtyDto | null) => void;
  onConfirm: (close: () => void) => void;
}): ModalConfig => ({
  title: 'Modifier la spécialité',
  subtitle: 'Choisissez votre nouvelle spécialité ci-dessous',
  confirmLabel: 'Confirmer',
  cancelLabel: 'Annuler',
  children: <ChangeSpecialtyModalContent onSelect={onSelect} />,
  onConfirm: (close) => onConfirm(close),
  onCancel: (close) => close(),
});
