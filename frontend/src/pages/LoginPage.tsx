import { useState, SyntheticEvent, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  Container,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { UserContextType } from '../types';
import { UserContext } from '../contexts/UserContext';
import logo from '../assets/images/logo.svg';
import authBackground from '../assets/images/auth_background.jpg';
import { ArrowBack } from '@mui/icons-material';

export const LoginPage = () => {
  const { loginUser }: UserContextType = useContext(UserContext);
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const handleSubmit = async (e: SyntheticEvent) => {
    e.preventDefault();
    try {
      await loginUser(formData);
      navigate('/');
    } catch (err) {
      console.error('LoginPage::error: ', err);
    }
  };

  const handleChange = (e: SyntheticEvent) => {
    const input = e.target as HTMLInputElement;
    setFormData((prev) => ({ ...prev, [input.name]: input.value }));
  };

  return (
    <Stack direction="row" flex="1">
      <Link to="/" style={{ padding: '1rem', position: 'fixed' }}>
        <Button variant="text" startIcon={<ArrowBack />}>
          Retour à l'accueil
        </Button>
      </Link>
      <Container
        maxWidth={false}
        sx={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          gap: '1.5rem',
          maxWidth: '20rem',
        }}
      >
        <Stack spacing="1.5rem" alignItems="center">
          <img src={logo} width="44" height="44" />
          <Typography variant="h3" textAlign="center">
            Bon retour
          </Typography>
        </Stack>
        <form
          onSubmit={handleSubmit}
          style={{
            width: '100%',
          }}
        >
          <Stack spacing="0.75rem">
            <TextField
              fullWidth
              id="email"
              name="email"
              type="email"
              placeholder="Email"
              variant="outlined"
              value={formData.email}
              onChange={handleChange}
              required
            />
            <TextField
              fullWidth
              id="password"
              name="password"
              placeholder="Mot de passe"
              variant="outlined"
              value={formData.password}
              onChange={handleChange}
              required
            />
          </Stack>
          <Stack spacing="1.5rem" paddingTop="1.5rem">
            <Button type="submit" variant="contained">
              Se Connecter
            </Button>
            <Typography textAlign="center" variant="body2" color="secondary">
              Pas de compte? <Link to="/auth/register">S'inscrire</Link>
            </Typography>
          </Stack>
        </form>
      </Container>
      <Box
        width={1 / 3}
        minHeight="100%"
        alignItems="center"
        justifyContent="center"
        sx={{
          background: `url(${authBackground}) no-repeat center/cover`,
        }}
      />
    </Stack>
  );
};
