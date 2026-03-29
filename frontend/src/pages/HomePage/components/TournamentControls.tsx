import { Box, IconButton, Stack, InputBase, Badge } from '@mui/material';
import { useEffect, useRef, useState } from 'react';
import { TournamentTab } from './TournamentTab';
import { Search, Tune } from '@mui/icons-material';
import { TournamentFilters } from '../../../utils/tournamentUtils';

interface TournamentControlsProps {
  filters: TournamentFilters;
  setFilters: (filters: TournamentFilters) => void;
}

export const TournamentControls = ({
  filters,
  setFilters,
}: TournamentControlsProps) => {
  const [indicatorStyle, setIndicatorStyle] = useState({
    left: 0,
    top: 0,
    width: 0,
    height: 0,
  });
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    const selectedEl = containerRef.current.querySelector(
      `button[data-value="${filters.timeFrame}"]`,
    ) as HTMLButtonElement | null;

    if (selectedEl) {
      setIndicatorStyle({
        left: selectedEl.offsetLeft,
        top: selectedEl.offsetTop,
        width: selectedEl.offsetWidth,
        height: selectedEl.offsetHeight,
      });
    }
  }, [filters.timeFrame]);

  return (
    <Stack
      justifyContent="space-between"
      direction="row"
      bgcolor="background.s1"
      borderRadius="0 0 1.5rem 1.5rem"
      px="1.5rem"
      height="6rem"
      alignItems="center"
      position="sticky"
      top="0"
      zIndex={1}
      sx={{
        outline: '4px solid',
        outlineColor: 'background.s0',
      }}
    >
      <Stack
        ref={containerRef}
        position="relative"
        direction="row"
        padding="0.375rem"
        borderRadius="1.125rem"
        bgcolor="background.s2"
        height="fit-content"
        alignItems="center"
      >
        {indicatorStyle.width > 0 && (
          <Box
            sx={{
              position: 'absolute',
              left: indicatorStyle.left,
              top: indicatorStyle.top,
              width: indicatorStyle.width,
              height: indicatorStyle.height,
              borderRadius: '0.75rem',
              bgcolor: 'background.s4',
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            }}
          />
        )}
        <TournamentTab
          selected={filters.timeFrame}
          setSelected={(value) => setFilters({ ...filters, timeFrame: value })}
          label="À venir"
          value="future"
        />
        <TournamentTab
          selected={filters.timeFrame}
          setSelected={(value) => setFilters({ ...filters, timeFrame: value })}
          label="En cours"
          value="current"
        />
        <TournamentTab
          selected={filters.timeFrame}
          setSelected={(value) => setFilters({ ...filters, timeFrame: value })}
          label="Passés"
          value="past"
        />
      </Stack>
      <Stack direction="row" alignItems="center" spacing="0.75rem">
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
          value={filters.searchQuery}
          onChange={(e) =>
            setFilters({ ...filters, searchQuery: e.target.value })
          }
          endAdornment={
            <Stack p="0.25rem">
              <Search sx={{ color: 'text.secondary' }} />
            </Stack>
          }
        />
        <Badge badgeContent={1} color="primary" overlap="circular">
          <IconButton size="medium" color="secondary">
            <Tune sx={{ color: 'text.secondary' }} />
          </IconButton>
        </Badge>
      </Stack>
    </Stack>
  );
};
