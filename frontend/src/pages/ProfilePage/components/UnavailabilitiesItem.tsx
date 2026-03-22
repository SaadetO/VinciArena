import { IconButton, Stack, Typography, Tooltip } from '@mui/material';
import { Add } from '@mui/icons-material';
import { memo } from 'react';
import { ProfileInfoDto } from '../../../types';
import { UnavailabilityItem } from './UnavailabilityItem';
import { useModal } from '../../../hooks/useModal';
import { unavailabilitiesModal } from '../modals/unavailabilitiesModal';
import { useUnavailabilities } from '../../../hooks/useUnavailabilities';

export const UnavailabilitiesItem = memo(
  ({
    user,
    setUser,
  }: {
    user?: ProfileInfoDto;
    setUser: React.Dispatch<React.SetStateAction<ProfileInfoDto | undefined>>;
  }) => {
    const { openModal } = useModal();
    const { addUnavailability } = useUnavailabilities({ setUser });

    const handleAddUnavailability = () => {
      let selectedDates: {
        tempId: number;
        startDate: string;
        endDate: string;
      } | null = null;
      const onSelect = (
        dates: { tempId: number; startDate: string; endDate: string } | null,
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
      <Stack>
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
          padding="1.5rem 0 1rem"
        >
          <Typography variant="h4">Indisponibilités</Typography>
          <Tooltip title="Ajouter une indisponibilité" placement="bottom" arrow>
            <IconButton
              onClick={handleAddUnavailability}
              size="small"
              color="secondary"
            >
              <Add />
            </IconButton>
          </Tooltip>
        </Stack>
        <Stack px="0.25rem">
          {!user ? (
            Array.from({ length: 3 }).map((_, index) => (
              <UnavailabilityItem key={index} setUser={() => {}} />
            ))
          ) : user.unavailabilities?.length === 0 ? (
            <Stack
              width="100%"
              alignItems="center"
              padding="1rem"
              sx={{
                background: (theme) => theme.palette.background.s2,
              }}
              borderRadius="0.75rem"
            >
              <Typography variant="h5" color="text.secondary">
                Aucune indisponibilité pour le moment
              </Typography>
            </Stack>
          ) : (
            user.unavailabilities?.map((unavailability) => (
              <UnavailabilityItem
                unavailability={unavailability}
                setUser={setUser}
                key={unavailability.id}
              />
            ))
          )}
        </Stack>
      </Stack>
    );
  },
);
