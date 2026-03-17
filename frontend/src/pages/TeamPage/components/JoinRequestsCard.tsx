import { Stack, Typography } from '@mui/material';
import { TeamDetailsInfoDto } from '../../../types';
import { JoinRequestItem } from './JoinRequestItem';

export const JoinRequestsCard = ({
  team,
  setTeam,
}: {
  team: TeamDetailsInfoDto;
  isLoading: boolean;
  setTeam: React.Dispatch<React.SetStateAction<TeamDetailsInfoDto | undefined>>;
}) => {
  return (
    <>
      <Stack
        sx={{ background: (theme) => theme.palette.background.s1 }}
        padding="1.25rem 1rem 1rem"
        borderRadius="0.5rem"
        spacing="1rem"
      >
        <Typography variant="h4">Demandes d'adhésion</Typography>
        <Stack spacing="0.75rem" flexWrap="wrap">
          {team?.joinRequests &&
          team.joinRequests.filter((jr) => jr.status === 'PENDING').length >
            0 ? (
            team.joinRequests
              .filter((jr) => jr.status === 'PENDING')
              .map((jr) => (
                <JoinRequestItem
                  key={jr.idJoinRequest}
                  joinRequest={jr}
                  setTeam={setTeam}
                />
              ))
          ) : (
            <Stack
              padding="2rem 1.5rem"
              spacing="0.25rem"
              alignItems="center"
              width="100%"
            >
              <Typography variant="h5" textAlign="center">
                Aucune demande d'adhésion
              </Typography>
              <Typography
                variant="body2"
                textAlign="center"
                width="14rem"
                color="text.secondary"
              >
                Rien à signaler !
              </Typography>
            </Stack>
          )}
        </Stack>
      </Stack>
    </>
  );
};
