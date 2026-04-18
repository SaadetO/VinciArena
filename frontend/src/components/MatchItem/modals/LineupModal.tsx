import { List, Stack, TextField, Typography } from '@mui/material';
import { useState, useMemo } from 'react';
import { MemberSummaryDto } from '../../../types';
import { ModalScrollSx } from '../../../themes';
import { PlayerItem } from './components/PlayerItem';

interface LineupModalContentProps {
  teamName: string;
  availablePlayers: MemberSummaryDto[];
  initialSelection: number[];
  onSelectionChange: (selectedIds: number[]) => void;
}

export const LineupModalContent = ({
  teamName,
  availablePlayers,
  initialSelection,
  onSelectionChange,
}: LineupModalContentProps) => {
  const [search, setSearch] = useState('');
  const [selectedIds, setSelectedIds] = useState<number[]>(initialSelection);

  // Filter players based on search tag
  const filteredPlayers = useMemo(() => {
    return availablePlayers.filter((p) =>
      p.tag.toLowerCase().includes(search.toLowerCase()),
    );
  }, [search, availablePlayers]);

  const handleToggle = (id: number) => {
    const newSelection = selectedIds.includes(id)
      ? selectedIds.filter((itemId) => itemId !== id)
      : [...selectedIds, id];

    setSelectedIds(newSelection);
    onSelectionChange(newSelection); // Sync with the parent immediately
  };

  return (
    <Stack spacing="1rem">
      <Typography textAlign="center" color="secondary" padding="0 1rem">
        Sélectionnez les joueurs pour <strong>{teamName}</strong>
      </Typography>

      <TextField
        placeholder="Rechercher un joueur..."
        fullWidth
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        sx={{
          '& .MuiInputBase-root': {
            height: '2.75rem',
            borderRadius: '1.125rem',
          },
          '& .MuiInputBase-input': {
            padding: '0 1rem',
          },
        }}
      />

      <Stack sx={ModalScrollSx}>
        <List
          disablePadding
          sx={{
            maxHeight: '22rem',
            overflowY: 'auto',
            padding: '0.5rem 0',
          }}
        >
          {filteredPlayers.length > 0 ? (
            filteredPlayers.map((player) => (
              <PlayerItem
                key={player.id}
                player={player}
                isSelected={selectedIds.includes(player.id)}
                onToggle={() => handleToggle(player.id)}
              />
            ))
          ) : (
            <Stack padding="2rem" alignItems="center">
              <Typography color="text.secondary">
                Aucun joueur trouvé
              </Typography>
            </Stack>
          )}
        </List>
      </Stack>
    </Stack>
  );
};
