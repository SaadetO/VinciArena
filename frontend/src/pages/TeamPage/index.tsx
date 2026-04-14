import { Container, Grid2, Stack, Typography } from '@mui/material';
import { useContext, useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { UserContext } from '../../contexts/UserContext';
import { TeamDetailsInfoDto, TournamentDto } from '../../types';
import { NotFoundPage } from '../NotFoundPage';
import { TeamBanner } from './components/TeamBanner';
import { ManagerCard } from './components/ManagerCard';
import { MembersCard } from './components/MembersCard';
import { JoinRequestsCard } from './components/JoinRequestsCard';
import { useTeams } from '../../hooks/useTeams';
import { TournamentYearGroup } from '../../components/TournamentYearGroup';
import {
  getStatusesForTimeframe,
  groupTournamentsByYearAndMonth,
  TournamentFilters,
} from '../../utils/tournamentUtils';
import { useTournament } from '../../hooks/useTournaments';
import { TournamentListSkeleton } from '../../components/TournamentListSkeleton';
import { TournamentControls } from '../HomePage/components/TournamentControls';

export const TeamPage = () => {
  const { id } = useParams();
  const idNbr = Number(id);
  const { authenticatedUser } = useContext(UserContext);
  const [team, setTeam] = useState<TeamDetailsInfoDto | undefined>(undefined);
  const [error, setError] = useState<
    { code: number; message: string; subtitle?: string } | undefined
  >(undefined);
  const [filters, setFilters] = useState<TournamentFilters>({
    searchQuery: '',
    teams: [idNbr],
    members: [],
    timeFrame: 'future',
    statuses: [],
    dates: { minDate: undefined, maxDate: undefined },
  });

  const [tournaments, setTournaments] = useState<TournamentDto[]>([]);
  const { getById, isGettingTeam } = useTeams({ setTeam, setError });
  const { getAll, isGettingTournaments } = useTournament({ setTournaments });

  useEffect(() => {
    if (authenticatedUser === undefined) return;
    setTeam(undefined);
    setError(undefined);
    getById(idNbr);
  }, [idNbr, authenticatedUser, getById]);

  // Handle immediate and debounced updates
  const [debouncedSearch, setDebouncedSearch] = useState(filters.searchQuery);

  useEffect(() => {
    if (filters.searchQuery === '') {
      setDebouncedSearch('');
      return;
    }

    const timer = setTimeout(() => {
      setDebouncedSearch(filters.searchQuery);
    }, 400);
    return () => clearTimeout(timer);
  }, [filters.searchQuery]);

  useEffect(() => {
    setTournaments([]);
    const backendStatuses =
      filters.statuses.length > 0
        ? filters.statuses
        : getStatusesForTimeframe(filters.timeFrame, authenticatedUser?.admin);

    getAll({
      teams: [idNbr],
      statuses: backendStatuses,
      members: undefined,
      searchQuery: debouncedSearch,
    });
  }, [
    idNbr,
    filters.timeFrame,
    filters.statuses,
    debouncedSearch,
    getAll,
    authenticatedUser?.admin,
  ]);

  const groupedTournaments = useMemo(() => {
    return groupTournamentsByYearAndMonth(tournaments);
  }, [tournaments]);

  if (error && !isGettingTeam) return <NotFoundPage error={error} />;

  return (
    <>
      <TeamBanner team={team} />
      <Container maxWidth="lg">
        <Grid2
          container
          spacing="1.5rem"
          padding="0 0 4rem"
          direction={{ xs: 'column-reverse', desktop: 'row' }}
          justifyContent="center"
        >
          <Grid2 size={{ xs: 12, desktop: 6.5, lg: 7.5 }}>
            <Stack spacing="1.5rem">
              <TournamentControls
                filters={filters}
                setFilters={setFilters}
                disabledFilter={filters.timeFrame !== 'future'}
                disabledFilterTooltip="Aucun filtres avancés disponibles"
                onlyStatusFilter={true}
                isAdmin={authenticatedUser?.admin}
              />
              <Stack spacing="1rem">
                {isGettingTournaments && tournaments.length === 0 ? (
                  <TournamentListSkeleton />
                ) : groupedTournaments.length === 0 ? (
                  <Stack
                    padding="3rem 1.5rem"
                    spacing="0.25rem"
                    alignItems="center"
                    justifyContent="center"
                    sx={{ background: (theme) => theme.palette.background.s1 }}
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
                      Cette team n'a peut-être pas encore participé à des
                      tournois. Ou vos filtres sont trop restrictifs.
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
            </Stack>
          </Grid2>
          <Grid2 size={{ xs: 12, desktop: 5.5, lg: 4.5 }}>
            <Stack spacing="1.5rem" pt="1.5rem">
              <ManagerCard team={team} setTeam={setTeam} />
              <MembersCard team={team} />
              {team?.managers?.find((e) => e.id === authenticatedUser?.id) && (
                <JoinRequestsCard
                  isLoading={isGettingTeam}
                  team={team}
                  setTeam={setTeam}
                />
              )}
            </Stack>
          </Grid2>
        </Grid2>
      </Container>
    </>
  );
};
