import { useState, SyntheticEvent, useContext, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Autocomplete,
  Avatar,
  Box,
  Button,
  Container,
  IconButton,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { SpecialtyDto, ProfileImage, UserContextType } from '../types';
import { UserContext } from '../contexts/UserContext';
import logo from '../assets/images/logo.svg';
import authBackground from '../assets/images/auth_background.jpg';
import { ArrowBack, Visibility, VisibilityOff } from '@mui/icons-material';
import { ProfileImageModal } from '../components/ProfileImageModal';

interface FormData {
  email: string;
  password: string;
  tag: string;
  specialtyId: number | null;
  profileImageId: number | null;
}

export const RegisterPage = () => {
  const { registerUser }: UserContextType = useContext(UserContext);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [chosenImage, setChosenImage] = useState<ProfileImage | null>(null);
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<FormData>({
    email: '',
    password: '',
    tag: '',
    specialtyId: null,
    profileImageId: null,
  });
  const [specialties, setSpecialties] = useState<SpecialtyDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: SyntheticEvent) => {
    e.preventDefault();
    if (step === 1) {
      if (
        !formData.email ||
        !formData.password ||
        !formData.tag ||
        !formData.specialtyId
      )
        return;
      setStep(2);
      return;
    }

    if (!formData.profileImageId) return;

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

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const response = await fetch('/api/specialties');

        if (!response.ok) {
          throw new Error(
            `fetch error : ${response.status} : ${response.statusText}`,
          );
        }

        const specialties = await response.json();

        setSpecialties(specialties);
      } catch (err) {
        console.log('getAllSpecialties::error: ', err);
        setSpecialties([]);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const handleSelectImage = (image: ProfileImage) => {
    setChosenImage(image);
    setFormData((prev) => ({ ...prev, profileImageId: image.idImage }));
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
              {step === 1 ? 'Bienvenue' : 'Choisissez votre avatar'}
            </Typography>
            <Typography variant="body1" color="secondary" textAlign="center">
              {step === 1
                ? 'Inscrivez vous et commencez votre expérience.'
                : 'Choisissez une photo de profil parmi les images proposées.'}
            </Typography>
          </Stack>
        </Stack>
        <form
          onSubmit={handleSubmit}
          style={{
            width: '100%',
          }}
        >
          {step === 1 ? (
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
                type={showPassword ? 'text' : 'password'}
                placeholder="Mot de passe"
                variant="outlined"
                value={formData.password}
                onChange={handleChange}
                required
                slotProps={{
                  input: {
                    endAdornment: formData.password.trim().length > 0 && (
                      <IconButton
                        onClick={() => setShowPassword((prev) => !prev)}
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    ),
                  },
                }}
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
                loading={loading}
                fullWidth
                value={specialties.find((e) => e.id === formData.specialtyId)}
                getOptionLabel={(e) =>
                  e.label.charAt(0).toUpperCase() + e.label.slice(1)
                }
                autoHighlight
                renderInput={(params) => (
                  <TextField {...params} placeholder="Spécialité" />
                )}
                onChange={(_, e) =>
                  setFormData((prev) => ({
                    ...prev,
                    specialtyId: e?.id ?? null,
                  }))
                }
              />
            </Stack>
          ) : (
            <Stack alignItems="center">
              <Avatar
                onClick={() => setIsMenuOpen(true)}
                src={chosenImage ? `/assets/avatars/${chosenImage.path}` : ''}
                sx={{
                  width: 100,
                  height: 100,
                  cursor: 'pointer',
                }}
                className="profile-picture-placeholder"
              />
            </Stack>
          )}
          <Stack spacing="1.5rem" paddingTop="1.5rem">
            <Stack spacing="0.5rem">
              {step === 2 && (
                <Button
                  variant="contained"
                  color="secondary"
                  onClick={() => setStep(1)}
                  startIcon={<ArrowBack />}
                >
                  Retour
                </Button>
              )}
              <Button type="submit" variant="contained">
                {step === 1 ? 'Continuer' : "S'inscrire"}
              </Button>
            </Stack>
            <Typography textAlign="center" variant="body2" color="secondary">
              Déjà inscrit? <Link to="/auth/login">Se connecter</Link>
            </Typography>
          </Stack>
        </form>
      </Container>
      <ProfileImageModal
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
