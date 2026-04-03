import { Alert, Stack, TextField } from '@mui/material';
import { TournamentFormData } from '../../../types';
import { Label } from './Label';

interface BaseTabProps {
  formData: TournamentFormData;
  onChange: (field: keyof TournamentFormData, value: number | string) => void;
  error?: string;
}

export const BaseTab = ({ formData, onChange, error }: BaseTabProps) => {
  return (
    <Stack spacing="0.75rem">
      <Stack spacing="0.25rem">
        <Label label="Nom du tournoi" />
        <TextField
          placeholder="ex: Worlds 2026"
          required
          value={formData.name}
          onChange={(e) => onChange('name', e.target.value)}
        />
      </Stack>
      <Stack spacing="0.25rem">
        <Label label="Description" />
        <TextField
          placeholder="Décrivez votre tournoi"
          multiline
          rows={3}
          required
          value={formData.description}
          onChange={(e) => onChange('description', e.target.value)}
        />
      </Stack>
      {error && (
        <Alert severity="error" size="small">
          {error}
        </Alert>
      )}
    </Stack>
  );
};
