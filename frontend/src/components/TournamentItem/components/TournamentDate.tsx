import { Chip, Tooltip, Typography } from '@mui/material';
import { getFormattedDate } from '../../../utils/tournamentUtils';
import { DateRange } from '@mui/icons-material';

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
        {getFormattedDate(startDate, endDate, false)}
      </Typography>
    );
  }

  return (
    <Tooltip title="Date de début et de fin du tournoi" arrow>
      <Chip
        size="medium"
        variant="text"
        icon={<DateRange />}
        label={getFormattedDate(startDate, endDate)}
      />
    </Tooltip>
  );
};
