import { Chip, Typography } from '@mui/material';
import { getFormattedDate } from '../../../utils/tournamentUtils';
import { CalendarToday } from '@mui/icons-material';

interface TournamentDateProps {
  startDate: string;
  endDate: string;
  component?: 'Typography' | 'Chip';
}

export const TournamentDate = ({
  startDate,
  endDate,
  component = 'Typography',
}: TournamentDateProps) => {
  if (component === 'Typography') {
    return (
      <Typography variant="h5" color="text.secondary" flex={1}>
        {getFormattedDate(startDate, endDate)}
      </Typography>
    );
  }

  return (
    <Chip
      size="medium"
      variant="text"
      icon={<CalendarToday />}
      label={getFormattedDate(startDate, endDate)}
    />
  );
};
