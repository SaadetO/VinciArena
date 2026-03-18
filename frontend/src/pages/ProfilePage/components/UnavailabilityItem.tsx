import { IconButton, Skeleton, Stack, Tooltip, Typography } from '@mui/material';
import { formatDate, getDurationString } from '../../../utils/date';
import { ArrowForward, DeleteOutlined } from '@mui/icons-material';
import { useContext, useState } from 'react';
import { UserContext } from '../../../contexts/UserContext';
import dayjs from 'dayjs';
import { ProfileInfoDto } from '../../../types';
import { useSnackbar } from '../../../hooks/useSnackbar';

export const UnavailabilityItem = ({
  unavailability,
  setUser,
}: {
  unavailability: { id: number; startDate: string; endDate: string } | null;
  setUser: React.Dispatch<React.SetStateAction<ProfileInfoDto | undefined>>;
}) => {
  if (!unavailability) return (
    <Stack
      direction="row"
      spacing="0.375rem"
      alignItems="center"
      justifyContent="space-between"
      sx={{
        background: (theme) => theme.palette.background.s2,
        '&:last-of-type': {
          borderRadius: '0.375rem 0.375rem 0.75rem 0.75rem',
        },
        '&:first-of-type': {
          borderRadius: '0.75rem 0.75rem 0.375rem 0.375rem',
        },
        '&:only-of-type': {
          borderRadius: '0.75rem 0.75rem 0.75rem 0.75rem',
        },
      }}
      padding="0.375rem 0.5rem 0.375rem 1rem"
    >
      <Stack direction="row" alignItems="center" spacing="0.5rem">
        <Skeleton variant="text" width="5rem" height={22} />
        <Skeleton variant="circular" width="1rem" height="1rem" />
        <Skeleton variant="text" width="5rem" height={22} />
      </Stack>
      <Skeleton variant="rounded" sx={{ borderRadius: '0.375rem' }} width="2rem" height="2rem" />
    </Stack>
  );
  const { showSnackbar } = useSnackbar();
  const { authenticatedUser } = useContext(UserContext);
  const [loading, setLoading] = useState(false);
  const handleDelete = async () => {
    // Backup current state for rollback
    let previousUnavailabilities: {
      id: number;
      startDate: string;
      endDate: string;
    }[] = [];

    setUser((prev) => {
      if (!prev) return prev;
      previousUnavailabilities = prev.unavailabilities ?? [];
      return {
        ...prev,
        unavailabilities: (prev.unavailabilities ?? []).filter(
          (u) => u.id !== unavailability.id,
        ),
      };
    });

    try {
      setLoading(true);
      const response = await fetch(
        `/api/unavailabilities/${unavailability.id}`,
        {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
            Authorization: authenticatedUser?.token ?? '',
          },
        },
      );

      if (!response.ok) {
        throw new Error("Erreur lors de la suppression de l'indisponibilité.");
      }

      showSnackbar({
        message: 'Indisponibilité supprimée avec succès !',
        severity: 'success',
      });
    } catch (err: unknown) {
      // Rollback
      setUser((prev) =>
        prev ? { ...prev, unavailabilities: previousUnavailabilities } : prev,
      );
      showSnackbar({
        message:
          err instanceof Error ? err.message : 'Une erreur est survenue.',
        severity: 'error',
      });
    } finally {
      setLoading(false);
    }
  };
  return (
    <Stack
      direction="row"
      spacing="0.375rem"
      alignItems="center"
      justifyContent="space-between"
      sx={{
        background: (theme) => theme.palette.background.s2,
        '&:last-of-type': {
          borderRadius: '0.375rem 0.375rem 0.75rem 0.75rem',
        },
        '&:first-of-type': {
          borderRadius: '0.75rem 0.75rem 0.375rem 0.375rem',
        },
        '&:only-of-type': {
          borderRadius: '0.75rem 0.75rem 0.75rem 0.75rem',
        },
      }}
      padding="0.375rem 0.5rem 0.375rem 1rem"
      borderRadius="0.375rem"
    >
      <Tooltip
        title={getDurationString({
          startDate: dayjs(unavailability.startDate),
          endDate: dayjs(unavailability.endDate),
        })}
        arrow
        placement="right"
      >
        <Stack direction="row" alignItems="center" spacing="0.5rem">
          <Typography color="secondary" variant="body1">
            {formatDate(unavailability.startDate)}
          </Typography>
          <ArrowForward
            sx={{
              color: (theme) => theme.palette.text.secondary,
              width: '1rem',
              height: '1rem',
            }}
          />
          <Typography color="secondary" variant="body1">
            {formatDate(unavailability.endDate)}
          </Typography>
        </Stack>
      </Tooltip>
      <Tooltip
        title={
          unavailability.id < 0
            ? 'En cours de création...'
            : "Supprimer l'indisponibilité"
        }
        placement="left"
        arrow
      >
        <IconButton
          loading={loading || unavailability.id < 0}
          size="small"
          onClick={() => unavailability.id >= 0 && handleDelete()}
        >
          <DeleteOutlined
            sx={{
              color: (theme) =>
                loading || unavailability.id < 0
                  ? 'transparent'
                  : theme.palette.text.secondary,
            }}
          />
        </IconButton>
      </Tooltip>
    </Stack>
  );
};
