import {
  Box,
  Stack,
  TextField,
  SxProps,
  Theme,
  Button,
  CircularProgress,
  IconButton,
  InputAdornment,
  Alert,
} from '@mui/material';
import { Tabs } from '../../../components/Tabs';
import {
  DatePicker,
  DateTimePicker,
  LocalizationProvider,
} from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';
import { useCallback, useState } from 'react';
import { Add, ArrowForward, Remove } from '@mui/icons-material';
import { TournamentDetailsInfoDto } from '../../../types';

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
  }, [formData]);

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
          options={[
            { label: 'Informations', value: 0 },
            { label: 'Détails', value: 1 },
          ]}
          value={tabIndex}
          onChange={(v) => setTabIndex(v)}
          fullWidth
        />
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
                  handleChange(
                    'registrationDeadline',
                    date?.format('YYYY-MM-DDTHH:mm:ss'),
                  )
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
                  format="DD/MM/YYYY"
                  value={formData.startDate ? dayjs(formData.startDate) : null}
                  onChange={(date) =>
                    handleChange('startDate', date?.format('YYYY-MM-DD'))
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
                  format="DD/MM/YYYY"
                  value={formData.endDate ? dayjs(formData.endDate) : null}
                  onChange={(date) =>
                    handleChange('endDate', date?.format('YYYY-MM-DD'))
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
                  handleChange('capacity', isNaN(val) ? 2 : Math.max(2, val));
                }}
                fullWidth
                sx={{
                  // hide default buttons : chrome, etc
                  '& input::-webkit-outer-spin-button, & input::-webkit-inner-spin-button':
                    {
                      display: 'none',
                    },
                  // hide default buttons : firefox
                  '& input[type=number]': {
                    MozAppearance: 'textfield',
                  },
                  '& .MuiInputBase-root': {
                    borderRadius: '0.5rem',
                  },
                }}
                // custom buttons with - and +
                slotProps={{
                  input: {
                    endAdornment: (
                      <InputAdornment position="end">
                        <Stack direction="row" spacing={0.5}>
                          {/* minus sign configuration*/}
                          <IconButton
                            size="small"
                            onClick={() =>
                              handleChange(
                                'capacity',
                                Math.max(2, (formData.capacity || 2) - 1), // decrements down to 2
                              )
                            }
                            sx={{ color: 'text.secondary' }}
                          >
                            <Remove fontSize="small"></Remove>
                          </IconButton>

                          <IconButton
                            size="small"
                            onClick={() =>
                              handleChange(
                                'capacity',
                                (formData.capacity || 2) + 1, // increments
                              )
                            }
                            sx={{ color: 'text.secondary' }}
                          >
                            <Add fontSize="small" />
                          </IconButton>
                        </Stack>
                      </InputAdornment>
                    ),
                  },
                }}
              />

              {dateError && (
                <Stack padding="0 1rem 1rem">
                  <Alert
                    sx={{ backgroundColor: '#180F0F !important' }}
                    severity="error"
                    size="small"
                    align="center"
                  >
                    {dateError}
                  </Alert>
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
