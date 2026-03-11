import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { useContext, useEffect, useState } from 'react';
import { UserContext } from '../../../contexts/UserContext';

interface PasswordData {
  password: string;
  confirmPassword: string;
}

const initPasswordData = (): PasswordData => ({
  password: '',
  confirmPassword: '',
});

interface PasswordModalProps {
  open: boolean;
  onClose: () => void;
}

const errorMsgs = [
  'Le mot de passe ne peut pas être vide.',
  'Veuillez confirmer votre mot de passe.',
  'Les mots de passe ne correspondent pas.',
];

export const PasswordModal = ({ open, onClose }: PasswordModalProps) => {
  const [password, setPassword] = useState<PasswordData>(initPasswordData());
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<PasswordData>(initPasswordData());
  const { authenticatedUser } = useContext(UserContext);

  const handleClose = () => {
    setPassword(initPasswordData());
    setError(initPasswordData());
    setIsLoading(false);
    onClose();
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPassword((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    if (!password.password?.trim())
      setError((prev) => ({
        ...prev,
        password: errorMsgs[0],
      }));

    if (!password.confirmPassword?.trim())
      setError((prev) => ({
        ...prev,
        confirmPassword: errorMsgs[1],
      }));
    if (error.password || error.confirmPassword) return;

    try {
      const response = await fetch('/api/members/me/password', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: authenticatedUser?.token ?? '',
        },
        body: JSON.stringify({ password: password.password }),
      });

      if (!response.ok) throw new Error('Failed to update password');

    } catch (err: unknown) {
      // TODO
    } finally {
      setIsLoading(false);
    }

    onClose();
  };

  useEffect(() => {
    if (error.password === errorMsgs[0] && password.password.trim())
      setError((prev) => ({ ...prev, password: '' }));
    if (
      error.confirmPassword === errorMsgs[1] &&
      password.confirmPassword.trim()
    )
      setError((prev) => ({ ...prev, confirmPassword: '' }));

    if (
      password.confirmPassword !== '' &&
      password.password !== password.confirmPassword
    )
      setError((prev) => ({ ...prev, confirmPassword: errorMsgs[2] }));
    else if (
      password.confirmPassword !== '' &&
      password.password === password.confirmPassword
    )
      setError((prev) => ({ ...prev, confirmPassword: '' }));
  }, [password]);
  return (
    <Dialog open={open} onClose={handleClose}>
      <DialogTitle variant="h2">Modifier mon mot de passe</DialogTitle>
      <Typography textAlign="center" padding="0 2rem 1rem" color="secondary">
        Creez votre nouveau mot de passe en complétant les champs ci-dessous
      </Typography>
      <DialogContent>
        <Stack spacing="1rem">
          <TextField
            id="password"
            name="password"
            placeholder="Mot de passe"
            onChange={handleChange}
            variant="outlined"
            error={!!error.password}
            helperText={error.password}
          />
          <TextField
            id="confirmPassword"
            name="confirmPassword"
            placeholder="Confirmez votre mot de passe"
            onChange={handleChange}
            variant="outlined"
            error={!!error.confirmPassword}
            helperText={error.confirmPassword}
          />
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button
          variant="contained"
          color="secondary"
          onClick={handleClose}
          disabled={isLoading}
          fullWidth
        >
          Annuler
        </Button>
        <Button variant="contained" onClick={handleSubmit} fullWidth>
          confirmer
        </Button>
      </DialogActions>
    </Dialog>
  );
};
