import { Button, Skeleton, Stack, Typography } from '@mui/material';
import { ProfileInfoDto } from '../../../types';
import { AlternateEmail, Person } from '@mui/icons-material';
import { ReactNode, useContext, useRef } from 'react';
import { useModal } from '../../../hooks/useModal';
import { useSnackbar } from '../../../hooks/useSnackbar';
import { UserContext } from '../../../contexts/UserContext';
import { changePasswordModal } from '../modals/changePasswordModal';

interface PersonalInfoCardProps {
  user?: ProfileInfoDto;
}

export const PersonalInfoCard = ({
  user,
}: PersonalInfoCardProps) => {
  const iconSx = { width: '1rem', height: '1rem' };
  const { openModal } = useModal();
  const { showSnackbar } = useSnackbar();
  const { authenticatedUser } = useContext(UserContext);
  const selectedPasswordRef = useRef<string | null>(null);

  const handleConfirmPassword = async (close: () => void) => {
    const pwd = selectedPasswordRef.current;
    if (!pwd) return;

    close();

    try {
      const response = await fetch('/api/members/me/password', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: authenticatedUser?.token ?? '',
        },
        body: JSON.stringify({ password: pwd }),
      });

      if (!response.ok)
        throw new Error('Erreur lors de la mise à jour du mot de passe.');

      showSnackbar({
        message: 'Mot de passe modifié avec succès !',
        severity: 'success',
      });
    } catch (err: unknown) {
      showSnackbar({
        message: err instanceof Error ? err.message : 'Une erreur est survenue.',
        severity: 'error',
      });
    }
  };
  return (
    <Stack
      sx={{ background: (theme) => theme.palette.background.s1 }}
      padding="1.25rem 1rem 1rem"
      borderRadius="0.5rem"
      spacing="1rem"
    >
      <Typography variant="h4">Informations Personnelles</Typography>
      <Stack spacing="0.75rem">
        <DataField data={user?.email} icon={<AlternateEmail sx={iconSx} />} />
        <DataField
          data={user?.creationDate}
          skeletonWidth="15rem"
          icon={<Person sx={iconSx} />}
        />
      </Stack>
      <Button
        variant="contained"
        color="secondary"
        disabled={!user}
        onClick={() => {
          selectedPasswordRef.current = null;
          openModal(
            changePasswordModal({
              onSelect: (pwd) => (selectedPasswordRef.current = pwd),
              onConfirm: handleConfirmPassword,
            }),
          );
        }}
      >
        modifier mon mot de passe
      </Button>
    </Stack>
  );
};

const DataField = ({
  data,
  skeletonWidth,
  icon,
}: {
  data?: string | null;
  skeletonWidth?: string;
  icon: ReactNode;
}) => {
  if (!data)
    return (
      <Skeleton
        variant="rounded"
        width={skeletonWidth ?? '12rem'}
        height="1.25rem"
      />
    );
  return (
    <Stack
      direction="row"
      alignItems="center"
      spacing="0.5rem"
      color={(theme) => theme.palette.text.secondary}
    >
      {icon}
      <Typography variant="h5" color="secondary">
        {data}
      </Typography>
    </Stack>
  );
};
