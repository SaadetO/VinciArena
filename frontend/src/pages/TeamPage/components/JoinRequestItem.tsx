import { Avatar, Button, Stack, Typography } from '@mui/material';
import { TeamDetailsInfoDto, JoinRequestDto } from '../../../types';
import { useContext, useState } from 'react';
import { UserContext } from '../../../contexts/UserContext';
import { useSnackbar } from '../../../hooks/useSnackbar';

export const JoinRequestItem = ({
  joinRequest,
  setTeam,
}: {
  joinRequest: JoinRequestDto;
  setTeam: React.Dispatch<React.SetStateAction<TeamDetailsInfoDto | undefined>>;
}) => {
  const { showSnackbar } = useSnackbar();
  const { authenticatedUser } = useContext(UserContext);
  const [isLoading, setIsLoading] = useState(false);

  const handleAction = async (
    status: 'ACCEPTED' | 'REJECTED',
    successMsg: string,
  ) => {
    setIsLoading(true);

    // Backup for rollback
    let previousTeam: TeamDetailsInfoDto | undefined;

    setTeam((prev) => {
      if (!prev) return prev;
      previousTeam = { ...prev };

      const updatedRequests = (prev.joinRequests ?? []).filter(
        (jr) => jr.idJoinRequest !== joinRequest.idJoinRequest,
      );

      const updatedMembers =
        status === 'ACCEPTED'
          ? [
              ...(prev.members ?? []),
              { ...joinRequest.requester, role: 'MEMBER' },
            ]
          : (prev.members ?? []);

      return {
        ...prev,
        joinRequests: updatedRequests,
        members: updatedMembers as any,
      };
    });

    try {
      const response = await fetch(
        `/api/teams/join-requests/${joinRequest.idJoinRequest}`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            Authorization: authenticatedUser?.token ?? '',
          },
          body: JSON.stringify(status),
        },
      );

      if (!response.ok) {
        throw new Error('Une erreur est survenue.');
      }

      showSnackbar({ message: successMsg, severity: 'success' });
    } catch (err: unknown) {
      // Rollback
      setTeam(previousTeam);
      showSnackbar({
        message:
          err instanceof Error ? err.message : 'Une erreur est survenue.',
        severity: 'error',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAccept = () => handleAction('ACCEPTED', 'Demande acceptée !');
  const handleDeny = () => handleAction('REJECTED', 'Demande refusée.');

  return (
    <>
      <Stack
        padding="0.5rem 1rem 0.5rem"
        borderRadius="0.5rem"
        alignItems="center"
        spacing="1rem"
        direction="row"
        sx={{ background: (theme) => theme.palette.background.s2 }}
      >
        <Avatar
          sx={{
            height: '1.5rem',
            width: '1.5rem',
            color: 'text.primary',
          }}
          src={`/assets/avatars/${joinRequest.requester.avatar}`}
        ></Avatar>
        <Typography variant="h5" sx={{ flex: 1 }}>
          {joinRequest.requester.tag}
        </Typography>
        <Button
          onClick={handleAccept}
          variant="contained"
          color="secondary"
          size="small"
          disabled={isLoading}
        >
          Accepter
        </Button>
        <Button
          onClick={handleDeny}
          variant="contained"
          color="secondary"
          size="small"
          disabled={isLoading}
        >
          Refuser
        </Button>
      </Stack>
    </>
  );
};
