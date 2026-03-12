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

    const isPasswordEmpty = !password.password?.trim();
    const isConfirmEmpty = !password.confirmPassword?.trim();

    if (isPasswordEmpty)
      setError((prev) => ({
        ...prev,
        password: errorMsgs[0],
      }));

    if (isConfirmEmpty)
      setError((prev) => ({
        ...prev,
        confirmPassword: errorMsgs[1],
      }));

    if (
      isPasswordEmpty ||
      isConfirmEmpty ||
      error.password ||
      error.confirmPassword
    )
      return setIsLoading(false);

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
      // TODO : Success message
    } catch (err: unknown) {
      // TODO : Error message
    } finally {
      setIsLoading(false);
    }

    onClose(); // TODO : Optimistic close next
  };

  useEffect(() => {
    setError((prevError) => {
      const newError = { ...prevError };

      if (prevError.password === errorMsgs[0] && password.password.trim())
        newError.password = '';

      if (
        prevError.confirmPassword === errorMsgs[1] &&
        password.confirmPassword.trim()
      )
        newError.confirmPassword = '';

      if (
        password.confirmPassword !== '' &&
        password.password !== password.confirmPassword
      )
        newError.confirmPassword = errorMsgs[2];
      else if (
        password.confirmPassword !== '' &&
        password.password === password.confirmPassword
      )
        newError.confirmPassword = '';

      if (
        newError.password !== prevError.password ||
        newError.confirmPassword !== prevError.confirmPassword
      )
        return newError;

      return prevError;
    });
  }, [password]);

  useEffect(() => {
    setPassword(initPasswordData());
    setError(initPasswordData());
    setIsLoading(false);
  }, [open]);
  return (
    <Dialog
      open={open}
      onClose={handleClose}
      onKeyUp={(e) => e.key === 'Enter' && handleSubmit()}
    >
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
          fullWidth
        >
          Annuler
        </Button>
        <Button
          variant="contained"
          disabled={isLoading}
          onClick={handleSubmit}
          fullWidth
        >
          confirmer
        </Button>
      </DialogActions>
    </Dialog>
  );
};
