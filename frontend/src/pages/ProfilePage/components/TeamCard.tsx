import { Button, Skeleton, Stack, Typography } from '@mui/material';
import { ProfileInfoDto } from '../../../types';

export const TeamCard = ({ user }: { user?: ProfileInfoDto }) => {
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
            {/* future itération : ajouter bouton "voir page de team" */}
            <Button
              variant="contained"
              color="secondary"
              fullWidth
              disabled={true} //future issue
            >
              quitter {user.team.name}
            </Button>
          </>
        ) : (
          <>
            <Button
              variant="contained"
              color="secondary"
              disabled={true} //future issue
              fullWidth
            >
              rejoindre une team
            </Button>
            <Button
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

      {user?.team?.isManager && (
        <Stack spacing="0.75rem">
          {/* Future itération : ajouter bouton "renoncer à son rôle" */}
          <Button
            variant="contained"
            color="secondary"
            fullWidth
            disabled={true} //future issue
          >
            désigner un responsable
          </Button>
        </Stack>
      )}
    </Stack>
  );
};
