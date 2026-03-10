import { useState, SyntheticEvent, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  Container,
  MenuItem,
  Select,
  SelectChangeEvent,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { UserContextType } from '../types';
import { UserContext } from '../contexts/UserContext';
import logo from '../assets/images/logo.svg';
import authBackground from '../assets/images/auth_background.jpg';
import { ArrowBack } from '@mui/icons-material';

export const RegisterPage = () => {
  const { registerUser }: UserContextType = useContext(UserContext);
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    tag: '',
    specialty: 1,
  });

  const specialties = [
    {
      id: 1,
      name: 'architecte',
    },
    {
      id: 2,
      name: 'exécuteur',
    },
    {
      id: 3,
      name: 'tacticien',
    },
    {
      id: 4,
      name: 'gardien',
    },
    {
      id: 5,
      name: 'catalyseur',
    },
    {
      id: 6,
      name: 'perturbateur',
    },
    {
      id: 7,
      name: 'guérisseur',
    },
  ];

  const handleSubmit = async (e: SyntheticEvent) => {
    e.preventDefault();

    const payload = {
      email: formData.email,
      password: formData.password,
      tag: formData.tag,
      specialityId: formData.specialty,
    };

    try {
      await registerUser(payload);
      navigate('/auth/login');
    } catch (err) {
      console.error('RegisterPage::error: ', err);
    }
  };

  const handleChange = (e: SyntheticEvent) => {
    const input = e.target as HTMLInputElement;
    setFormData({ ...formData, [input.name]: input.value });
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
          <Stack spacing="0.5rem">
            <Typography variant="h3" textAlign="center">
              Bienvenue
            </Typography>
            <Typography variant="body1" color="secondary" textAlign="center">
              Inscrivez vous et commencez votre expérience.
            </Typography>
          </Stack>
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
            <TextField
              fullWidth
              id="tag"
              name="tag"
              placeholder="Tag"
              variant="outlined"
              value={formData.tag}
              onChange={handleChange}
              required
            />
            <Select
              fullWidth
              id="specialty"
              name="specialty"
              value={formData.specialty + ''}
              onChange={(e: SelectChangeEvent) =>
                setFormData((prev) => ({
                  ...prev,
                  [e.target.name]: Number(e.target.value),
                }))
              }
            >
              {specialties.map((specialty) => (
                <MenuItem key={specialty.id} value={specialty.id}>
                  {specialty.name.charAt(0).toUpperCase() +
                    specialty.name.slice(1)}
                </MenuItem>
              ))}
            </Select>
          </Stack>
          <Stack spacing="1.5rem" paddingTop="1.5rem">
            <Button type="submit" variant="contained">
              S'inscrire
            </Button>
            <Typography textAlign="center" variant="body2" color="secondary">
              Déjà inscrit? <Link to="/auth/login">Se connecter</Link>
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