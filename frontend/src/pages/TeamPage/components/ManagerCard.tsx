import {
  Avatar,
  Stack,
  Typography,
  Skeleton,
  Chip,
  Button,
} from '@mui/material';
import { UserSummaryDto, TeamDetailsInfoDto } from '../../../types';
import { Link } from 'react-router-dom';
import { useContext } from 'react';
import { UserContext } from '../../../contexts/UserContext';
import { useModal } from '../../../hooks/useModal';
import { managerModal } from '../modals/managerModal';
import { useTeams } from '../../../hooks/useTeams';

export const ManagerCard = ({
  team,
  setTeam,
}: {
  team?: TeamDetailsInfoDto;
  setTeam: React.Dispatch<React.SetStateAction<TeamDetailsInfoDto | undefined>>;
}) => {
  const { authenticatedUser } = useContext(UserContext);
  const { openModal } = useModal();
  const { promoteToManager, resignManager } = useTeams({ setTeam }); // 👈 AJOUT

  const handlePromote = () => {
    let selectedManager: UserSummaryDto | null = null;

    const onSelect = (user: UserSummaryDto | null) => {
      selectedManager = user;
    };

    const onConfirm = async (close: () => void) => {
      if (!selectedManager || !team) return;
      close();

      await promoteToManager(team.idTeam, selectedManager);
    };

    openModal(managerModal({ team, onSelect, onConfirm }));
  };

  const handleResign = async () => {
    // 👈 AJOUT
    if (!team) return;

    await resignManager(team.idTeam);
  };

  return (
    <Stack
      sx={{ background: (theme) => theme.palette.background.s1 }}
      padding="1.25rem 1rem 1rem"
      borderRadius="1.5rem"
      spacing="1.25rem"
    >
      <Stack direction="row" alignItems="center">
        <Typography variant="h4" flex={1}>
          Responsables
        </Typography>
        {team?.managers?.length &&
          team.managers.length < 2 &&
          team.managers.some(
            (manager) => manager.id === authenticatedUser?.id,
          ) &&
          team.members.length > 1 && (
            <Button
              variant="contained"
              color="secondary"
              onClick={handlePromote}
              sx={{ my: '-0.25rem' }}
            >
              Désigner
            </Button>
          )}
      </Stack>
      <Stack gap="0.75rem" direction="row" flexWrap="wrap">
        {team ? (
          team?.managers?.map((manager) => (
            <Chip
              sx={{
                cursor: 'pointer',
                '&:hover': {
                  background: (theme) => theme.palette.background.s4,
                },
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
            {Array.from({ length: 2 }).map((_, index) => (
              <Stack
                key={index}
                direction="row"
                gap="0.5rem"
                alignItems="center"
                height="2.75rem"
                padding="0 1rem 0 0.75rem"
                sx={{
                  background: (theme) => theme.palette.background.s2,
                }}
                borderRadius="0.75rem"
              >
                <Skeleton variant="circular" width="1.5rem" height="1.5rem" />
                <Skeleton
                  variant="text"
                  width={`${4 + (index % 3) * 1.5}rem`}
                  height={22}
                />
              </Stack>
            ))}
          </>
        )}
      </Stack>

      {team?.managers?.length &&
        team.managers.length < 2 &&
        team.managers.some((manager) => manager.id === authenticatedUser?.id) &&
        team.members.length > 1 && (
          <Button variant="contained" color="secondary" onClick={handlePromote}>
            Désigner un Responsable
          </Button>
        )}

      {team?.managers?.length &&
        team.managers.some(
          (manager) => manager.id === authenticatedUser?.id,
        ) && (
          <Button variant="contained" color="error" onClick={handleResign}>
            Renoncer à mon rôle
          </Button>
        )}
    </Stack>
  );
};
