import { Button, Stack, Typography } from '@mui/material';
import { ProfileInfoDto } from '../../../types';

export const UnavailabilitiesCard = ({
  user,
  setUnavailabilitiesModal,
}: {
  user?: ProfileInfoDto;
  setUnavailabilitiesModal: (value: boolean) => void;
}) => {
  return (
    <Stack
      sx={{ background: (theme) => theme.palette.background.s1 }}
      padding="1.25rem 1rem 1rem"
      borderRadius="0.5rem"
      spacing="1rem"
    >
      <Typography variant="h4">Mes indisponibilités</Typography>
      <Stack spacing="0.75rem">
        {user?.unavailabilities?.length === 0 ? (
          <Typography variant="h5" color="secondary">
            Aucune indisponibilité pour le moment
          </Typography>
        ) : (
          // unavailabilities.map((unavailability) => (
          //   <Typography key={unavailability.id} variant="body1">
          //     {unavailability.date}
          //   </Typography>
          // ))
          <p>placeholder</p>
        )}
      </Stack>
      <Button
        variant="contained"
        color="secondary"
        disabled={!user}
        onClick={() => setUnavailabilitiesModal(true)}
      >
        ajouter une indisponibilité
      </Button>
    </Stack>
  );
};
