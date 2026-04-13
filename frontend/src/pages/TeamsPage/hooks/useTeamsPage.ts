import { useEffect, useState } from 'react';
import { Team } from '../../../types';
import { useTeams } from '../../../hooks/useTeams';

export const useTeamsPage = () => {
  const [teams, setTeams] = useState<Team[]>([]);
  const { getAll, isGettingAllTeams } = useTeams({ setTeams });
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  useEffect(() => {
    getAll({ searchQuery: debouncedSearch });
  }, [getAll, debouncedSearch]);

  useEffect(() => {
    console.log(searchQuery);
    if (searchQuery === '') {
      setDebouncedSearch('');
      return;
    }

    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 400);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  return { teams, isGettingAllTeams, searchQuery, setSearchQuery };
};
