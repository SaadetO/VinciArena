import { Alert, Stack, Tooltip } from '@mui/material';
import { TournamentFormData } from '../../../types';
import { DatePicker, DateTimePicker } from '@mui/x-date-pickers';
import { datePickerSx } from '../../../themes';
import { ArrowForward } from '@mui/icons-material';
import dayjs from 'dayjs';
import { getDurationString } from '../../../utils/date';
import { Label } from './Label';
import { NumericTextField } from './NumericTextField';

interface DetailsTabProps {
  formData: TournamentFormData;
  onChange: (field: keyof TournamentFormData, value: any) => void;
  error?: string;
}

export const DetailsTab = ({ formData, onChange, error }: DetailsTabProps) => {
  const handleDateChange = (
    date: dayjs.Dayjs | null,
    field: keyof TournamentFormData,
  ) => {
    if (!date) return;

    let newStart = dayjs(formData.startDate);
    let newEnd = dayjs(formData.endDate);
    let newReg = dayjs(formData.registrationDeadline);

    if (field === 'startDate') {
      newStart = date;
      if (newStart.isBefore(newReg) || newStart.isSame(newReg, 'day')) {
        newReg = newStart.subtract(3, 'day');
      }
      if (newStart.isAfter(newEnd) || newStart.isSame(newEnd, 'day')) {
        newEnd = newStart.add(14, 'day');
      }
    } else if (field === 'endDate') {
      newEnd = date;
      if (newEnd.isBefore(newStart) || newEnd.isSame(newStart, 'day')) {
        newStart = newEnd.subtract(14, 'day');
        if (newStart.isBefore(newReg) || newStart.isSame(newReg, 'day')) {
          newReg = newStart.subtract(3, 'day');
        }
      }
    } else if (field === 'registrationDeadline') {
      newReg = date;
      if (newReg.isAfter(newStart) || newReg.isSame(newStart, 'day')) {
        newStart = newReg.add(3, 'day');
        if (newStart.isAfter(newEnd) || newStart.isSame(newEnd, 'day')) {
          newEnd = newStart.add(14, 'day');
        }
      }
    }

    onChange('startDate', newStart.format('YYYY-MM-DD'));
    onChange('endDate', newEnd.format('YYYY-MM-DD'));
    onChange('registrationDeadline', newReg.format('YYYY-MM-DDTHH:mm:ss'));
  };

  return (
    <Stack spacing="0.75rem">
      <Stack spacing="0.25rem">
        <Label label="Date limite d'inscription" />
        <DateTimePicker
          format="DD/MM/YYYY HH:mm"
          name="registrationDeadline"
          sx={datePickerSx}
          value={dayjs(formData.registrationDeadline)}
          onChange={(date) => handleDateChange(date, 'registrationDeadline')}
          disablePast
        />
      </Stack>

      <Stack spacing="0.25rem">
        <Label label="Dates du tournoi" />
        <Stack direction="row" spacing="0.75rem" alignItems="center">
          <DatePicker
            format="DD/MM/YYYY"
            name="startDate"
            sx={datePickerSx}
            value={dayjs(formData.startDate)}
            onChange={(date) => handleDateChange(date, 'startDate')}
            disablePast
          />
          <Tooltip
            title={getDurationString({
              startDate: dayjs(formData.startDate),
              endDate: dayjs(formData.endDate),
            })}
            arrow
            placement="top"
          >
            <ArrowForward
              sx={{
                color: (theme) => theme.palette.text.secondary,
                cursor: 'help',
              }}
            />
          </Tooltip>
          <DatePicker
            format="DD/MM/YYYY"
            name="endDate"
            sx={datePickerSx}
            value={dayjs(formData.endDate)}
            onChange={(date) => handleDateChange(date, 'endDate')}
            disablePast
          />
        </Stack>
      </Stack>

      <Stack spacing="0.25rem">
        <Label label="Capacité maximale" />
        <NumericTextField
          value={formData.capacity}
          onChange={(val) => onChange('capacity', val)}
          min={2}
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
