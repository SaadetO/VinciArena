import { Button, Skeleton, Stack, Typography } from '@mui/material';
import { ProfileInfoDto } from '../../../types';
import { UnavailabilityItem } from './UnavailabilityItem';
import { useContext, memo } from 'react';
import { UserContext } from '../../../contexts/UserContext';
import { useModal } from '../../../hooks/useModal';
import { useSnackbar } from '../../../hooks/useSnackbar';
import { unavailabilitiesModal } from '../modals/unavailabilitiesModal';

export const UnavailabilitiesCard = memo(
  ({
    user,
    setUser,
  }: {
    user?: ProfileInfoDto;
    setUser: React.Dispatch<React.SetStateAction<ProfileInfoDto | undefined>>;
  }) => {
    const { authenticatedUser } = useContext(UserContext);
    const { openModal } = useModal();
    const { showSnackbar } = useSnackbar();

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

      const onConfirm = async (close: () => void) => {
        if (!selectedDates) return;
        close();

        const { tempId, startDate, endDate } = selectedDates;

        // Update UI optimistically
        setUser((prev) => {
          if (!prev) return prev;
          return {
            ...prev,
            unavailabilities: [
              ...(prev.unavailabilities ?? []),
              { id: tempId, startDate, endDate },
            ],
          };
        });

        try {
          const response = await fetch('/api/unavailabilities/me', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: authenticatedUser?.token ?? '',
            },
            body: JSON.stringify({
              startDate,
              endDate,
            }),
          });

          if (!response.ok) {
            throw new Error("Erreur lors de l'ajout de l'indisponibilité.");
          }

          const created = await response.json();

          // Resolve the ID
          setUser((prev) => {
            if (!prev) return prev;
            return {
              ...prev,
              unavailabilities: (prev.unavailabilities ?? []).map((u) =>
                u.id === tempId ? { ...u, id: created.idUnavailability } : u,
              ),
            };
          });

          showSnackbar({
            message: 'Indisponibilité ajoutée avec succès !',
            severity: 'success',
          });
        } catch (err: unknown) {
          showSnackbar({
            message:
              err instanceof Error ? err.message : 'Une erreur est survenue.',
            severity: 'error',
          });
          // Rollback
          setUser((prev) => {
            if (!prev) return prev;
            return {
              ...prev,
              unavailabilities: (prev.unavailabilities ?? []).filter(
                (u) => u.id !== tempId,
              ),
            };
          });
        }
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
