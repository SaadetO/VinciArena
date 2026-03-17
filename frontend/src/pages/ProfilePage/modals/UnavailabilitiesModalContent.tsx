import { ArrowForward } from '@mui/icons-material';
import { Stack, SxProps, Tooltip } from '@mui/material';
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';
import { Theme } from '@mui/material/styles';
import { useEffect, useState } from 'react';
import { checkOverlap, getDurationString } from '../../../utils/date';
import { useModalController } from '../../../hooks/useModalController';

const datePickerSx: SxProps<Theme> = {
  '& .MuiPickersSectionList-root': {
    height: '3rem',
    padding: '0',
    alignItems: 'center',
  },
  '& .MuiPickersInputBase-root': {
    borderRadius: '0.5rem',
    fontSize: '1rem',
    letterSpacing: '0.25%',
  },
  '& .MuiButtonBase-root': {
    width: '2rem',
    height: '2rem',
    color: (theme: Theme) => theme.palette.text.secondary,
  },
  '& .MuiInputAdornment-root': {
    marginRight: '0.375rem',
  },
};

interface UnavailabilitiesModalContentProps {
  unavailabilities: { id: number; startDate: string; endDate: string }[] | null;
  onSelect: (dates: {
    tempId: number;
    startDate: string;
    endDate: string;
  }) => void;
}

export const UnavailabilitiesModalContent = ({
  unavailabilities,
  onSelect,
}: UnavailabilitiesModalContentProps) => {
  const [dates, setDates] = useState({
    startDate: dayjs(Date.now()),
    endDate: dayjs(Date.now()).add(7, 'day'),
  });

  const { setConfirmDisabled, setError } = useModalController();

  useEffect(() => {
    let error = checkOverlap(dates.startDate, dates.endDate, unavailabilities);

    if (!dates.startDate.isValid() || !dates.endDate.isValid())
      error = 'Les dates doivent être valides.';

    if (dates.startDate.isBefore(dayjs(Date.now()).startOf('day')))
      error = 'La date de début doit être dans le futur.';

    setError(error);
    setConfirmDisabled(!!error);

    if (error) return;

    onSelect({
      tempId: -Date.now(),
      startDate: dates.startDate.toISOString(),
      endDate: dates.endDate.toISOString(),
    });
  }, [dates, unavailabilities, setError, setConfirmDisabled, onSelect]);

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
      spacing="1rem"
      direction="row"
      alignItems="center"
      justifyContent="center"
    >
      <LocalizationProvider dateAdapter={AdapterDayjs}>
        <DatePicker
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
