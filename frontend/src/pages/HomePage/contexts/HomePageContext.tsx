import { createContext, ReactNode, useEffect, useMemo, useState } from 'react';
import { HomePageContextType, TournamentDto } from '../../../types';
import { useUser } from '../../../hooks/useUser';
import {
  getStatusesForTimeframe,
  groupTournamentsByYearAndMonth,
  TournamentFilters,
} from '../../../utils/tournamentUtils';
import { useTournament } from '../../../hooks/useTournaments';

const defaultHomePageContext: HomePageContextType = {
  filters: {
    searchQuery: '',
    teams: [],
    members: [],
    timeFrame: 'future',
    statuses: [],
    dates: { minDate: undefined, maxDate: undefined },
  },
  setFilters: () => {},
  authenticatedUser: null,
  isGettingTournaments: false,
  tournaments: [],
  groupedTournaments: [],
};

const HomePageContext = createContext<HomePageContextType>(
  defaultHomePageContext,
);

const HomePageContextProvider = ({ children }: { children: ReactNode }) => {
  const [tournaments, setTournaments] = useState<TournamentDto[]>([]);
  const { authenticatedUser } = useUser();

  const [filters, setFilters] = useState<TournamentFilters>({
    searchQuery: '',
    teams: [],
    members: [],
    timeFrame: 'future',
    statuses: [],
    dates: { minDate: undefined, maxDate: undefined },
  });
  const { getAll, isGettingTournaments } = useTournament({ setTournaments });
  const [debouncedSearch, setDebouncedSearch] = useState(filters.searchQuery);

  useEffect(() => {
    if (filters.searchQuery === '') {
      setDebouncedSearch('');
      return;
    }

    const timer = setTimeout(() => {
      setDebouncedSearch(filters.searchQuery);
    }, 400);
    return () => clearTimeout(timer);
  }, [filters.searchQuery]);

  useEffect(() => {
    const backendStatuses =
      filters.statuses.length > 0
        ? filters.statuses
        : getStatusesForTimeframe(filters.timeFrame, authenticatedUser?.admin);

    getAll({
      statuses: backendStatuses,
      members: filters.members.length > 0 ? filters.members : undefined,
      teams: filters.teams.length > 0 ? filters.teams : undefined,
      searchQuery: debouncedSearch,
      minDate: filters.dates?.minDate,
      maxDate: filters.dates?.maxDate,
    });
  }, [
    getAll,
    filters.timeFrame,
    filters.members,
    filters.teams,
    filters.statuses,
    filters.dates,
    debouncedSearch,
    authenticatedUser?.admin,
  ]);

  // Group tournaments by year and then month, filtering by search locally
  const groupedTournaments = useMemo(() => {
    return groupTournamentsByYearAndMonth(tournaments);
  }, [tournaments]);

  const HomePageContextValue: HomePageContextType = useMemo(
    () => ({
      filters,
      setFilters,
      authenticatedUser: authenticatedUser ?? null,
      isGettingTournaments,
      tournaments,
      groupedTournaments,
    }),
    [
      filters,
      setFilters,
      authenticatedUser,
      isGettingTournaments,
      tournaments,
      groupedTournaments,
    ],
  );

  return (
    <HomePageContext.Provider value={HomePageContextValue}>
      {children}
    </HomePageContext.Provider>
  );
};

export { HomePageContext, HomePageContextProvider };
