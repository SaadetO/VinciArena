import { Box, Stack } from '@mui/material';
import { useEffect, useRef, useState } from 'react';
import { TournamentTab } from './TournamentTab';

interface TournamentControlsProps {
  selected: 'past' | 'current' | 'future';
  setSelected: (selected: 'past' | 'current' | 'future') => void;
}

export const TournamentControls = ({
  selected,
  setSelected,
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
      `button[data-value="${selected}"]`,
    ) as HTMLButtonElement | null;

    if (selectedEl) {
      setIndicatorStyle({
        left: selectedEl.offsetLeft,
        top: selectedEl.offsetTop,
        width: selectedEl.offsetWidth,
        height: selectedEl.offsetHeight,
      });
    }
  }, [selected]);

  return (
    <Stack
      direction="row"
      bgcolor="background.s1"
      borderRadius="0 0 1.5rem 1.5rem"
      px="1.5rem"
      height="6rem"
      alignItems="center"
      position="sticky"
      top="0"
      zIndex={1}
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
          selected={selected}
          setSelected={setSelected}
          label="À venir"
          value="future"
        />
        <TournamentTab
          selected={selected}
          setSelected={setSelected}
          label="En cours"
          value="current"
        />
        <TournamentTab
          selected={selected}
          setSelected={setSelected}
          label="Passés"
          value="past"
        />
      </Stack>
    </Stack>
  );
};
