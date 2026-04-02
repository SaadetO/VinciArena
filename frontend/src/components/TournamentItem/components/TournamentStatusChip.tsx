import { Chip, ChipProps } from '@mui/material';
import { TournamentDto } from '../../../types';

interface TournamentStatusChipProps {
  status: TournamentDto['tournamentStatus'];
}

export const TournamentStatusChip = ({ status }: TournamentStatusChipProps) => {
  let label = '';
  let color: ChipProps['color'] = 'secondary';

  switch (status) {
    case 'REGISTRATION_OPEN':
      label = 'Inscriptions';
      color = 'primary';
      break;
    case 'IN_PROGRESS':
      label = 'En cours';
      color = 'success';
      break;
    case 'DONE':
      label = 'Fini';
      break;
    case 'IN_PREPARATION':
      label = 'En préparation';
      break;
    case 'REGISTRATION_CLOSED':
      label = 'Inscriptions closes';
      color = 'warning';
      break;
    case 'PLANNED':
      label = 'Planifié';
      color = 'primary';
      break;
    case 'CANCELLED':
      label = 'Annulé';
      break;
    default:
      label = status;
      break;
  }

  return <Chip label={label} color={color} size="small" />;
};
