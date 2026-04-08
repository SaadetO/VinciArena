import { InputBase, Stack } from '@mui/material';
import { Magnifier } from '@gravity-ui/icons';

interface TournamentSearchBarProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}

export const TournamentSearchBar = ({
  searchQuery,
  setSearchQuery,
}: TournamentSearchBarProps) => {
  return (
    <InputBase
      sx={{
        bgcolor: 'background.s2',
        borderRadius: '1.125rem',
        height: '2.75rem',
        width: '12rem',
        p: '0 0.375rem 0 1rem',
        '&:focus-within': {
          outline: '2px solid',
          outlineColor: 'primary.main',
        },
      }}
      placeholder="Rechercher..."
      value={searchQuery}
      onChange={(e) => setSearchQuery(e.target.value)}
      endAdornment={
        <Stack p="0.25rem" pr="0.5rem">
          <Magnifier style={{ color: 'text.secondary' }} />
        </Stack>
      }
    />
  );
};
