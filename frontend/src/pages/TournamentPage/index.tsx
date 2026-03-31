import { TournamentBanner } from './components/TournamentBanner';
import { useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { TournamentDetailsInfoDto } from '../../types';
import { useTournament } from '../../hooks/useTournament';
import { TournamentDto } from '../../types';
import { useParams } from 'react-router-dom';
import { Button } from '@mui/material';
import { TournamentModal } from './modals/tournamentModal';

export const TournamentPage = () => {
  const { id } = useParams();
  const idNbr = Number(id);
  const [tournament, setTournament] = useState<
    TournamentDetailsInfoDto | undefined
  >(undefined);
  const { getById } = useTournament({ setTournament });

  useEffect(() => {
    if (idNbr) {
      getById(idNbr);
    }
  }, [idNbr, getById]);
  return (
    <>
      <TournamentBanner tournament={tournament} />
    </>
  );
};
