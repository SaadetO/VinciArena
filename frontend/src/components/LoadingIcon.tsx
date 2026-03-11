import { CircularProgress, Box } from '@mui/material';

export const LoadingIcon = () => {
  return (
    <Box sx={{ display: 'flex', justifyContent: 'center', mt: 5 }}>
      <CircularProgress color="secondary" />
    </Box>
  );
};
