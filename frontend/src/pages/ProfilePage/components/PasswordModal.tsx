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
import { useEffect, useState } from 'react';

/**
 * Design Note - Error Handling:
 * The 'PasswordData' interface is used for both the
 * form values and the validation errors.
 *
 * This is done to future proof the component and
 * allow verifications like including at least one
 * letter, number, uppercase letter,...
 *
 * So even tho we are not currently using the password
 * field in theerror useState, it could be useful for
 * future iterations which is why I included it.
 */
interface PasswordData {
  password: String | null;
  confirmPassword: String | null;
}

const initPasswordData = (): PasswordData => ({
  password: null,
  confirmPassword: null,
});

interface PasswordModalProps {
  open: boolean;
  onClose: () => void;
}

export const PasswordModal = ({ open, onClose }: PasswordModalProps) => {
  const [password, setPassword] = useState<PasswordData>(initPasswordData());
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<PasswordData>(initPasswordData());

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

  const handleSubmit = () => {
    setIsLoading(true);
    console.log(password);
    setError({
      password: null,
      confirmPassword: null,
    });
    onClose();
  };

  useEffect(() => {
    if (
      password.password !== password.confirmPassword &&
      password.confirmPassword !== null
    )
      setError((prev) => ({
        ...prev,
        confirmPassword: 'Les mots de passe ne correspondent pas.',
      }));
    else setError(initPasswordData());

    if (
      password.password?.trim() === '' &&
      password.confirmPassword?.trim() === ''
    )
      setPassword(initPasswordData());
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
        {/* <Button onClick={handleClose} disabled={isLoading}>
          Annuler
        </Button> */}
        <Button
          variant="contained"
          color="secondary"
          disabled={
            isLoading ||
            !!error.password ||
            !!error.confirmPassword ||
            !password.password ||
            !password.confirmPassword
          }
          onClick={handleSubmit}
          fullWidth
        >
          confirmer
        </Button>
      </DialogActions>
    </Dialog>
  );
};
