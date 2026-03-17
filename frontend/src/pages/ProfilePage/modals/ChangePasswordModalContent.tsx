import { IconButton, Stack, TextField } from '@mui/material';
import { useEffect, useState } from 'react';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import { useModalController } from '../../../hooks/useModalController';

interface PasswordData {
  password: string;
  confirmPassword: string;
}

const initPasswordData = (): PasswordData => ({
  password: '',
  confirmPassword: '',
});

const errorMsgs = [
  'Le mot de passe ne peut pas être vide.',
  'Veuillez confirmer votre mot de passe.',
  'Les mots de passe ne correspondent pas.',
];

export const ChangePasswordModalContent = ({
  onSelect,
}: {
  onSelect: (password: string | null) => void;
}) => {
  const [password, setPassword] = useState<PasswordData>(initPasswordData());
  const [errorObj, setErrorObj] = useState<PasswordData>(initPasswordData());
  const [showPassword, setShowPassword] = useState({
    password: false,
    confirmPassword: false,
  });

  const { setConfirmDisabled, setError } = useModalController();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPassword((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  useEffect(() => {
    // Initial state handling
    if (!password.password && !password.confirmPassword) {
      setConfirmDisabled(true);
      setError(null);
      onSelect(null);
      return;
    }

    let currentError = null;
    let isDisabled = false;

    if (!password.password.trim()) {
      isDisabled = true;
      currentError = errorMsgs[0];
    } else if (!password.confirmPassword.trim()) {
      isDisabled = true;
      currentError = errorMsgs[1];
    } else if (password.password !== password.confirmPassword) {
      isDisabled = true;
      currentError = errorMsgs[2];
    }

    setConfirmDisabled(isDisabled);
    setError(currentError);
    onSelect(isDisabled ? null : password.password);

    setErrorObj({
      password: !password.password.trim() ? errorMsgs[0] : '',
      confirmPassword: !password.confirmPassword.trim()
        ? errorMsgs[1]
        : password.password !== password.confirmPassword
          ? errorMsgs[2]
          : '',
    });
  }, [password, setConfirmDisabled, setError, onSelect]);

  return (
    <Stack spacing="1rem">
      <TextField
        id="password"
        name="password"
        type={showPassword.password ? 'text' : 'password'}
        placeholder="Mot de passe"
        onChange={handleChange}
        variant="outlined"
        error={!!errorObj.password && password.password.length > 0}
        slotProps={{
          input: {
            endAdornment: password.password.trim().length > 0 && (
              <IconButton
                onClick={() =>
                  setShowPassword((prev) => ({
                    ...prev,
                    password: !prev.password,
                  }))
                }
              >
                {showPassword.password ? <VisibilityOff /> : <Visibility />}
              </IconButton>
            ),
          },
        }}
      />
      <TextField
        id="confirmPassword"
        name="confirmPassword"
        type={showPassword.confirmPassword ? 'text' : 'password'}
        placeholder="Confirmez votre mot de passe"
        onChange={handleChange}
        variant="outlined"
        error={
          !!errorObj.confirmPassword && password.confirmPassword.length > 0
        }
        slotProps={{
          input: {
            endAdornment: password.confirmPassword.trim().length > 0 && (
              <IconButton
                onClick={() =>
                  setShowPassword((prev) => ({
                    ...prev,
                    confirmPassword: !prev.confirmPassword,
                  }))
                }
              >
                {showPassword.confirmPassword ? (
                  <VisibilityOff />
                ) : (
                  <Visibility />
                )}
              </IconButton>
            ),
          },
        }}
      />
    </Stack>
  );
};
