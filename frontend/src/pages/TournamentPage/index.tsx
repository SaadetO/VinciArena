import { TournamentBanner } from './components/TournamentBanner';
import { useEffect, useState } from 'react';
import { TournamentDetailsInfoDto } from '../../types';
import { useTournament } from '../../hooks/useTournament';
import { useParams } from 'react-router-dom';
import { Button, Container, Grid2, Stack, Typography } from '@mui/material';
import { TournamentModal } from './modals/tournamentModal';
import { TeamsCard } from './components/TeamsCard';

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
      <Container maxWidth="lg">
        <Grid2
          container
          spacing={3}
          padding="1.5rem 0 4rem"
          direction={{ xs: 'column-reverse', md: 'row' }}
          justifyContent="center"
        >
          <Grid2 size={{ xs: 12, md: 6.5, lg: 7.5 }}>
            <Stack spacing="1.5rem">
              <Stack
                sx={{ background: (theme) => theme.palette.background.s1 }}
                padding="1.25rem 1rem 1rem"
                borderRadius="1.5rem"
              >
                <Typography variant="h5" textAlign="center">
                  Placeholder for matches section
                </Typography>
              </Stack>
            </Stack>
          </Grid2>
          <Grid2 size={{ xs: 12, md: 5.5, lg: 4.5 }}>
            <Stack spacing="1.5rem">
              <TeamsCard teams={tournament?.teams} />
            </Stack>
          </Grid2>
        </Grid2>
      </Container>
      <Button onClick={() => setIsTournamentModalOpen(true)}> Modifier</Button>
      <Button>Publier</Button>
      <TournamentModal
        open={isTournamentModalOpen}
        onClose={() => setIsTournamentModalOpen(false)}
        tournament={tournament}
      ></TournamentModal>
    </>
  );
};
