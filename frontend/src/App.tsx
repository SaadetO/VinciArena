import { Outlet } from 'react-router-dom';
import { Header } from './components/Header';
import { MainContext } from './types';
import { Box } from '@mui/material';
import { NotificationProvider } from './contexts/NotificationContext';
import { TournamentModalProvider } from './contexts/TournamentModalContext';

export const App = () => {
  const mainContext: MainContext = {};

  return (
    <NotificationProvider>
      <TournamentModalProvider>
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
      </TournamentModalProvider>
    </NotificationProvider>
  );
};
