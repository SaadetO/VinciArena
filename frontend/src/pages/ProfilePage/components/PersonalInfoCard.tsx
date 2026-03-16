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
      close();
    } catch (err: unknown) {
      showSnackbar({
        message: err instanceof Error ? err.message : 'Une erreur est survenue.',
        severity: 'error',
      });
      // Not closing on error so user can correct it if needed, 
      // but if we want to mimic standard behavior we could close it or use `useModalController().setError`
      // Wait, inside here we do NOT have useModalController since we are in PersonalInfoCard.
      // We could close it on error, or just show snackbar. We will just show snackbar.
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
