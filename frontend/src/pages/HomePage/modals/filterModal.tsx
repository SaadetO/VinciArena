import { FilterModalContent } from './FilterModalContent';
import { MemberSummaryDto, ModalConfig, Team } from '../../../types';

export const filterModal = ({
  initialTeams,
  initialMembers,
  initialStatuses,
  showStatusFilter,
  onlyStatusFilter,
  isAdmin,
  cachedTeams,
  cachedMembers,
  fetchTeams,
  fetchMembers,
  onFiltersChange,
  onConfirm,
}: {
  initialTeams: number[];
  initialMembers: number[];
  initialStatuses: string[];
  showStatusFilter: boolean;
  onlyStatusFilter?: boolean;
  isAdmin?: boolean;
  cachedTeams: Team[];
  cachedMembers: MemberSummaryDto[];
  fetchTeams: () => Promise<Team[] | null>;
  fetchMembers: () => Promise<MemberSummaryDto[] | null>;
  onFiltersChange: (filters: {
    teams: number[];
    members: number[];
    statuses: string[];
  }) => void;
  onConfirm: (close: () => void) => void;
}): ModalConfig => ({
  title: 'Filtres avancés',
  subtitle: 'Filtrez les tournois par équipe ou par membre.',
  confirmLabel: 'Appliquer',
  cancelLabel: 'Annuler',
  children: (
    <FilterModalContent
      initialTeams={initialTeams}
      initialMembers={initialMembers}
      initialStatuses={initialStatuses}
      showStatusFilter={showStatusFilter}
      onlyStatusFilter={onlyStatusFilter}
      isAdmin={isAdmin}
      cachedTeams={cachedTeams}
      cachedMembers={cachedMembers}
      fetchTeams={fetchTeams}
      fetchMembers={fetchMembers}
      onFiltersChange={onFiltersChange}
    />
  ),
  onConfirm: (close) => onConfirm(close),
  onCancel: (close) => close(),
});
