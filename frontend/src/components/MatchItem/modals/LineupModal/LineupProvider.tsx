// LineupProvider.tsx
import { useState, useEffect, useCallback, useRef, ReactNode } from 'react';
import { LineupContext } from './LineupContext';
import { useMatches } from '../../../../hooks/useMatches';
import { MemberSummaryDto } from '../../../../types';

export const LineupProvider = ({
  children,
  matchId,
  teamId,
  onSelectionChange,
}: {
  children: ReactNode;
  matchId: number;
  teamId: number;
  onSelectionChange: (ids: number[]) => void;
}) => {
  // init state variables
  const [allMembers, setAllMembers] = useState<MemberSummaryDto[]>([]);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);
  // api hooks for fetching data
  const { getLineup, getAvailableMembers } = useMatches();

  // stores the most recent selection of player
  // useRef to not trigger an infinit rerender loop
  const onSelectionChangeRef = useRef(onSelectionChange);
  useEffect(() => {
    onSelectionChangeRef.current = onSelectionChange;
  }, [onSelectionChange]);

  // calculate remaining places: automatically when selectedIds change
  const remainingPlaces = Math.max(0, 4 - selectedIds.length);

  // data initialization: loading datafrom backend when modal first opens
  // fetch both all available members and last selected members
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        // parallel fetch
        const [members, lineup] = await Promise.all([
          getAvailableMembers({ matchId }),
          getLineup({ matchId, teamId }),
        ]);
        if (members) setAllMembers(members);
        if (lineup) {
          const ids = lineup.players.map((p: MemberSummaryDto) => p.id);
          setSelectedIds(ids);
          // setting initial selected ids
          onSelectionChangeRef.current(ids);
        }
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [getAvailableMembers, getLineup, matchId, teamId]);

  // selection logic
  const handleToggle = useCallback((id: number) => {
    setSelectedIds((prev) => {
      const newSelection = prev.includes(id)
        ? prev.filter((sid) => sid !== id) // remove if member removed
        : [...prev, id]; // add if member added
      // update selection
      onSelectionChangeRef.current(newSelection);
      return newSelection;
    });
  }, []); // empty because prev is used

  return (
    <LineupContext.Provider
      value={{
        allMembers,
        loading,
        selectedIds,
        remainingPlaces,
        handleToggle,
      }}
    >
      {children}
    </LineupContext.Provider>
  );
};
