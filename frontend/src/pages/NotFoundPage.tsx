import { ArrowBack } from '@mui/icons-material';
import { Button, Stack, Typography } from '@mui/material';
import { Link } from 'react-router-dom';

export const NotFoundPage = ({
  error,
}: {
  error: { code: number; message: string; subtitle?: string };
}) => {
  return (
    <Stack
      spacing="0.75rem"
      alignItems="center"
      flex={1}
      justifyContent="center"
    >
      <Typography
        variant="h1"
        textAlign="center"
        fontSize="20rem"
        lineHeight="1"
      >
        {error.code}
      </Typography>
      <Typography variant="h2">{error.message}</Typography>
      <Typography variant="h5" color="secondary" paddingBottom="2rem">
        {error.subtitle}
      </Typography>
      <Link to="/">
        <Button startIcon={<ArrowBack />} variant="contained" color="secondary">
          Retour en lieu sûr
        </Button>
      </Link>
    </Stack>
  );
};
