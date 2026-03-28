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
  const { getAll, isGettingTournaments } = useTournament({ setTournaments });

  useEffect(() => {
    setTournaments([]);
    getAll(selected);
  }, [getAll, selected]);

  // Group tournaments by year and then month
  const groupedTournaments = useMemo(() => {
    return groupTournamentsByYearAndMonth(tournaments);
  }, [tournaments]);

  return (
    <Container component={Stack} spacing="2rem" maxWidth="md">
      <TournamentControls selected={selected} setSelected={setSelected} />
      <Stack spacing="2rem" pb="4rem">
        {isGettingTournaments && tournaments.length === 0 ? (
          <TournamentListSkeleton />
        ) : (
          groupedTournaments.map((yearGroup) => (
            <TournamentYearGroup
              key={yearGroup.year}
              year={yearGroup.year}
              monthsData={yearGroup.monthsData}
            />
          ))
        )}

        {!isGettingTournaments && tournaments.length === 0 && (
          <Typography>Aucun tournoi trouvé.</Typography>
        )}
      </Stack>
    </Container>
  );
};
