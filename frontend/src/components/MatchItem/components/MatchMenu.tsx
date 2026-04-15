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
}

export const MatchMenu = ({ match }: MatchMenuProps) => {
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
    hasAnySection,
    handleForfeit,
    handleEditComposition,
    handleContestScore,
    handleConfirmScore,
    handleEncodeScore,
    handleEditScore,
  } = useMatchMenu({ match });

  if (!hasAnySection) return null;

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
                onClick={() => {
                  handleForfeit();
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
                handleContestScore();
                handleClose();
              }}
            >
              <CircleXmark style={{ color: theme.palette.text.secondary }} />
              <Typography variant="h5">Contester</Typography>
            </MenuItem>
            <MenuItem
              onClick={() => {
                handleConfirmScore();
                handleClose();
              }}
            >
              <CircleCheck style={{ color: theme.palette.text.secondary }} />
              <Typography variant="h5">Confirmer</Typography>
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
                <Typography variant="h5">Encoder les scores</Typography>
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
                <Typography variant="h5">Modifier les scores</Typography>
              </MenuItem>
            )}
          </>
        )}
      </Menu>
    </>
  );
};
