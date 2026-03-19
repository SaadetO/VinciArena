import { Button, Skeleton, Stack, Typography } from '@mui/material';
import { ProfileInfoDto } from '../../../types';
import { UnavailabilityItem } from './UnavailabilityItem';
import { memo } from 'react';
import { useModal } from '../../../hooks/useModal';
import { unavailabilitiesModal } from '../modals/unavailabilitiesModal';
import { useUnavailabilities } from '../../../hooks/useUnavailabilities';

export const UnavailabilitiesCard = memo(
  ({
    user,
    setUser,
  }: {
    user?: ProfileInfoDto;
    setUser: React.Dispatch<React.SetStateAction<ProfileInfoDto | undefined>>;
  }) => {
    const { openModal } = useModal();
    const { addUnavailability } = useUnavailabilities(setUser);

    const handleAddUnavailability = () => {
      let selectedDates: {
        tempId: number;
        startDate: string;
        endDate: string;
      } | null = null;

      const onSelect = (
        dates: {
          tempId: number;
          startDate: string;
          endDate: string;
        } | null,
      ) => {
        selectedDates = dates;
      };

      const onConfirm = (close: () => void) => {
        if (!selectedDates) return;
        close();
        addUnavailability(selectedDates);
      };

      openModal(
        unavailabilitiesModal({
          unavailabilities: user?.unavailabilities ?? [],
          onSelect,
          onConfirm,
        }),
      );
    };

    return (
      <Stack
        sx={{ background: (theme) => theme.palette.background.s1 }}
        padding="1.25rem 1rem 1rem"
        borderRadius="0.5rem"
        spacing="1rem"
      >
        <Typography variant="h4">Mes indisponibilités</Typography>
        <Stack spacing="0.24rem">
          {!user ? (
            [...Array(3)].map((_, i) => (
              <UnavailabilityItem
                key={i}
                unavailability={null}
                setUser={() => {}}
              />
            ))
          ) : user?.unavailabilities?.length === 0 ? (
            <Typography variant="h5" color="secondary">
              Aucune indisponibilité pour le moment
            </Typography>
          ) : (
            user?.unavailabilities?.map((unavailability) => (
              <UnavailabilityItem
                unavailability={unavailability}
                setUser={setUser}
                key={unavailability.id}
              />
            ))
          )}
        </Stack>
        {!user ? (
          <Skeleton
            variant="rounded"
            sx={{ borderRadius: '0.75rem' }}
            height="2rem"
            width="100%"
          />
        ) : (
          <Button
            variant="contained"
            color="secondary"
            onClick={handleAddUnavailability}
          >
            ajouter une indisponibilité
          </Button>
        )}
      </Stack>
    );
  },
);
