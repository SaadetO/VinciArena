import { Avatar, Button, Stack, Typography } from '@mui/material';
import { TeamDetailsInfoDto, JoinRequestDto } from '../../../types';
import { useContext, useState } from 'react';
import { UserContext } from '../../../contexts/UserContext';
import { useSnackbar } from '../../../hooks/useSnackbar';
import { useModal } from '../../../hooks/useModal';
import { joinRequestRejectModal } from '../../ProfilePage/modals/joinRequestRejectModal';

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
  const { openModal } = useModal();

  const handleAction = async (
    status: 'ACCEPTED' | 'REJECTED',
    successMsg: string,
    rejectionReason?: string,
  ) => {
    setIsLoading(true);

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
        members: updatedMembers,
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
          body: JSON.stringify({
            status,
            rejectionReason,
          }),
        },
      );

      if (!response.ok) {
        throw new Error('Une erreur est survenue.');
      }

      showSnackbar({ message: successMsg, severity: 'success' });
    } catch (err: unknown) {
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

  const handleDeny = () => {
    let selectedReason: string | null = null;

    const onSelect = (reason: string | null) => {
      selectedReason = reason;
    };

    const onConfirm = (close: () => void) => {
      if (!selectedReason) return;

      close();
      handleAction('REJECTED', 'Demande refusée.', selectedReason);
    };

    openModal(joinRequestRejectModal({ onSelect, onConfirm }));
  };

  return (
    <>
      <Stack
        padding="0.625rem 0.75rem 0.625rem"
        borderRadius="0.75rem"
        alignItems="center"
        spacing="0.5rem"
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
        />
        <Typography variant="h5" fontWeight="bold" sx={{ flex: 1 }}>
          {joinRequest.requester.tag}
        </Typography>
        <Stack direction="row" spacing="0.75rem">
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
      </Stack>
    </>
  );
};
