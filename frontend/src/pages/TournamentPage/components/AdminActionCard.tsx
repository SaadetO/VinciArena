import { Button, Stack, Typography } from '@mui/material';
import { TournamentStatus } from '../../../types';

interface AdminActionCardProps {
  status: TournamentStatus;
  onAction: (status: TournamentStatus) => void;
}

export const AdminActionCard = ({ status, onAction }: AdminActionCardProps) => {
  const getStatusContent = () => {
    switch (status) {
      case 'IN_PREPARATION':
        return {
          title: 'Préparation du tournoi',
          description:
            "Le tournoi est actuellement en mode privé. Profitez de cet espace pour ajuster les derniers détails avant d'ouvrir les inscriptions.",
          buttonLabel: 'Publier le tournoi',
        };
      case 'REGISTRATION_CLOSED':
        return {
          title: 'Inscriptions closes',
          description:
            'Les inscriptions sont désormais closes. Il est temps de générer les matchs pour permettre aux joueurs de commencer leur préparation.',
          buttonLabel: 'Générer les matchs',
        };
      default:
        return null;
    }
  };

  const content = getStatusContent();

  if (!content) return null;

  return (
    <Stack
      sx={{
        background: (theme) => theme.palette.background.s1,
        borderRadius: '1.5rem',
      }}
    >
      <Typography
        variant="h4"
        color="text.primary"
        padding="1.25rem 1rem 0.5rem"
      >
        {content.title}
      </Typography>
      <Typography
        variant="body1"
        color="text.secondary"
        padding="0 1rem 0.5rem"
      >
        {content.description}
      </Typography>
      <Stack padding="1rem">
        <Button
          variant="contained"
          color="primary"
          onClick={() => onAction(status)}
        >
          {content.buttonLabel}
        </Button>
      </Stack>
    </Stack>
  );
};
