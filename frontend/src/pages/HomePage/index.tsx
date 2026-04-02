import { useState, useEffect, useMemo, useContext } from 'react';
import { useTournament } from '../../hooks/useTournaments';
import { TournamentDto } from '../../types';
import { Stack, Typography, Container } from '@mui/material';
import {
  getStatusesForTimeframe,
  groupTournamentsByYearAndMonth,
  TournamentFilters,
} from '../../utils/tournamentUtils';
import { TournamentYearGroup } from '../../components/TournamentYearGroup';
import { TournamentControls } from './components/TournamentControls';
import { TournamentListSkeleton } from './components/TournamentListSkeleton';
import { UserContext } from '../../contexts/UserContext';

export const HomePage = () => {
  const [tournaments, setTournaments] = useState<TournamentDto[]>([]);
  const { authenticatedUser } = useContext(UserContext);

  const [filters, setFilters] = useState<TournamentFilters>({
    searchQuery: '',
    teams: [],
    members: [],
    timeFrame: 'future',
    statuses: [],
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
    setTournaments([]);
    const backendStatuses =
      filters.statuses.length > 0
        ? filters.statuses
        : getStatusesForTimeframe(filters.timeFrame, authenticatedUser?.admin);

    getAll({
      statuses: backendStatuses,
      members: filters.members.length > 0 ? filters.members : undefined,
      teams: filters.teams.length > 0 ? filters.teams : undefined,
      searchQuery: debouncedSearch,
    });
  }, [
    getAll,
    filters.timeFrame,
    filters.members,
    filters.teams,
    filters.statuses,
    debouncedSearch,
    authenticatedUser?.admin,
  ]);

  // Group tournaments by year and then month, filtering by search locally
  const groupedTournaments = useMemo(() => {
    return groupTournamentsByYearAndMonth(tournaments);
  }, [tournaments]);

  return (
    <Container component={Stack} spacing="2rem" maxWidth="md">
      <TournamentControls
        filters={filters}
        setFilters={setFilters}
        isAdmin={authenticatedUser?.admin}
      />
      <Stack spacing="2rem" pb="4rem">
        {isGettingTournaments && tournaments.length === 0 ? (
          <TournamentListSkeleton />
        ) : groupedTournaments.length === 0 ? (
          <Stack
            padding="3rem 1.5rem"
            spacing="0.25rem"
            alignItems="center"
            justifyContent="center"
            bgcolor="background.s1"
            borderRadius="1.5rem"
          >
            <Typography variant="h5" textAlign="center">
              Aucun tournoi trouvé.
            </Typography>
            <Typography
              variant="body2"
              textAlign="center"
              width="14rem"
              color="text.secondary"
            >
              Aucun tournoi ne correspond à votre recherche.
            </Typography>
          </Stack>
        ) : (
          groupedTournaments.map((yearGroup) => (
            <TournamentYearGroup
              key={yearGroup.year}
              year={yearGroup.year}
              monthsData={yearGroup.monthsData}
            />
          ))
        )}
      </Stack>
    </Container>
  );
};
