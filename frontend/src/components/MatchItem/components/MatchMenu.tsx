import { Divider, IconButton, Menu, MenuItem, Typography } from '@mui/material';
import {
  CircleCheck,
  CircleXmark,
  EllipsisVertical,
  Flag,
  PencilToLine,
  PencilToSquare,
  Persons,
} from '@gravity-ui/icons';
import { MatchSummaryDto } from '../../../types';
import { useMatchMenu } from '../hooks/useMatchMenu';

interface MatchMenuProps {
  match: MatchSummaryDto;
  refetch: () => void;
}

export const MatchMenu = ({ match, refetch }: MatchMenuProps) => {
  const {
    theme,
    anchorEl,
    handleClick,
    handleClose,
    showTeamSection,
    showForfeit,
    showEditComposition,
    showScoresSection,
    showAdminEncode,
    showAdminModify,
    showAdminSection,
    needsDividerAfterTeam,
    needsDividerAfterScores,
    displayMenu,
    handleForfeit,
    handleEditComposition,
    handleConfirmOrContestScore,
    handleEncodeScore,
    handleEditScore,
    authenticatedUser,
  } = useMatchMenu({ match, refetch });

  if (!displayMenu) return null;

  return (
    <>
      <IconButton size="small" onClick={handleClick}>
        <EllipsisVertical style={{ color: theme.palette.text.secondary }} />
      </IconButton>

      <Menu
        open={Boolean(anchorEl)}
        onClose={handleClose}
        anchorEl={anchorEl}
        sx={{
          '& .MuiPaper-root': {
            width: 'fit-content',
          },
        }}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
      >
        {showTeamSection && (
          <>
            <Typography
              variant="body2"
              padding="0.375rem 0.75rem 0.25rem"
              color="secondary"
            >
              Team
            </Typography>
            {showForfeit && (
              <MenuItem
                disabled={match.status == "FORFEIT"}
                onClick={() => {
                  const forfeitingTeamId = authenticatedUser?.managedTeamId;

                  if (!forfeitingTeamId) {
                    console.log(`No team found for authenticatedUser (user id: ${authenticatedUser?.id})`);
                    return;
                  }

                  const winningTeamId =
                    forfeitingTeamId === match.team1.idTeam
                    ? match.team2.idTeam
                    : match.team1.idTeam;
                  
                  handleForfeit({
                    matchID: match.idMatch,
                    winningTeamId: winningTeamId,
                    forfeitingTeamId: forfeitingTeamId,
                  });

                  handleClose();
                }}
              >
                <Flag style={{ color: theme.palette.text.secondary }} />
                <Typography variant="h5">Déclarer Forfait</Typography>
              </MenuItem>
            )}
            {showEditComposition && (
              <MenuItem
                onClick={() => {
                  handleEditComposition();
                  handleClose();
                }}
              >
                <Persons style={{ color: theme.palette.text.secondary }} />
                <Typography variant="h5">Modifier Composition</Typography>
              </MenuItem>
            )}
          </>
        )}

        {needsDividerAfterTeam && (
          <Divider sx={{ margin: '0.25rem 0.75rem !important' }} />
        )}

        {showScoresSection && (
          <>
            <Typography
              variant="body2"
              padding="0.375rem 0.75rem 0.25rem"
              color="secondary"
            >
              Scores
            </Typography>
            <MenuItem
              onClick={() => {
                handleConfirmOrContestScore({
                  id: match.idMatch,
                  isTeam1:
                    authenticatedUser?.managedTeamId === match?.team1?.idTeam,
                  isConfirming: true,
                  previousMatch: match,
                });
                handleClose();
              }}
            >
              <CircleCheck style={{ color: theme.palette.text.secondary }} />
              <Typography variant="h5">Confirmer</Typography>
            </MenuItem>
            <MenuItem
              onClick={() => {
                handleConfirmOrContestScore({
                  id: match.idMatch,
                  isTeam1:
                    authenticatedUser?.managedTeamId === match?.team1?.idTeam,
                  isConfirming: false,
                  previousMatch: match,
                });
                handleClose();
              }}
            >
              <CircleXmark style={{ color: theme.palette.text.secondary }} />
              <Typography variant="h5">Contester</Typography>
            </MenuItem>
          </>
        )}

        {needsDividerAfterScores && (
          <Divider sx={{ margin: '0.25rem 0.75rem !important' }} />
        )}

        {showAdminSection && (
          <>
            <Typography
              variant="body2"
              padding="0.375rem 0.75rem 0.25rem"
              color="secondary"
            >
              Administrateur
            </Typography>
            {showAdminEncode && (
              <MenuItem
                onClick={() => {
                  handleEncodeScore();
                  handleClose();
                }}
              >
                <PencilToLine style={{ color: theme.palette.text.secondary }} />
                <Typography variant="h5">Encoder les Scores</Typography>
              </MenuItem>
            )}
            {showAdminModify && (
              <MenuItem
                onClick={() => {
                  handleEditScore();
                  handleClose();
                }}
              >
                <PencilToSquare
                  style={{ color: theme.palette.text.secondary }}
                />
                <Typography variant="h5">Corriger les Scores</Typography>
              </MenuItem>
            )}
          </>
        )}
      </Menu>
    </>
  );
};
