import { useState, useEffect, useMemo } from 'react';
import { useTournament } from '../../hooks/useTournament';
import { TournamentDto } from '../../types';
import { Stack, Typography, Container } from '@mui/material';
import { groupTournamentsByYearAndMonth } from '../../utils/tournamentUtils';
import { TournamentYearGroup } from '../../components/TournamentYearGroup';
import { TournamentControls } from './components/TournamentControls';
import { TournamentListSkeleton } from './components/TournamentListSkeleton';

export const HomePage = () => {
  const [tournaments, setTournaments] = useState<TournamentDto[]>([]);
  const [selected, setSelected] = useState<'past' | 'current' | 'future'>(
    'future',
  );
  const [searchQuery, setSearchQuery] = useState('');
  const { getAll, isGettingTournaments } = useTournament({ setTournaments });

  useEffect(() => {
    setTournaments([]);
    getAll(selected);
  }, [getAll, selected]);

  // Group tournaments by year and then month, filtering by search locally
  const groupedTournaments = useMemo(() => {
    const searchLower = searchQuery.toLowerCase();
    const filteredTournaments = tournaments.filter(
      (t) => !searchLower || t.name.toLowerCase().includes(searchLower),
    );
    return groupTournamentsByYearAndMonth(filteredTournaments);
  }, [tournaments, searchQuery]);

  return (
    <Container component={Stack} spacing="2rem" maxWidth="md">
      <TournamentControls
        selected={selected}
        setSelected={setSelected}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
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
