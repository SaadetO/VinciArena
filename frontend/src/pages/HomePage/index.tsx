import { useState, useEffect, useMemo } from 'react';
import { useTournament } from '../../hooks/useTournament';
import { TournamentDto } from '../../types';
import { Stack, Typography, Container } from '@mui/material';
import {
  groupTournamentsByYearAndMonth,
  TournamentFilters,
} from '../../utils/tournamentUtils';
import { TournamentYearGroup } from '../../components/TournamentYearGroup';
import { TournamentControls } from './components/TournamentControls';
import { TournamentListSkeleton } from './components/TournamentListSkeleton';

export const HomePage = () => {
  const [tournaments, setTournaments] = useState<TournamentDto[]>([]);
  const [filters, setFilters] = useState<TournamentFilters>({
    searchQuery: '',
    teams: [],
    members: [],
    timeFrame: 'future',
  });
  const { getAll, isGettingTournaments } = useTournament({ setTournaments });

  useEffect(() => {
    setTournaments([]);
    getAll({
      timeframe: filters.timeFrame,
      members: filters.members.length > 0 ? filters.members : undefined,
      teams: filters.teams.length > 0 ? filters.teams : undefined,
    });
  }, [getAll, filters.timeFrame, filters.members, filters.teams]);

  // Group tournaments by year and then month, filtering by search locally
  const groupedTournaments = useMemo(() => {
    const searchLower = filters.searchQuery.toLowerCase();
    const filteredTournaments = tournaments.filter(
      (t) => !searchLower || t.name.toLowerCase().includes(searchLower),
    );
    return groupTournamentsByYearAndMonth(filteredTournaments);
  }, [tournaments, filters.searchQuery]);

  return (
    <Container component={Stack} spacing="2rem" maxWidth="md">
      <TournamentControls filters={filters} setFilters={setFilters} />
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
