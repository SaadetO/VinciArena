import { Button, Stack, Tab, Tabs, Typography } from '@mui/material';
import logo from '../assets/images/Logo.svg';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { SyntheticEvent, useContext } from 'react';
import NotificationMenu from './NotificationMenu';
import { UserContext } from '../contexts/UserContext';
export const Header = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { authenticatedUser, clearUser } = useContext(UserContext);
  const handleDisconnection = () => {
    clearUser();
  };

  if (!authenticatedUser) {
    return (
      <Stack
        component="header"
        direction="row"
        height="5rem"
        padding="0 2.25rem"
        alignItems="center"
        sx={{
          background: (theme) => theme.palette.background.s1,
          border: (theme) => `1px solid ${theme.palette.divider}`,
        }}
      >
        <Link to="/" style={{ textDecoration: 'none', height: '100%' }}>
          <Stack
            direction="row"
            spacing="0.75rem"
            alignItems="center"
            paddingRight="2.5rem"
            height="100%"
          >
            <img src={logo} alt="logo" width={24} height={24} />
            <Typography variant="h4">Vinci Arena</Typography>
          </Stack>
        </Link>
        <Tabs
          value={
            location.pathname === '/'
              ? '/'
              : location.pathname.startsWith('/teams')
                ? '/teams'
                : false
          }
          sx={{ flex: 1 }}
          onChange={(_e: SyntheticEvent, newValue: string) =>
            navigate(newValue)
          }
        >
          <Tab label="tournois" value="/" />
          <Tab label="teams" value="/teams" />
        </Tabs>
        <Stack direction="row" spacing="1rem">
          <Link to="/auth/register">
            <Button variant="contained" color="secondary">
              s'inscrire
            </Button>
          </Link>
          <Link to="/auth/login">
            <Button variant="contained">se connecter</Button>
          </Link>
        </Stack>
      </Stack>
    );
  } else {
    return (
      <Stack
        component="header"
        direction="row"
        height="5rem"
        padding="0 2.25rem"
        alignItems="center"
        sx={{
          background: (theme) => theme.palette.background.s1,
          border: (theme) => `1px solid ${theme.palette.divider}`,
        }}
      >
        <Link to="/" style={{ textDecoration: 'none', height: '100%' }}>
          <Stack
            direction="row"
            spacing="0.75rem"
            alignItems="center"
            paddingRight="2.5rem"
            height="100%"
          >
            <img src={logo} alt="logo" width={24} height={24} />
            <Typography variant="h4">Vinci Arena</Typography>
          </Stack>
        </Link>
        <Tabs
          value={
            location.pathname === '/'
              ? '/'
              : location.pathname.startsWith('/teams')
                ? '/teams'
                : false
          }
          sx={{ flex: 1 }}
          onChange={(_e: SyntheticEvent, newValue: string) =>
            navigate(newValue)
          }
        >
          <Tab label="tournois" value="/" />
          <Tab label="teams" value="/teams" />
        </Tabs>
        <Stack direction="row" spacing="1rem">
          <NotificationMenu></NotificationMenu>
          <Button onClick={handleDisconnection} variant="contained">
            se déconnecter
          </Button>
        </Stack>
      </Stack>
    );
  }
};
