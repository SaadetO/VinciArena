// LineupContext.ts
import { createContext, useContext } from 'react';
import { MemberSummaryDto } from '../../../../types';

export interface LineupContextType {
  allMembers: MemberSummaryDto[];
  loading: boolean;
  selectedIds: number[];
  remainingPlaces: number;
  handleToggle: (id: number) => void;
}

export const LineupContext = createContext<LineupContextType | null>(null);

export const useLineup = () => {
  const context = useContext(LineupContext);
  if (!context)
    throw new Error('useLineup must be used within a LineupProvider');
  return context;
};
