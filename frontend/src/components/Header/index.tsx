import { Button, Stack, Tab, Tabs, Typography } from '@mui/material';
import logo from '../../assets/images/Logo.svg';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { SyntheticEvent, useContext } from 'react';
import { NotificationMenu } from './components/NotificationMenu';
import { UserContext } from '../../contexts/UserContext';
import { UserMenu } from './components/UserMenu';
import { AdminManagementModal } from './modals/AdminManagementModal';
import { useState } from 'react';
import { TournamentModal } from '../../pages/TournamentPage/modals/tournamentModal';
export const Header = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { authenticatedUser } = useContext(UserContext);
  const [isAdminModalOpen, setIsAdminModalOpen] = useState(false);
  const [isTournamentModalOpen, setIsTournamentModalOpen] = useState(false);
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
        onChange={(_e: SyntheticEvent, newValue: string) => navigate(newValue)}
      >
        <Tab label="Tournois" value="/" />
        <Tab label="Teams" value="/teams" />
      </Tabs>
      <Stack direction="row" spacing="1.5rem">
        <Stack direction="row" spacing="1rem">
          {authenticatedUser?.admin && (
            <Stack direction="row" spacing="1rem">
              <Button
                variant="contained"
                onClick={() => setIsTournamentModalOpen(true)}
              >
                Créer un Tournoi
              </Button>
              <TournamentModal
                open={isTournamentModalOpen}
                onClose={() => setIsTournamentModalOpen(false)}
              ></TournamentModal>
              <Button
                variant="contained"
                color="secondary"
                onClick={() => setIsAdminModalOpen(true)}
              >
                Gérer les Membres
              </Button>
              <AdminManagementModal
                open={isAdminModalOpen}
                onClose={() => setIsAdminModalOpen(false)}
              />
            </Stack>
          )}
          {authenticatedUser ? (
            <>
              <NotificationMenu />
              <UserMenu />
            </>
          ) : (
            <>
              <Link to="/auth/register">
                <Button variant="contained" color="secondary">
                  S'Inscrire
                </Button>
              </Link>
              <Link to="/auth/login">
                <Button variant="contained">Se Connecter</Button>
              </Link>
            </>
          )}
        </Stack>
      </Stack>
    </Stack>
  );
};
