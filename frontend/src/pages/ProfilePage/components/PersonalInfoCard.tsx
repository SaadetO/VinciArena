import { Button, Skeleton, Stack, Typography } from '@mui/material';
import { ProfileInfoDto } from '../../../types';
import { AlternateEmail, Person } from '@mui/icons-material';
import { ReactNode } from 'react';

export const PersonalInfoCard = ({ user }: { user?: ProfileInfoDto }) => {
  const iconSx = { width: '1rem', height: '1rem' };
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
          data={user?.creation_date}
          skeletonWidth="15rem"
          icon={<Person sx={iconSx} />}
        />
      </Stack>
      <Button variant="contained" color="secondary" disabled={!user}>
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
  data?: string;
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
