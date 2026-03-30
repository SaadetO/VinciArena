import { Avatar, Button, Stack, Typography } from '@mui/material';
import { TeamDetailsInfoDto, JoinRequestDto } from '../../../types';
import { joinRequestRejectModal } from '../../ProfilePage/modals/joinRequestRejectModal';
import { useJoinRequests } from '../../../hooks/useJoinRequests';
import { useModal } from '../../../hooks/useModal';

export const JoinRequestItem = ({
  joinRequest,
  setTeam,
}: {
  joinRequest: JoinRequestDto;
  setTeam: React.Dispatch<React.SetStateAction<TeamDetailsInfoDto | undefined>>;
}) => {
  const { updateJoinRequestStatus, isUpdatingJoinRequest } = useJoinRequests({
    setTeam,
  });
  const { openModal } = useModal();

  const handleAction = async (
    status: 'ACCEPTED' | 'REJECTED',
    reason?: string,
  ) => {
    await updateJoinRequestStatus(joinRequest, status, reason);
  };

  const handleAccept = () => handleAction('ACCEPTED');

  const handleDeny = () => {
    let selectedReason: string | null = null;

    const onSelect = (reason: string | null) => {
      selectedReason = reason;
    };

    const onConfirm = (close: () => void) => {
      if (!selectedReason) return;

      close();
      handleAction('REJECTED', selectedReason);
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
            disabled={isUpdatingJoinRequest}
          >
            Accepter
          </Button>
          <Button
            onClick={handleDeny}
            variant="contained"
            color="secondary"
            size="small"
            disabled={isUpdatingJoinRequest}
          >
            Refuser
          </Button>
        </Stack>
      </Stack>
    </>
  );
};
