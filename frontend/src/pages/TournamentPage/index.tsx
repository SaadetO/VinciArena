import { TournamentBanner } from './components/TournamentBanner';
import { useEffect, useState } from 'react';
import { TournamentDetailsInfoDto } from '../../types';
import { useTournament } from '../../hooks/useTournament';
import { useParams } from 'react-router-dom';
import { Button } from '@mui/material';
import { TournamentModal } from './modals/tournamentModal';

export const TournamentPage = () => {
  const { id } = useParams();
  const idNbr = Number(id);
  const [tournament, setTournament] = useState<
    TournamentDetailsInfoDto | undefined
  >(undefined);
  const [isTournamentModalOpen, setIsTournamentModalOpen] = useState(false);
  const { getById } = useTournament({ setTournament });

  useEffect(() => {
    if (idNbr) {
      getById(idNbr);
    }
  }, [idNbr, getById]);
  return (
    <>
      <TournamentBanner tournament={tournament} />
      <Button onClick={() => setIsTournamentModalOpen(true)}> Modifier</Button>
      <Button>Publier</Button>
      <TournamentModal
        open={isTournamentModalOpen}
        onClose={() => setIsTournamentModalOpen(false)}
        tournament={tournament}
        setTournament={setTournament}
      ></TournamentModal>
    </>
  );
};
