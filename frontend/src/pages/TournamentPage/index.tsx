import { TournamentBanner } from './components/TournamentBanner';
import { useContext, useEffect, useMemo, useState } from 'react';
import { TournamentDetailsInfoDto } from '../../types';
import { useTournament } from '../../hooks/useTournaments';
import { useParams } from 'react-router-dom';
import { Container, Grid2, Stack, Typography } from '@mui/material';
import { TournamentModal } from './modals/tournamentModal';
import { TeamsCard } from './components/TeamsCard';
import { UserContext } from '../../contexts/UserContext';
import { NotFoundPage } from '../NotFoundPage';
import { AdminActionCard } from './components/AdminActionCard';

export const TournamentPage = () => {
  const { id } = useParams();
  const idNbr = Number(id);
  const [tournament, setTournament] = useState<
    TournamentDetailsInfoDto | undefined
  >(undefined);
  const [error, setError] = useState<
    { code: number; message: string; subtitle?: string } | undefined
  >(undefined);
  const { authenticatedUser } = useContext(UserContext);
  const [isTournamentModalOpen, setIsTournamentModalOpen] = useState(false);

  const { getById, publish, isGettingTournamentById } = useTournament({
    setTournament,
    setError,
  });

  const handleAdminAction = async (status: string) => {
    if (!idNbr) return;

    if (status === 'IN_PREPARATION') {
      // call patch
      await publish(idNbr);
    } else if (status === 'REGISTRATION_CLOSED') {
      // TODO
      console.log('Generating matches...');
    }
  };

  const canCol1 = useMemo(() => {
    if (isGettingTournamentById) return true;
    if (!tournament || tournament.status === 'CANCELLED') return false;

    if (authenticatedUser?.admin) {
      return tournament.status !== 'REGISTRATION_OPEN';
    }

    return ['PLANNED', 'IN_PROGRESS', 'DONE'].includes(tournament.status);
  }, [tournament, authenticatedUser, isGettingTournamentById]);

  const canCol2 = useMemo(() => {
    if (isGettingTournamentById) return true;
    if (!tournament || tournament.status === 'CANCELLED') return false;
    return tournament.status !== 'IN_PREPARATION';
  }, [tournament, isGettingTournamentById]);

  useEffect(() => {
    if (idNbr) {
      getById(idNbr);
    }
  }, [idNbr, getById]);

  useEffect(() => {
    if (authenticatedUser === undefined) return;
    if (tournament?.status === 'IN_PREPARATION' && !authenticatedUser?.admin) {
      setError({
        code: 404,
        message: 'Tournoi introuvable',
        subtitle: "Ce tournoi n'est pas encore ouvert au public.",
      });
    }
  }, [tournament?.status, authenticatedUser, setError]);

  if (error && !isGettingTournamentById) return <NotFoundPage error={error} />;

  return (
    <>
      <TournamentBanner
        tournament={tournament}
        setIsTournamentModalOpen={setIsTournamentModalOpen}
      />
      <Container maxWidth="lg">
        <Grid2
          container
          spacing={3}
          padding="1.5rem 0 4rem"
          direction={{ xs: 'column-reverse', md: 'row' }}
          justifyContent="center"
        >
          {canCol1 && (
            <Grid2 size={{ xs: 12, md: 6.5, lg: 7.5 }}>
              <Stack spacing="1.5rem">
                {authenticatedUser?.admin && tournament?.status && (
                  <AdminActionCard
                    status={tournament.status}
                    onAction={handleAdminAction}
                  />
                )}
                {(!authenticatedUser?.admin ||
                  (tournament?.status !== 'IN_PREPARATION' &&
                    tournament?.status !== 'REGISTRATION_CLOSED')) && (
                  <Stack
                    sx={{
                      background: (theme) => theme.palette.background.s1,
                    }}
                    padding="5rem 1rem 20rem"
                    borderRadius="1.5rem"
                  >
                    <Typography variant="h5" textAlign="center">
                      Placeholder for matches section
                    </Typography>
                  </Stack>
                )}
              </Stack>
            </Grid2>
          )}
          {canCol2 && (
            <Grid2
              size={{
                xs: 12,
                md: canCol1 ? 5.5 : 6.5,
                lg: canCol1 ? 4.5 : 5.5,
              }}
            >
              <Stack spacing="1.5rem">
                <TeamsCard
                  teams={tournament?.teams}
                  capacity={tournament?.capacity}
                  status={tournament?.status}
                  managedTeamId={authenticatedUser?.managedTeamId}
                />
              </Stack>
            </Grid2>
          )}
        </Grid2>
      </Container>
      <TournamentModal
        open={isTournamentModalOpen}
        onClose={() => setIsTournamentModalOpen(false)}
        tournament={tournament}
        setTournament={setTournament}
      ></TournamentModal>
    </>
  );
};
