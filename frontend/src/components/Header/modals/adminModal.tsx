import { ModalConfig, Member } from '../../../types';
import { AdminModalContent } from './AdminModalContent';

export const adminModal = ({
  promote,
  users,
  onSelect,
  onConfirm,
}: {
  promote: boolean;
  users: Member[];
  onSelect: (user: Member | null) => void;
  onConfirm: (close: () => void) => void;
}): ModalConfig => ({
  title: promote ? 'Désigner un Admin' : 'Supprimer un Admin',
  subtitle: promote
    ? 'Choisissez un utilisateur à désigner comme admin.'
    : 'Choisissez un utilisateur à rétrograder.',
  confirmLabel: promote ? 'Désigner' : 'Supprimer',
  cancelLabel: 'Annuler',
  confirmDisabled: true,
  children: (
    <AdminModalContent promote={promote} users={users} onSelect={onSelect} />
  ),
  onConfirm: (close) => onConfirm(close),
});
