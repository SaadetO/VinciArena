import { Button, Stack, Typography } from '@mui/material';
import { ProfileInfoDto } from '../../../types';
import { UnavailabilityItem } from './UnavailabilityItem';

export const UnavailabilitiesCard = ({
  user,
  setUnavailabilitiesModal,
  onError,
  onSuccessDelete,
}: {
  user?: ProfileInfoDto;
  setUnavailabilitiesModal: (value: boolean) => void;
  onError: (errorMessage: string) => void;
  onSuccessDelete: (id: number) => void;
}) => {
  return (
    <Stack
      sx={{ background: (theme) => theme.palette.background.s1 }}
      padding="1.25rem 1rem 1rem"
      borderRadius="0.5rem"
      spacing="1rem"
    >
      <Typography variant="h4">Mes indisponibilités</Typography>
      <Stack
        spacing="0.24rem"
      >
        {user?.unavailabilities?.length === 0 ? (
          <Typography variant="h5" color="secondary">
            Aucune indisponibilité pour le moment
          </Typography>
        ) : (
          user?.unavailabilities?.map((unavailability, id) => (
            <UnavailabilityItem
              unavailability={unavailability}
              onError={onError}
              onSuccessDelete={onSuccessDelete}
              key={id}
            />
          ))
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
