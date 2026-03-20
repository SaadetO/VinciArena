import { useState, SyntheticEvent, useEffect } from 'react';
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
import { SpecialtyDto, ProfileImage } from '../types';
import { useUser } from '../hooks/useUser';
import { useSpecialties } from '../hooks/useSpecialties';
import logo from '../assets/images/logo.svg';
import authBackground from '../assets/images/auth_background.jpg';
import { ArrowBack, Visibility, VisibilityOff } from '@mui/icons-material';
import { profileImageModal } from '../modals/profileImageModal';
import { useModal } from '../hooks/useModal';
import { useSnackbar } from '../hooks/useSnackbar';
import { LoadingIcon } from '../components/LoadingIcon';

interface FormData {
  email: string;
  password: string;
  tag: string;
  specialtyId: number | null;
  profileImageId: number | null;
}

export const RegisterPage = () => {
  const { registerUser, isRegistering } = useUser();
  const [chosenImage, setChosenImage] = useState<ProfileImage | null>(null);
  const [selectedSpecialty, setSelectedSpecialty] =
    useState<SpecialtyDto | null>(null);
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<FormData>({
    email: '',
    password: '',
    tag: '',
    specialtyId: null,
    profileImageId: null,
  });
  const { specialties, getAll: getSpecialties, isGettingSpecialties: loading } = useSpecialties();
  const [showPassword, setShowPassword] = useState(false);
  const { openModal } = useModal();
  const { showSnackbar } = useSnackbar();

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

    registerUser(formData, navigate);
  };

  const handleChange = (e: SyntheticEvent) => {
    const input = e.target as HTMLInputElement;
    setFormData((prev) => ({ ...prev, [input.name]: input.value }));
  };

  const togglePasswordVisibility = () => {
    setShowPassword((prev) => !prev);
  };

  const handleSpecialtyChange = (_: SyntheticEvent, e: SpecialtyDto | null) => {
    setSelectedSpecialty(e);
    setFormData((prev) => ({
      ...prev,
      specialtyId: e?.id ?? null,
    }));
  };

  const handleBack = () => {
    setStep(1);
  };

  useEffect(() => {
    getSpecialties();
  }, [getSpecialties]);

  const handleAvatarClick = () => {
    let selectedImage: ProfileImage | null = null;

    const onSelect = (image: ProfileImage | null) => {
      selectedImage = image;
    };

    const onConfirm = (close: () => void) => {
      if (!selectedImage) return;
      setChosenImage(selectedImage);
      setFormData((prev) => ({
        ...prev,
        profileImageId: selectedImage!.idImage,
      }));
      close();
      showSnackbar({
        message: 'Image de profil choisie',
        severity: 'success',
      });
    };

    openModal(
      profileImageModal({
        onSelect,
        onConfirm,
      }),
    );
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
          {isRegistering ? (
            <Box>
              <LoadingIcon />
            </Box>
          ) : (
            <img src={logo} width="44" height="44" />
          )}
          <Stack spacing="0.5rem">
            <Typography variant="h3" textAlign="center">
              {isRegistering
                ? 'Traitement en cours'
                : step === 1
                  ? 'Bienvenue'
                  : 'Choisissez votre avatar'}
            </Typography>
            <Typography variant="body1" color="secondary" textAlign="center">
              {isRegistering
                ? 'Votre inscription est en cours de traitement, veuillez patienter.'
                : step === 1
                  ? 'Inscrivez vous et commencez votre expérience.'
                  : 'Choisissez une photo de profil parmi les images proposées.'}
            </Typography>
          </Stack>
        </Stack>
        {!isRegistering && (
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
                        <IconButton onClick={togglePasswordVisibility}>
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
                  value={selectedSpecialty}
                  getOptionLabel={(e) =>
                    e.label.charAt(0).toUpperCase() + e.label.slice(1)
                  }
                  autoHighlight
                  renderInput={(params) => (
                    <TextField {...params} placeholder="Spécialité" />
                  )}
                  onChange={handleSpecialtyChange}
                />
              </Stack>
            ) : (
              <Stack alignItems="center">
                <Avatar
                  onClick={handleAvatarClick}
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
                    onClick={handleBack}
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
        )}
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
