import { Typography } from '@mui/material';
import { getFormattedDate } from '../../../utils/tournamentUtils';

interface TournamentDateProps {
  startDate: string;
  endDate: string;
}

export const TournamentDate = ({ startDate, endDate }: TournamentDateProps) => {
  return (
    <Typography variant="h5" color="text.secondary" flex={1}>
      {getFormattedDate(startDate, endDate)}
    </Typography>
  );
};
