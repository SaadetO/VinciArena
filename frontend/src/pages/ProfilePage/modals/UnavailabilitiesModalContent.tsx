import { ArrowForward } from '@mui/icons-material';
import { Stack, Tooltip } from '@mui/material';
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';
import { Theme } from '@mui/material/styles';
import { useEffect, useState } from 'react';
import { checkOverlap, getDurationString } from '../../../utils/date';
import { useModalController } from '../../../hooks/useModalController';
import { datePickerSx } from '../../../themes';

interface UnavailabilitiesModalContentProps {
  unavailabilities: { id: number; startDate: string; endDate: string }[] | null;
  onSelect: (
    dates: {
      tempId: number;
      startDate: string;
      endDate: string;
    } | null,
  ) => void;
}

export const UnavailabilitiesModalContent = ({
  unavailabilities,
  onSelect,
}: UnavailabilitiesModalContentProps) => {
  const [dates, setDates] = useState({
    startDate: dayjs(Date.now()),
    endDate: dayjs(Date.now()).add(7, 'day'),
  });

  const { setError } = useModalController();

  useEffect(() => {
    let error = checkOverlap(dates.startDate, dates.endDate, unavailabilities);

    if (!dates.startDate.isValid() || !dates.endDate.isValid())
      error = 'Les dates doivent être valides.';

    if (dates.startDate.isBefore(dayjs(Date.now()).startOf('day')))
      error = 'La date de début doit être dans le futur.';

    setError(error);

    if (error) {
      onSelect(null);
      return;
    }

    onSelect({
      tempId: -Date.now(),
      startDate: dates.startDate.toISOString(),
      endDate: dates.endDate.toISOString(),
    });
  }, [dates, unavailabilities, setError, onSelect]);

  const handleDateChange = (
    date: dayjs.Dayjs | null,
    field: 'startDate' | 'endDate',
  ) => {
    if (!date) return;

    setDates((prevDates) => {
      const newDates = { ...prevDates, [field]: date };

      if (field === 'startDate' && date.isAfter(prevDates.endDate))
        newDates.endDate = date.add(7, 'day');
      else if (field === 'endDate' && date.isBefore(prevDates.startDate))
        newDates.startDate = date.subtract(7, 'day');

      if (
        field === 'startDate' &&
        newDates.startDate.isSame(newDates.endDate, 'day')
      )
        newDates.endDate = newDates.startDate.add(7, 'day');

      if (
        field === 'endDate' &&
        newDates.endDate.isSame(newDates.startDate, 'day')
      )
        newDates.startDate = newDates.endDate.subtract(7, 'day');

      return newDates;
    });
  };

  return (
    <Stack
      spacing="0.75rem"
      direction="row"
      alignItems="center"
      justifyContent="center"
    >
      <LocalizationProvider dateAdapter={AdapterDayjs}>
        <DatePicker
          autoFocus
          format="DD/MM/YYYY"
          name="startDate"
          sx={datePickerSx}
          value={dates.startDate}
          onChange={(date) => handleDateChange(date, 'startDate')}
          disablePast
        />
        <Tooltip title={getDurationString(dates)} arrow placement="top">
          <ArrowForward
            sx={{
              color: (theme: Theme) => theme.palette.text.secondary,
              cursor: 'help',
            }}
          />
        </Tooltip>
        <DatePicker
          format="DD/MM/YYYY"
          name="endDate"
          sx={datePickerSx}
          value={dates.endDate}
          onChange={(date) => handleDateChange(date, 'endDate')}
          disablePast
        />
      </LocalizationProvider>
    </Stack>
  );
};
