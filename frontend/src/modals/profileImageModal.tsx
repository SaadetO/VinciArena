import { ProfileImageModalContent } from './ProfileImageModalContent';
import { ModalConfig, ProfileImage } from '../types';

export const profileImageModal = ({
  onSelect,
  onConfirm,
}: {
  onSelect: (image: ProfileImage) => void;
  onConfirm: (close: () => void) => void;
}): ModalConfig => {
  return {
    title: 'Faites votre choix',
    subtitle: 'Choisissez une image de profil parmi les images proposées.',
    confirmLabel: 'Confirmer',
    cancelLabel: 'Annuler',
    children: <ProfileImageModalContent onSelect={onSelect} />,
    onConfirm: (close) => onConfirm(close),
    onCancel: (close) => close(),
  };
};
