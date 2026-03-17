import {
  Avatar,
  Stack,
  Typography,
  Skeleton,
  Chip,
  Button,
} from '@mui/material';
import { ProfileInfoDto, TeamDetailsInfoDto } from '../../../types';
import { Link } from 'react-router-dom';
import { useContext } from 'react';
import { UserContext } from '../../../contexts/UserContext';
import { useModal } from '../../../hooks/useModal';
import { useSnackbar } from '../../../hooks/useSnackbar';
import { managerModal } from '../modals/managerModal';

export const ManagerCard = ({
  team,
  setTeam,
}: {
  team?: TeamDetailsInfoDto;
  setTeam: React.Dispatch<React.SetStateAction<TeamDetailsInfoDto | undefined>>;
}) => {
  const { authenticatedUser } = useContext(UserContext);
  const { openModal } = useModal();
  const { showSnackbar } = useSnackbar();
  return (
    <>
      <Stack
        sx={{ background: (theme) => theme.palette.background.s1 }}
        padding="1.25rem 1rem 1rem"
        borderRadius="0.5rem"
        spacing="1rem"
      >
        <Typography variant="h4">Responsables</Typography>
        <Stack spacing="0.75rem" direction="row" flexWrap="wrap">
          {team ? (
            team.managers.map((manager) => (
              <Chip
                sx={{
                  cursor: 'pointer',
                  '&:hover': {
                    background: (theme) => theme.palette.background.s4,
                  },
                  textTransform: 'none',
                }}
                key={manager.id}
                component={Link}
                to={`/users/${manager.id}`}
                label={manager.tag}
                avatar={<Avatar src={`/assets/avatars/${manager.avatar}`} />}
                variant={
                  manager.id === authenticatedUser?.id ? 'active' : 'filled'
                }
              />
            ))
          ) : (
            <>
              {[1, 2].map((i) => (
                <Stack
                  key={i}
                  direction="row"
                  spacing="0.75rem"
                  alignItems="center"
                >
                  <Skeleton variant="circular" width="2rem" height="2rem" />
                  <Skeleton width="8rem" />
                </Stack>
              ))}
            </>
          )}
        </Stack>
        {team?.managers?.length &&
          team.managers.length < 2 &&
          team.managers.some(
            (manager) => manager.id === authenticatedUser?.id,
          ) && (
            <Button
              variant="contained"
              color="secondary"
              onClick={() => {
                let selectedManager: ProfileInfoDto | null = null;
                openModal(
                  managerModal({
                    team,
                    onSelect: (user) => {
                      selectedManager = user;
                    },
                    onConfirm: async (close) => {
                      if (!selectedManager) return;
                      close();

                      try {
                        const response = await fetch(
                          `/api/teams/${team?.idTeam}/manager/${selectedManager.id}`,
                          {
                            method: 'PUT',
                            headers: {
                              'Content-Type': 'application/json',
                              Authorization: authenticatedUser?.token ?? '',
                            },
                          },
                        );
                  
                        if (!response.ok) {
                          throw new Error('Failed to promote user');
                        }
                  
                        setTeam((prev) =>
                          prev
                            ? {
                                ...prev,
                                managers: [...prev.managers, selectedManager!],
                              }
                            : undefined,
                        );
                        
                        showSnackbar({
                          message: 'Utilisateur promu manager avec succès !',
                          severity: 'success',
                        });
                      } catch (err: unknown) {
                        const errMsg = err instanceof Error ? err.message : 'Une erreur est survenue';
                        showSnackbar({
                          message: errMsg,
                          severity: 'error',
                        });
                      }
                    },
                  })
                );
              }}
            >
              Désigner un responsable
            </Button>
          )}
      </Stack>
    </>
  );
};
