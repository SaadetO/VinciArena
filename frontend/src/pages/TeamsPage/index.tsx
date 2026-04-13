import { Container, Grid2 } from '@mui/material';
import { SearchBar } from '../../components/SearchBar';
import { useEffect, useState } from 'react';
import { useTeams } from '../../hooks/useTeams';
import { Team } from '../../types';
import { TeamItem } from './components/TeamItem';

export const TeamsPage = () => {
  const [teams, setTeams] = useState<Team[]>([]);
  const { getAll, isGettingAllTeams } = useTeams({ setTeams });
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  useEffect(() => {
    getAll({ searchQuery: debouncedSearch });
  }, [getAll, debouncedSearch]);

  useEffect(() => {
    console.log(searchQuery);
    if (searchQuery === '') {
      setDebouncedSearch('');
      return;
    }

    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 400);
    return () => clearTimeout(timer);
  }, [searchQuery]);
  return (
    <Container
      maxWidth="md"
      sx={{
        padding: '1.5rem 0 0 0',
      }}
    >
      <SearchBar
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        fullwidth
      />
      <Grid2
        container
        spacing="1.5rem"
        padding="1.5rem 0 4rem"
        justifyContent="center"
        className={isGettingAllTeams && teams.length > 0 ? 'opacity-pulse' : ''}
        sx={{
          transform:
            isGettingAllTeams && teams.length > 0 ? 'scale(0.98)' : 'none',
          transition: 'transform 0.3s cubic-bezier(0.2, 0, 0, 1)',
        }}
      >
        {teams.length === 0 && isGettingAllTeams
          ? Array.from({ length: 4 }).map((_, index) => (
              <Grid2 key={index} size={{ xs: 12, sm: 6, md: 4 }}>
                <TeamItem />
              </Grid2>
            ))
          : teams.map((team) => (
              <Grid2 key={team.idTeam} size={{ xs: 12, sm: 6, md: 4 }}>
                <TeamItem team={team} />
              </Grid2>
            ))}
      </Grid2>
    </Container>
  );
};
