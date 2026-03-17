import { Stack, TextField } from '@mui/material';
import { SyntheticEvent, useEffect, useState } from 'react';
import { useModalController } from '../../../hooks/useModalController';

interface CreateTeamModalContentProps {
  onSelect: (teamName: string | null) => void;
}

export const CreateTeamModalContent = ({
  onSelect,
}: CreateTeamModalContentProps) => {
  const [teamName, setTeamName] = useState('');
  const [localError, setLocalError] = useState<string | null>(null);
  const { setError, setConfirmDisabled } = useModalController();

  useEffect(() => {
    if (localError) return;

    if (teamName.trim().length > 0) {
      setConfirmDisabled(false);
      setError(null);
      onSelect(teamName.trim());
    } else {
      setConfirmDisabled(true);
      onSelect(null);
    }
  }, [teamName, localError, setConfirmDisabled, setError, onSelect]);

  const handleChange = (e: SyntheticEvent) => {
    const input = e.target as HTMLInputElement;
    setTeamName(input.value);

    // Clear validation errors on typing
    if (localError) setLocalError(null);
  };

  return (
    <Stack>
      <TextField
        id="teamName"
        name="teamName"
        placeholder="Nom de Team"
        onChange={handleChange}
        variant="outlined"
        error={!!localError}
        helperText={localError}
        autoFocus
      />
    </Stack>
  );
};
