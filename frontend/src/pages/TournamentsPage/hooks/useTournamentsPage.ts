import { useContext } from 'react';
import { HomePageContext } from '../../TournamentsPage/contexts/HomePageContext';

export const useHomePage = () => {
  const ctx = useContext(HomePageContext);
  if (!ctx) throw new Error('useHomePage must be used within HomePageProvider');
  return ctx;
};
