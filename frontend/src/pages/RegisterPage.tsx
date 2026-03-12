import { useState, SyntheticEvent, useContext, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Alert,
  Autocomplete,
  Avatar,
  Box,
  Button,
  Container,
  Divider,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { ProfileImage, UserContextType } from '../types';
import { UserContext } from '../contexts/UserContext';
import logo from '../assets/images/logo.svg';
import authBackground from '../assets/images/auth_background.jpg';
import { ArrowBack } from '@mui/icons-material';
import { ProfileImageMenu } from '../components/ProfileImageMenu';

interface FormData {
  email: string;
  password: string;
  tag: string;
  specialtyId: number | null;
  profileImageId: number | null;
}

// ---- fetch the real array of specialties from the db ---- //
const specialties = [
  { label: 'architecte', id: 1 },
  { label: 'exécuteur', id: 2 },
  { label: 'tacticien', id: 3 },
  { label: 'gardien', id: 4 },
  { label: 'catalyseur', id: 5 },
  { label: 'perturbateur', id: 6 },
  { label: 'guérisseur', id: 7 },
];

export const RegisterPage = () => {
  const { registerUser }: UserContextType = useContext(UserContext);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [chosenImage, setChosenImage] = useState<ProfileImage | null>(null);
  const [showError, setShowError] = useState(false);
  const navigate = useNavigate();
  const [formData, setFormData] = useState<FormData>({
    email: '',
    password: '',
    tag: '',
    specialtyId: null,
    profileImageId: null,
  });

  const handleSubmit = async (e: SyntheticEvent) => {
    e.preventDefault();
    console.log(formData.specialtyId);
    if (!formData.profileImageId || !formData.specialtyId) {
      setShowError(true);
      return;
    }

    try {
      await registerUser(formData);
      navigate('/auth/login');
    } catch (err) {
      console.error('RegisterPage::error: ', err);
    }
  };

  const handleChange = (e: SyntheticEvent) => {
    const input = e.target as HTMLInputElement;
    setFormData({ ...formData, [input.name]: input.value });
  };

  const handleSelectImage = (image: ProfileImage) => {
    setChosenImage(image);
    setFormData((prev) => ({ ...prev, profileImageId: image.idImage }));
  };

  useEffect(() => {
    console.log(formData);
  }, [formData]);
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
        <Stack alignItems="center" spacing={1}>
          <Avatar
            onClick={() => setIsMenuOpen(true)}
            src={chosenImage ? `/src/assets/images/${chosenImage.path}` : ''}
            sx={{
              width: 70,
              height: 70,
              border: '2px solid #ccc',
              cursor: 'pointer',
            }}
          />
          <Typography
            variant="caption"
            sx={{
              color: 'text.secondary',
            }}
          >
            Sélectionnez une image de profil
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
              type="password"
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
            <Autocomplete
              options={specialties}
              fullWidth
              getOptionLabel={(e) =>
                e.label.charAt(0).toUpperCase() + e.label.slice(1)
              }
              autoHighlight
              renderInput={(params) => (
                <TextField {...params} placeholder="Spécialité" />
              )}
              onChange={(_, e) =>
                setFormData((prev) => ({ ...prev, specialtyId: e?.id ?? null }))
              }
            />
          </Stack>
          <Divider sx={{ my: 1 }}></Divider>
          {showError && (
            <Alert severity="error" variant="filled">
              Tous les champs sont requis !
            </Alert>
          )}
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
      <ProfileImageMenu
        open={isMenuOpen}
        onClose={() => setIsMenuOpen(false)}
        onSelect={handleSelectImage}
      />
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
