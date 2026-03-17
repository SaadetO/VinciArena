import {
  ModalConfig,
  ProfileInfoDto,
  TeamDetailsInfoDto,
} from '../../../types';
import { ManagerModalContent } from './ManagerModalContent';

export const managerModal = ({
  team,
  onSelect,
  onConfirm,
}: {
  team: TeamDetailsInfoDto | undefined;
  onSelect: (user: ProfileInfoDto | null) => void;
  onConfirm: (close: () => void) => void;
}): ModalConfig => ({
  title: 'Désigner un Manager',
  subtitle: 'Choisissez un utilisateur à désigner comme manager.',
  confirmLabel: 'Désigner',
  cancelLabel: 'Annuler',
  confirmDisabled: true,
  children: <ManagerModalContent team={team} onSelect={onSelect} />,
  onConfirm: (close) => onConfirm(close),
});
