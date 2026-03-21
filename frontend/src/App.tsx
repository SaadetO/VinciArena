import { Outlet } from 'react-router-dom';
import { Header } from './components/Header';
import { MainContext } from './types';
import { Box } from '@mui/material';
import { NotificationProvider } from './contexts/NotificationContext';

export const App = () => {
  const mainContext: MainContext = {};

  return (
    <NotificationProvider>
      <Header />
      <Box
        component="main"
        sx={{
          display: 'flex',
          flexDirection: 'column',
          flex: 1,
        }}
      >
        <Outlet context={mainContext} />
      </Box>
    </NotificationProvider>
  );
};
