import { Button, Skeleton, Stack, Typography } from '@mui/material';
import { ProfileInfoDto } from '../../../types';
import { AlternateEmail, Person } from '@mui/icons-material';
import { ReactNode, useContext } from 'react';
import { useModal } from '../../../hooks/useModal';
import { useSnackbar } from '../../../hooks/useSnackbar';
import { UserContext } from '../../../contexts/UserContext';
import { changePasswordModal } from '../modals/changePasswordModal';

interface PersonalInfoCardProps {
  user?: ProfileInfoDto;
}

export const PersonalInfoCard = ({ user }: PersonalInfoCardProps) => {
  const iconSx = { width: '1rem', height: '1rem' };
  const { openModal } = useModal();
  const { showSnackbar } = useSnackbar();
  const { authenticatedUser } = useContext(UserContext);

  const handlePasswordChange = () => {
    let selectedPassword: string | null = null;

    const onSelect = (pwd: string | null) => {
      selectedPassword = pwd;
    };

    const onConfirm = async (close: () => void) => {
      if (!selectedPassword) return;
      close();

      try {
        const response = await fetch('/api/members/me/password', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: authenticatedUser?.token ?? '',
          },
          body: JSON.stringify({ password: selectedPassword }),
        });

        if (!response.ok)
          throw new Error('Erreur lors de la mise à jour du mot de passe.');

        showSnackbar({
          message: 'Mot de passe modifié avec succès !',
          severity: 'success',
        });
      } catch (err: unknown) {
        showSnackbar({
          message:
            err instanceof Error ? err.message : 'Une erreur est survenue.',
          severity: 'error',
        });
      }
    };

    openModal(
      changePasswordModal({
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
        onClick={handlePasswordChange}
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
