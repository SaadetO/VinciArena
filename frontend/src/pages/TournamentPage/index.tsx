import { useEffect, useState } from 'react';
import { useTournament } from '../../hooks/useTournament';
import { TournamentDto } from '../../types';
import { useParams } from 'react-router-dom';
import { Button } from '@mui/material';
import { TournamentModal } from './modals/tournamentModal';

// TEMP tournament page
export const TournamentPage = () => {
  const { id } = useParams();
  const [isTournamentModalOpen, setIsTournamentModalOpen] = useState(false);
  const [tournament, setTournament] = useState<TournamentDto | null>(null);
  const { getById } = useTournament({ setTournament });

  useEffect(() => {
    id && getById(Number(id));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  return (
    <>
      <p>Tournament id: {id}</p>
      <Button onClick={() => setIsTournamentModalOpen(true)}>Modifier</Button>
      <TournamentModal
        open={isTournamentModalOpen}
        onClose={() => setIsTournamentModalOpen(false)}
        tournament={tournament ?? undefined}
      />
      <Button>Publier</Button>
    </>
  );
};
