import { useContext } from 'react';
import { Outlet } from 'react-router-dom';
import { Header } from './components/Header';
import { MainContext, UserContextType } from './types';
import { UserContext } from './contexts/UserContext';
import { Box } from '@mui/material';

export const App = () => {
  const { authenticatedUser } = useContext<UserContextType>(UserContext);
  console.log(authenticatedUser);

  const mainContext: MainContext = {};

  return (
    <>
      <Header />
      <Box
        component="main"
        sx={{
          display: 'flex',
          flex: 1,
        }}
      >
        <Outlet context={mainContext} />
      </Box>
    </>
  );
};
