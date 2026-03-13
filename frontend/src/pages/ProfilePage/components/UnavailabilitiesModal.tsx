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
import { useContext, useEffect, useRef, useState } from 'react';
import { UserContext } from '../../../contexts/UserContext';
import { checkOverlap, getDurationString } from '../../../utils/date';

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
  onSuccess: (data: {
    tempId: number;
    startDate: string;
    endDate: string;
  }) => void;
  onError: (errorMessage: string) => void;
  onIdResolved: (tempId: number, realId: number) => void;
  unavailabilities: { id: number; startDate: string; endDate: string }[] | null;
}

export const UnavailabilitiesModal = ({
  open,
  onClose,
  onSuccess,
  onError,
  onIdResolved,
  unavailabilities,
}: UnavailabilitiesModalProps) => {
  const { authenticatedUser } = useContext(UserContext);
  const [dates, setDates] = useState({
    startDate: dayjs(Date.now()),
    endDate: dayjs(Date.now()).add(7, 'day'),
  });

  const onIdResolvedRef = useRef(onIdResolved);
  onIdResolvedRef.current = onIdResolved;
  const [overlapError, setOverlapError] = useState<string | null>(null);

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

      const error = checkOverlap(
        newDates.startDate,
        newDates.endDate,
        unavailabilities,
      );
      setOverlapError(error);
      return newDates;
    });
  };

  const handleClose = () => {
    onClose();
  };

  const handleSubmit = async () => {
    const tempId = -Date.now();
    const submittedDates = {
      startDate: dates.startDate.toISOString(),
      endDate: dates.endDate.toISOString(),
    };

    onSuccess({ tempId, ...submittedDates });
    handleClose();

    try {
      const response = await fetch('/api/unavailabilities/me', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: authenticatedUser?.token ?? '',
        },
        body: JSON.stringify(submittedDates),
      });

      if (!response.ok) {
        throw new Error("Erreur lors de l'ajout de l'indisponibilité.");
      }

      const created = await response.json();
      onIdResolvedRef.current(tempId, created.idUnavailability);
    } catch (err: unknown) {
      onError(err instanceof Error ? err.message : 'Une erreur est survenue.');
    }
  };

  useEffect(() => {
    if (open) {
      const start = dayjs(Date.now());
      const end = dayjs(Date.now()).add(7, 'day');
      setDates({ startDate: start, endDate: end });
      const error = checkOverlap(start, end, unavailabilities);
      setOverlapError(error);
    }
  }, [open, unavailabilities]);
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
        {overlapError && (
          <Typography
            color="error"
            variant="body2"
            textAlign="center"
            padding="0.5rem 1rem 0"
          >
            {overlapError}
          </Typography>
        )}
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
        <Button
          variant="contained"
          onClick={handleSubmit}
          fullWidth
          disabled={!!overlapError}
        >
          Confirmer
        </Button>
      </DialogActions>
    </Dialog>
  );
};
