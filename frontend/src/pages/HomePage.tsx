import { useTournament } from '../hooks/useTournament';
import { useState, useEffect } from 'react';
import { TournamentDto } from '../types';

export const HomePage = () => {
  const [tournaments, setTournaments] = useState<TournamentDto[]>([]);
  const { getAll, isGettingTournaments } = useTournament({ setTournaments });

  useEffect(() => {
    getAll();
  }, [getAll]);

  useEffect(() => {
    console.log(isGettingTournaments, tournaments);
  }, [tournaments, isGettingTournaments]);
  return <>Home</>;
};
