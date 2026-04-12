import { Outlet } from 'react-router-dom';
import { Header } from './components/Header';
import { MainContext } from './types';
import { Box } from '@mui/material';
import { NotificationProvider } from './contexts/NotificationContext';
import { TournamentModalProvider } from './contexts/TournamentModalContext';
import { TournamentModal } from './modals/TournamentModal';
import { HomePageContextProvider } from './pages/HomePage/contexts/HomePageContext';

export const App = () => {
  const mainContext: MainContext = {};

  return (
    <NotificationProvider>
      <TournamentModalProvider>
        <HomePageContextProvider>
          <Header />
          <Box
            component="main"
            sx={{
              display: 'flex',
              flexDirection: 'column',
              flex: 1,
              overflowY: 'auto',
            }}
          >
            <Outlet context={mainContext} />
          </Box>

          <TournamentModal />
        </HomePageContextProvider>
      </TournamentModalProvider>
    </NotificationProvider>
  );
};
