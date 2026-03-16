import { ModalConfig, ProfileInfoDto, TeamDetailsInfoDto } from '../../../types';
import { ManagerModalContent } from './ManagerModalContent';

export const managerModal = ({
  team,
  onSuccess,
}: {
  team: TeamDetailsInfoDto | undefined;
  onSuccess: (successMessage: string, promotedUser?: ProfileInfoDto) => void;
}): ModalConfig => ({
  title: 'Désigner un Manager',
  subtitle: 'Choisissez un utilisateur à désigner comme manager.',
  confirmLabel: 'Désigner',
  cancelLabel: 'Annuler',
  confirmDisabled: true,
  children: <ManagerModalContent 
    team={team} 
    onSuccess={onSuccess} 
    close={() => {}} 
  />,
  onConfirm: () => {
    document.getElementById('manager-modal-form')?.dispatchEvent(new Event('submit', { cancelable: true, bubbles: true }));
  },
});
