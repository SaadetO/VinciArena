import {
  Box,
  Stack,
  Tab,
  Tabs,
  TextField,
  SxProps,
  Theme,
  Button,
  CircularProgress,
  Typography,
} from '@mui/material';
import {
  DatePicker,
  DateTimePicker,
  LocalizationProvider,
} from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';
import { useCallback, useEffect, useState } from 'react';
import { ArrowForward, ErrorOutline } from '@mui/icons-material';
import { TournamentDetailsInfoDto } from '../../../types';
import { useModalController } from '../../../hooks/useModalController';

// même theme de datePicker que unavailablities
const datePickerSx: SxProps<Theme> = {
  width: '100%',
  '& .MuiPickersInputBase-root': {
    borderRadius: '0.5rem',
    fontSize: '1rem',
  },
  '& .MuiButtonBase-root': {
    color: (theme) => theme.palette.text.secondary,
  },
};

interface TournamentModalContentProps {
  tournament?: TournamentDetailsInfoDto;
  formData: Partial<TournamentDetailsInfoDto>; // Add this
  setFormData: React.Dispatch<
    React.SetStateAction<Partial<TournamentDetailsInfoDto>>
  >;
  handleSave: () => void;
  isSubmitting: boolean;
  onClose: () => void;
}
export const TournamentModalContent = ({
  tournament,
  formData,
  setFormData,
  handleSave,
  isSubmitting,
  onClose,
}: TournamentModalContentProps) => {
  const [tabIndex, setTabIndex] = useState(0);
  const { setError } = useModalController();

  // 1. Wrap in useCallback to stabilize the function
  const calculateValidationError = useCallback(() => {
    const { registrationDeadline, startDate, endDate } = formData;
    if (!registrationDeadline || !startDate || !endDate) return null;

    const deadline = dayjs(registrationDeadline);
    const start = dayjs(startDate);
    const end = dayjs(endDate);
    const now = dayjs().startOf('day');

    if (deadline.isBefore(now))
      return 'La date limite ne peut pas être dans le passé.';
    if (start.isBefore(deadline))
      return 'Le début doit être après la date limite.';
    if (end.isBefore(start) || end.isSame(start))
      return 'La fin doit être après le début.';

    return null;
  }, [formData]); // Only changes when formData changes

  // 2. Sync with the Modal Controller
  useEffect(() => {
    const error = calculateValidationError();
    setError(error);

    return () => setError(null);
  }, [calculateValidationError, setError]); // Linter is now happy

  // 3. Define local variable for button locking
  const dateError = calculateValidationError();

  const handleChange = (
    field: keyof TournamentDetailsInfoDto,
    value: unknown,
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Stack spacing={4} sx={{ width: '100%' }}>
        <Tabs
          value={tabIndex}
          onChange={(_, v) => setTabIndex(v)}
          variant="fullWidth"
        >
          <Tab label="1. Informations" />
          <Tab label="2. Détails" />
        </Tabs>

        <Box sx={{ minHeight: '300px' }}>
          {tabIndex === 0 && (
            <Stack spacing={3}>
              <TextField
                label="Nom du Tournoi"
                value={formData.name || ''}
                onChange={(e) => handleChange('name', e.target.value)}
                fullWidth
              />
              <TextField
                label="Description"
                multiline
                rows={6}
                value={formData.description || ''}
                onChange={(e) => handleChange('description', e.target.value)}
                fullWidth
              />

              <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
                <Button onClick={onClose} sx={{ color: 'secondary' }}>
                  Annuler
                </Button>
                <Button
                  variant="contained"
                  onClick={() => setTabIndex(1)}
                  disabled={
                    !formData.name?.trim() || !formData.description?.trim()
                  }
                >
                  Continuer
                </Button>
              </Box>
            </Stack>
          )}

          {tabIndex === 1 && (
            <Stack spacing={4}>
              <DateTimePicker
                label="Date Limite d'Inscription"
                format="DD/MM/YYYY HH:mm"
                value={
                  formData.registrationDeadline
                    ? dayjs(formData.registrationDeadline)
                    : null
                }
                onChange={(date) =>
                  handleChange('registrationDeadline', date?.toISOString())
                }
                slotProps={{
                  textField: {
                    sx: datePickerSx,
                    inputProps: { readOnly: true },
                  },
                }}
                disablePast
              />

              <Stack direction="row" spacing={2} alignItems="center">
                <DatePicker
                  label="Début"
                  value={formData.startDate ? dayjs(formData.startDate) : null}
                  onChange={(date) =>
                    handleChange('startDate', date?.toISOString())
                  }
                  slotProps={{
                    textField: {
                      sx: datePickerSx,
                      inputProps: { readOnly: true },
                    },
                  }}
                  disablePast
                />
                <ArrowForward sx={{ color: 'text.secondary' }} />
                <DatePicker
                  label="Fin"
                  value={formData.endDate ? dayjs(formData.endDate) : null}
                  onChange={(date) =>
                    handleChange('endDate', date?.toISOString())
                  }
                  slotProps={{
                    textField: {
                      sx: datePickerSx,
                      inputProps: { readOnly: true },
                    },
                  }}
                  disablePast
                />
              </Stack>

              <TextField
                label="Capacité"
                type="number"
                value={formData.capacity ?? ''}
                onChange={(e) => {
                  const val = parseInt(e.target.value);
                  // On bloque à 2 minimum si l'utilisateur tape une valeur
                  if (!isNaN(val)) {
                    handleChange('capacity', Math.max(2, val));
                  }
                }}
                slotProps={{
                  htmlInput: {
                    min: 2, // Bloque les flèches du navigateur (step up/down) à 2
                  },
                }}
                fullWidth
              />

              {dateError && (
                <Stack direction="row" spacing={1.5} alignItems="center">
                  <ErrorOutline
                    sx={{
                      color: 'error.main',
                      fontSize: '20px', // Matches the size you had
                    }}
                  />
                  <Typography color="error" variant="body2">
                    {dateError}
                  </Typography>
                </Stack>
              )}

              <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
                <Button onClick={onClose} sx={{ color: 'secondary' }}>
                  Annuler
                </Button>
                <Button
                  variant="contained"
                  onClick={handleSave}
                  disabled={
                    isSubmitting || !formData.name?.trim() || !!dateError
                  }
                  sx={{ borderRadius: '30px', px: 4 }}
                >
                  {isSubmitting ? (
                    <CircularProgress size={24} />
                  ) : tournament ? (
                    'Enregistrer'
                  ) : (
                    'Créer'
                  )}
                </Button>
              </Box>
            </Stack>
          )}
        </Box>
      </Stack>
    </LocalizationProvider>
  );
};
