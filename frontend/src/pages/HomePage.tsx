import { useState, useEffect, useMemo } from 'react';
import { useTournament } from '../hooks/useTournament';
import { TournamentDto } from '../types';
import { Stack, Typography, CircularProgress, Container } from '@mui/material';
import { groupTournamentsByYearAndMonth } from '../utils/tournamentUtils';
import { TournamentYearGroup } from '../components/TournamentYearGroup';

export const HomePage = () => {
  const [tournaments, setTournaments] = useState<TournamentDto[]>([]);
  const { getAll, isGettingTournaments } = useTournament({ setTournaments });

  useEffect(() => {
    getAll();
  }, [getAll]);

  // Group tournaments by year and then month
  const groupedTournaments = useMemo(() => {
    return groupTournamentsByYearAndMonth(tournaments);
  }, [tournaments]);

  if (isGettingTournaments && tournaments.length === 0) {
    return (
      <Stack alignItems="center" justifyContent="center" sx={{ mt: 5 }}>
        <CircularProgress />
      </Stack>
    );
  }

  return (
    <Container component={Stack} spacing="2rem" maxWidth="md">
      <Stack spacing="2rem" pb="4rem">
        {groupedTournaments.map((yearGroup) => (
          <TournamentYearGroup key={yearGroup.year} year={yearGroup.year} monthsData={yearGroup.monthsData} />
        ))}

        {!isGettingTournaments && tournaments.length === 0 && (
          <Typography>Aucun tournoi trouvé.</Typography>
        )}
      </Stack>
    </Container>
  );
};
