import { Typography } from '@mui/material';

export const Label = ({ label }: { label: string }) => (
  <Typography variant="h5" color="secondary" padding="0 0.375rem">
    {label}
  </Typography>
);
