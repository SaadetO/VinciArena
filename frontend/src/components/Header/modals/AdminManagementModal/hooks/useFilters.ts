import { useEffect, useState } from 'react';
import { MemberFilters, MemberQueryStatus } from '../../../../../types';
import { useUser } from '../../../../../hooks/useUser';

interface UseFiltersProps {
  open: boolean;
  handleScroll: () => void;
  getAll: (filters: MemberFilters) => void;
}

export const useFilters = ({ open, handleScroll, getAll }: UseFiltersProps) => {
  const { authenticatedUser } = useUser();
  const [filters, setFilters] = useState<MemberFilters>({
    status: undefined,
    searchQuery: undefined,
  });
  const [debouncedSearch, setDebouncedSearch] = useState(filters.searchQuery);

  const handleFilterSelect = (newFilter: MemberQueryStatus | undefined) => {
    if (newFilter === filters.status) return;
    setFilters({ ...filters, status: newFilter });
  };

  const getFilterOptions = () => {
    return [
      undefined,
      ...(Object.values(MemberQueryStatus) as MemberQueryStatus[]),
    ].filter((status) => status !== filters.status);
  };

  useEffect(() => {
    if (!open) return;
    console.log('Fetching members: ', filters);
    getAll(filters);
    setTimeout(handleScroll, 0);
  }, [open, handleScroll, authenticatedUser?.token, getAll, filters]);

  useEffect(() => {
    if (debouncedSearch === '') {
      setFilters((prev) => ({ ...prev, searchQuery: '' }));
      return;
    }

    const timer = setTimeout(() => {
      setFilters((prev) => ({ ...prev, searchQuery: debouncedSearch }));
    }, 400);
    return () => clearTimeout(timer);
  }, [debouncedSearch]);

  const getMemberStatusLabel = (
    status: MemberQueryStatus | undefined,
  ): string => {
    switch (status) {
      case MemberQueryStatus.ADMIN:
        return 'Admins';
      case MemberQueryStatus.MEMBER:
        return 'Membres';
      case MemberQueryStatus.BANNED:
        return 'Bannis';
      default:
        return 'Tous';
    }
  };

  return {
    filters,
    setFilters,
    debouncedSearch,
    setDebouncedSearch,
    getFilterOptions,
    handleFilterSelect,
    getMemberStatusLabel,
  };
};
