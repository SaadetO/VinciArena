import { Button, Skeleton, Stack, Typography } from '@mui/material';
import { ProfileInfoDto } from '../../../types';
import { Dispatch, SetStateAction, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserContext } from '../../../contexts/UserContext';

interface TeamCardProps {
  setOpen: Dispatch<SetStateAction<boolean>>;
  setOpenJoin: Dispatch<SetStateAction<boolean>>;
  user?: ProfileInfoDto;
  onQuitSuccess?: () => void;
  onError?: (errorMessage: string) => void;
}

export const TeamCard = ({
  setOpen,
  setOpenJoin,
  user,
  onQuitSuccess,
  onError,
}: TeamCardProps) => {
  const navigate = useNavigate();
  const { authenticatedUser } = useContext(UserContext);

  const handleQuit = async () => {
    try {
      const response = await fetch('/api/teams/quit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: authenticatedUser?.token ?? '',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to quit team');
      }

      if (onQuitSuccess) {
        onQuitSuccess();
      }
    } catch (err) {
      if (onError) {
        onError('Une erreur est survenue en quittant la team.');
      }
    }
  };

  return (
    <Stack
      sx={{ background: (theme) => theme.palette.background.s1 }}
      padding="1.25rem 1rem 1rem"
      borderRadius="0.5rem"
      spacing="1rem"
    >
      <Typography variant="h4" display="flex" alignItems="center" gap="0.5rem">
        Team{' '}
        {user ? (
          (user.team?.name ?? '')
        ) : (
          <Skeleton variant="rounded" height="1.25rem" width="5rem" />
        )}
      </Typography>

      <Stack spacing="0.75rem" direction="row">
        {user?.team ? (
          <>
            <Button
              onClick={() => navigate(`/teams/${user.team?.id}`)}
              variant="contained"
              color="secondary"
              fullWidth
            >
              voir {user.team.name}
            </Button>
            <Button
              variant="contained"
              color="secondary"
              fullWidth
              onClick={() => handleQuit()}
            >
              quitter {user.team.name}
            </Button>
          </>
        ) : (
          <>
            <Button
              onClick={() => setOpenJoin(true)}
              variant="contained"
              color="secondary"
              fullWidth
            >
              rejoindre une team
            </Button>
            <Button
              onClick={() => setOpen(true)}
              variant="contained"
              color="secondary"
              disabled={!user}
              fullWidth
            >
              créer une team
            </Button>
          </>
        )}
      </Stack>
    </Stack>
  );
};
