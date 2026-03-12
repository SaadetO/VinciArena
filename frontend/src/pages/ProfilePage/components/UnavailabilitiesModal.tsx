import { ArrowForward } from '@mui/icons-material';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
  SxProps,
  Tooltip,
  Typography,
} from '@mui/material';
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';
import { Theme } from '@mui/material/styles';
import { useEffect, useState } from 'react';

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

interface UnavailabilitiesModalProps {
  open: boolean;
  onClose: () => void;
}

export const UnavailabilitiesModal = ({
  open,
  onClose,
}: UnavailabilitiesModalProps) => {
  const [dates, setDates] = useState({
    startDate: dayjs(Date.now()),
    endDate: dayjs(Date.now()).add(7, 'day'),
  });

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

      return newDates;
    });
  };

  const getDurationString = () => {
    const diffInDays = dates.endDate.diff(dates.startDate, 'day');
    if (diffInDays < 0) return '';
    const weeks = Math.floor(diffInDays / 7);
    const days = diffInDays % 7;

    const parts = [];
    if (weeks > 0) parts.push(`${weeks} semaine${weeks > 1 ? 's' : ''}`);
    if (days > 0) parts.push(`${days} jour${days > 1 ? 's' : ''}`);

    return parts.length > 0 ? parts.join(', ') : '0 jours';
  };

  const handleClose = () => {
    onClose();
  };

  const handleSubmit = () => {
    console.log({
      startDate: dates.startDate.toISOString(),
      endDate: dates.endDate.toISOString(),
    });
    handleClose();
  };

  useEffect(() => {
    open &&
      setDates({
        startDate: dayjs(Date.now()),
        endDate: dayjs(Date.now()).add(7, 'day'),
      });
  }, [open]);
  return (
    <Dialog
      open={open}
      onClose={handleClose}
      onKeyUp={(e) => e.key === 'Enter' && handleSubmit()}
    >
      <DialogTitle variant="h2">Ajouter une indisponibilité</DialogTitle>
      <Typography textAlign="center" padding="0 2rem 1rem" color="secondary">
        Ajoutez une indisponibilité en complétant les champs ci-dessous
      </Typography>
      <DialogContent>
        <Stack spacing="1rem" direction="row" alignItems="center">
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <DatePicker
              format="DD/MM/YYYY"
              name="startDate"
              sx={datePickerSx}
              value={dates.startDate}
              onChange={(date) => handleDateChange(date, 'startDate')}
              disablePast
            />
            <Tooltip title={getDurationString()} arrow placement="top">
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
      </DialogContent>
      <DialogActions>
        <Button
          variant="contained"
          color="secondary"
          onClick={handleClose}
          fullWidth
        >
          Annuler
        </Button>
        <Button variant="contained" onClick={handleSubmit} fullWidth>
          Confirmer
        </Button>
      </DialogActions>
    </Dialog>
  );
};
