import {
  Box,
  Stack,
  Tab,
  Tabs,
  TextField,
  SxProps,
  Theme,
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
import { TournamentDto } from '../../../types';

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
  tournament?: TournamentDto;
  onDataChange: (data: Partial<TournamentDto> | null) => void;
}
export const TournamentModalContent = ({
  tournament,
  onDataChange,
}: TournamentModalContentProps) => {
  const [tabIndex, setTabIndex] = useState(0);

  // define default values for new tournament details
  const [formData, setFormData] = useState<Partial<TournamentDto>>({
    name: tournament?.name ?? '',
    description: tournament?.description ?? '',
    // suggest ideal number of teams
    nbMaxOfTeams: tournament?.nbMaxOfTeams ?? 16, // ideal number of teams

    // suggest dates 1 week apart
    registrationDeadline:
      tournament?.registrationDeadline ??
      dayjs().add(7, 'day').hour(20).minute(0o0).toISOString(),

    startDate: tournament?.startDate ?? dayjs().add(14, 'day').toISOString(),

    endDate: tournament?.endDate ?? dayjs().add(20, 'day').toISOString(),
  });

  useEffect(() => {
    onDataChange(formData);
  }, [formData, onDataChange]);

  const handleChange = (field: keyof TournamentDto, value: unknown) => {
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
            </Stack>
          )}

          {tabIndex === 1 && (
            <Stack spacing={4}>
              <DateTimePicker
                label="Date Limite d'Inscription"
                format="DD/MM/YYYY HH:mm"
                value={dayjs(formData.registrationDeadline)}
                onChange={(date) =>
                  handleChange('registrationDeadline', date?.toISOString())
                }
                slotProps={{ textField: { sx: datePickerSx } }}
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
                />
              </Stack>

              <TextField
                label="Capacité"
                type="number"
                value={formData.nbMaxOfTeams}
                onChange={(e) =>
                  handleChange('nbMaxOfTeams', parseInt(e.target.value))
                }
                fullWidth
              />
            </Stack>
          )}
        </Box>
      </Stack>
    </LocalizationProvider>
  );
};
