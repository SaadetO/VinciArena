import { Box, Stack } from '@mui/material';
import { useEffect, useRef, useState } from 'react';
import { TournamentTab } from './TournamentTab';

interface TournamentTimeFrameTabsProps {
  timeFrame: 'future' | 'current' | 'past';
  setTimeFrame: (timeFrame: 'future' | 'current' | 'past') => void;
}

export const TournamentTimeFrameTabs = ({
  timeFrame,
  setTimeFrame,
}: TournamentTimeFrameTabsProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [indicatorStyle, setIndicatorStyle] = useState({
    left: 0,
    top: 0,
    width: 0,
    height: 0,
  });

  useEffect(() => {
    if (!containerRef.current) return;
    const selectedEl = containerRef.current.querySelector(
      `button[data-value="${timeFrame}"]`,
    ) as HTMLButtonElement | null;

    if (selectedEl) {
      setIndicatorStyle({
        left: selectedEl.offsetLeft,
        top: selectedEl.offsetTop,
        width: selectedEl.offsetWidth,
        height: selectedEl.offsetHeight,
      });
    }
  }, [timeFrame]);

  return (
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
        selected={timeFrame}
        setSelected={setTimeFrame}
        label="À venir"
        value="future"
      />
      <TournamentTab
        selected={timeFrame}
        setSelected={setTimeFrame}
        label="En cours"
        value="current"
      />
      <TournamentTab
        selected={timeFrame}
        setSelected={setTimeFrame}
        label="Passés"
        value="past"
      />
    </Stack>
  );
};
