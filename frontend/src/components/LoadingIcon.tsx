import { CircularProgress, Box } from '@mui/material';

export const LoadingIcon = () => {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        flex: 1,
        width: '100%',
      }}
    >
      <CircularProgress />
    </Box>
  );
};
