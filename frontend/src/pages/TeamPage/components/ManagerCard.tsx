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
import { Dispatch, SetStateAction, useContext, useState } from 'react';
import { UserContext } from '../../../contexts/UserContext';
import { ManagerModal } from './ManagerModal';

export const ManagerCard = ({
  team,
  setTeam,
  setSnackBarMessage,
}: {
  team?: TeamDetailsInfoDto;
  setTeam: Dispatch<SetStateAction<TeamDetailsInfoDto | undefined>>;
  setSnackBarMessage: Dispatch<
    SetStateAction<{ text: string; isError: boolean; isOpen: boolean } | null>
  >;
}) => {
  const { authenticatedUser } = useContext(UserContext);
  const [open, setOpen] = useState(false);
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
        {team?.managers?.length && team.managers.length < 2 && (
          <Button
            variant="contained"
            color="secondary"
            onClick={() => setOpen(true)}
          >
            Désigner un responsable
          </Button>
        )}
      </Stack>
      <ManagerModal
        open={open}
        onClose={() => setOpen(false)}
        onSuccess={(successMessage: string, promotedUser?: ProfileInfoDto) => {
          setSnackBarMessage({
            text: successMessage,
            isError: false,
            isOpen: true,
          });
          if (promotedUser) {
            setTeam((prev) =>
              prev
                ? { ...prev, managers: [...prev.managers, promotedUser] }
                : undefined,
            );
          }
        }}
        onError={(errorMessage: string) => {
          setSnackBarMessage({
            text: errorMessage,
            isError: true,
            isOpen: true,
          });
        }}
        team={team}
      />
    </>
  );
};
