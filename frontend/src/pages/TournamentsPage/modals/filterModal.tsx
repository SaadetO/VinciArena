import { FilterModalContent } from './FilterModalContent';
import { ModalConfig } from '../../../types';
import { TournamentFilters } from '../../../utils/tournamentUtils';

export const filterModal = ({
  initialFilters,
  showStatusFilter,
  isAdmin,
  onFiltersChange,
  onConfirm,
}: {
  initialFilters: Partial<TournamentFilters>;
  showStatusFilter: boolean;
  isAdmin?: boolean;
  onFiltersChange: (filters: Partial<TournamentFilters>) => void;
  onConfirm: (close: () => void) => void;
}): ModalConfig => ({
  title: 'Filtres avancés',
  subtitle: 'Filtrez les tournois par équipe ou par membre.',
  confirmLabel: 'Appliquer',
  cancelLabel: 'Annuler',
  children: (
    <FilterModalContent
      initialFilters={initialFilters}
      showStatusFilter={showStatusFilter}
      isAdmin={isAdmin}
      onFiltersChange={onFiltersChange}
    />
  ),
  onConfirm: (close) => onConfirm(close),
  onCancel: (close) => close(),
});
