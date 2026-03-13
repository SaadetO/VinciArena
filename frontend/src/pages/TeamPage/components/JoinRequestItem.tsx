import { Avatar, Button, Stack, Typography } from '@mui/material';
import { JoinRequestDto } from '../../../types';
import { useContext, useState } from 'react';
import { UserContext } from '../../../contexts/UserContext';

interface JoinRequestItemProps {
  joinRequest: JoinRequestDto;
  showNotification: (msg: string) => void;
  onActionSuccess: () => void;
}

export const JoinRequestItem = ({
  joinRequest,
  showNotification,
  onActionSuccess,
}: JoinRequestItemProps) => {
  const { authenticatedUser } = useContext(UserContext);
  const [isLoading, setIsLoading] = useState(false);

  const handleAction = async (
    status: 'ACCEPTED' | 'REJECTED',
    successMsg: string,
  ) => {
    setIsLoading(true);
    try {
      let errorData;
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
        let errorMsg = 'Une erreur est survenue.';
        try {
          errorData = await response.json();
        } catch (e) {
          if (errorData.message) errorMsg = errorData.message;
        }
        throw new Error(errorMsg);
      }
      showNotification(successMsg);
      await onActionSuccess();
    } catch (err: unknown) {
      showNotification(
        err instanceof Error ? err.message : 'Une erreur est survenue.',
      );
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
