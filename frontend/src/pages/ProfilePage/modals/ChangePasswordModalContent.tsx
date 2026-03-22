import { Collapse, IconButton, Stack, TextField } from '@mui/material';
import { useEffect, useState } from 'react';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import { useModalController } from '../../../hooks/useModalController';
import { PasswordStrengthItem } from '../../../components/PasswordStrengthItem';
import { getPasswordRules } from '../../../utils/passwordRules';

interface PasswordData {
  password: string;
  confirmPassword: string;
}

const initPasswordData = (): PasswordData => ({
  password: '',
  confirmPassword: '',
});

export const ChangePasswordModalContent = ({
  onSelect,
}: {
  onSelect: (password: string | null) => void;
}) => {
  const [password, setPassword] = useState<PasswordData>(initPasswordData());
  const [showPassword, setShowPassword] = useState({
    password: false,
    confirmPassword: false,
  });
  const [isPasswordFocused, setIsPasswordFocused] = useState(false);

  const { setConfirmDisabled, setError } = useModalController();

  const isValid = getPasswordRules(password.password).every(
    (rule) => rule.valid,
  );

  const toggleShowPassword = (field: keyof typeof showPassword) => {
    setShowPassword((prev) => ({
      ...prev,
      [field]: !prev[field],
    }));
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPassword((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (name === 'password') {
      setPassword((prev) => ({
        ...prev,
        confirmPassword: '',
      }));
    }
  };

  useEffect(() => {
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
    } else if (!password.confirmPassword.trim()) {
      isDisabled = true;
    } else if (isValid && password.password !== password.confirmPassword) {
      isDisabled = true;
      currentError = 'Les mots de passe ne correspondent pas.';
    }

    setConfirmDisabled(isDisabled);
    setError(currentError);
    onSelect(isDisabled ? null : password.password);
  }, [password, setConfirmDisabled, setError, onSelect, isValid]);

  return (
    <Stack spacing="0.75rem">
      <Stack spacing="0.25rem">
        <TextField
          id="password"
          name="password"
          type={showPassword.password ? 'text' : 'password'}
          placeholder="Mot de passe"
          onChange={handleChange}
          onFocus={() => setIsPasswordFocused(true)}
          onBlur={() => setIsPasswordFocused(false)}
          variant="outlined"
          slotProps={{
            input: {
              endAdornment: password.password.trim().length > 0 && (
                <IconButton onClick={() => toggleShowPassword('password')}>
                  {showPassword.password ? <VisibilityOff /> : <Visibility />}
                </IconButton>
              ),
            },
          }}
        />

        <Collapse in={isPasswordFocused && password.password.length > 0}>
          <Stack>
            {!isValid ? (
              getPasswordRules(password.password).map((rule, index) => (
                <PasswordStrengthItem
                  key={index}
                  text={rule.label}
                  isValid={rule.valid}
                />
              ))
            ) : (
              <PasswordStrengthItem
                text="Mot de passe fort"
                isValid={true}
                crossText={false}
              />
            )}
          </Stack>
        </Collapse>
      </Stack>

      {isValid && (
        <TextField
          id="confirmPassword"
          name="confirmPassword"
          type={showPassword.confirmPassword ? 'text' : 'password'}
          placeholder="Confirmez votre mot de passe"
          onChange={handleChange}
          variant="outlined"
          slotProps={{
            input: {
              endAdornment: password.confirmPassword.trim().length > 0 && (
                <IconButton
                  onClick={() => toggleShowPassword('confirmPassword')}
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
      )}
    </Stack>
  );
};
