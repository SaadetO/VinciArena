import { Typography } from '@mui/material';

export const Label = ({
  label,
  mandatory,
}: {
  label: string;
  mandatory?: boolean;
}) => {
  return (
    <Typography
      variant="h5"
      color="secondary"
      padding="0 0.375rem"
      sx={{
        '&:after': {
          content: mandatory ? '"*"' : '""',
          color: 'error.secondary',
          marginLeft: '0.125rem',
        },
      }}
    >
      {label}
    </Typography>
  );
};
