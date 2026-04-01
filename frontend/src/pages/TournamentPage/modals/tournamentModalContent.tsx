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
} from '@mui/material';
import {
  DatePicker,
  DateTimePicker,
  LocalizationProvider,
} from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';
import { useEffect, useState } from 'react';
import { ArrowForward } from '@mui/icons-material';
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
  onDataChange: (data: Partial<TournamentDetailsInfoDto> | null) => void;
  handleSave: () => void;
  isSubmitting: boolean;
  onClose: () => void;
}
export const TournamentModalContent = ({
  tournament,
  onDataChange,
  handleSave,
  isSubmitting,
  onClose,
}: TournamentModalContentProps) => {
  const [tabIndex, setTabIndex] = useState(0);

  // default values
  const [formData, setFormData] = useState<Partial<TournamentDetailsInfoDto>>({
    name: tournament?.name ?? '',
    description: tournament?.description ?? '',
    capacity: tournament?.capacity ?? 16,
    status: tournament?.status ?? 'IN_PREPARATION',
    registrationDeadline:
      tournament?.registrationDeadline ??
      dayjs()
        .add(7, 'day')
        .hour(20)
        .minute(0)
        .second(0)
        .format('YYYY-MM-DDTHH:mm:ss'),
    startDate:
      tournament?.startDate ?? dayjs().add(14, 'day').format('YYYY-MM-DD'),
    endDate: tournament?.endDate ?? dayjs().add(20, 'day').format('YYYY-MM-DD'),
  });
  // insert data recovered from the backend for modification mode
  useEffect(() => {
    if (tournament && tournament.idTournament) {
      setFormData({
        name: tournament.name ?? '',
        description: tournament.description ?? '',
        capacity: tournament.capacity,
        status: tournament.status,
        registrationDeadline: tournament.registrationDeadline,
        startDate: tournament.startDate,
        endDate: tournament.endDate,
      });
    }
  }, [tournament]);
  useEffect(() => {
    onDataChange(formData);
  }, [formData, onDataChange]);

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
          sx={{ borderBottom: 1, borderColor: 'divider' }}
        >
          <Tab label="1. Informations" />
          <Tab label="2. Détails" />
        </Tabs>

        <Box sx={{ minHeight: '300px' }}>
          {tabIndex === 0 && (
            <Stack spacing={3}>
              <TextField
                label="Nom du Tournoi"
                value={formData.name}
                onChange={(e) => handleChange('name', e.target.value)}
                fullWidth
              />
              <TextField
                label="Description"
                multiline
                rows={6}
                value={formData.description}
                onChange={(e) => handleChange('description', e.target.value)}
                fullWidth
              />
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'flex-end',
                  gap: 2,
                  mt: 'auto',
                  pt: 2,
                }}
              >
                <Button onClick={onClose} sx={{ color: 'secondary' }}>
                  Annuler
                </Button>
                <Button
                  variant="contained"
                  onClick={() => setTabIndex(1)}
                  disabled={
                    !formData.name?.trim() || !formData.description?.trim()
                  }
                  sx={{
                    borderRadius: '30px',
                    px: 4,
                    backgroundColor: 'primary',
                  }}
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
                    date ? date.format('YYYY-MM-DDTHH:mm:ss') : null,
                  )
                }
                slotProps={{ textField: { sx: datePickerSx } }}
                disablePast
              />
              <Stack direction="row" spacing={2} alignItems="center">
                <DatePicker
                  label="Début"
                  format="DD/MM/YYYY"
                  value={dayjs(formData.startDate)}
                  onChange={(date) =>
                    handleChange('startDate', date?.toISOString())
                  }
                  slotProps={{ textField: { sx: datePickerSx } }}
                  disablePast
                />

                <ArrowForward sx={{ color: 'text.secondary' }} />

                <DatePicker
                  label="Fin"
                  format="DD/MM/YYYY"
                  value={dayjs(formData.endDate)}
                  onChange={(date) =>
                    handleChange('endDate', date?.toISOString())
                  }
                  slotProps={{ textField: { sx: datePickerSx } }}
                  disablePast
                />
              </Stack>

              <TextField
                label="Capacité"
                type="number"
                value={formData.capacity ?? ''}
                onChange={(e) =>
                  handleChange('capacity', parseInt(e.target.value) || 0)
                }
                fullWidth
              />
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'flex-end',
                  gap: 2,
                  mt: 'auto',
                  pt: 2,
                }}
              >
                <Button onClick={onClose} sx={{ color: 'secondary' }}>
                  Annuler
                </Button>
                <Button
                  variant="contained"
                  onClick={handleSave}
                  disabled={
                    isSubmitting ||
                    !formData.name?.trim() ||
                    !formData.description?.trim()
                  }
                  sx={{
                    borderRadius: '30px',
                    px: 4,
                    backgroundColor: 'primary',
                  }}
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
