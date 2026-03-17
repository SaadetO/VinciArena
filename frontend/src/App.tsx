import { Outlet } from 'react-router-dom';
import { Header } from './components/Header';
import { MainContext } from './types';
import { Box } from '@mui/material';

export const App = () => {
  const mainContext: MainContext = {};

  return (
    <>
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
    </>
  );
};
