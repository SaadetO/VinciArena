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
import { LineupModal } from '../modals/LineupModal';
import { useModal } from '../../../hooks/useModal';
import { useMatches } from '../../../hooks/useMatches';
import { useContext, useRef } from 'react';
import { UserContext } from '../../../contexts/UserContext';

interface MatchMenuProps {
  match: MatchSummaryDto;
}

export const MatchMenu = ({ match }: MatchMenuProps) => {
  const { openModal } = useModal();
  const { updateLineup } = useMatches();
  const { authenticatedUser } = useContext(UserContext);
  const selectedIdsRef = useRef<number[]>([]);
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
    handleContestScore,
    handleConfirmScore,
    handleEncodeScore,
    handleEditScore,
  } = useMatchMenu({ match });

  if (!displayMenu) return null;

  const onEditComposition = () => {
    handleClose(); //  close match menu first
    openModal({
      title: 'Modifier la composition',
      subtitle: '',
      children: (
        <LineupModal
          matchId={match.idMatch}
          // eslint-disable-next-line @typescript-eslint/no-non-null-asserted-optional-chain
          teamId={authenticatedUser?.managedTeamId!}
          onSelectionChange={(ids) => {
            selectedIdsRef.current = ids;
          }}
        />
      ),
      onConfirm: (closeModal: () => void) => {
        updateLineup({
          matchId: match.idMatch,
          playerIds: selectedIdsRef.current,
          closeModal,
        });
      },
      onCancel: (close) => close(),
    });
  };
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
                  onEditComposition();
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
                <Typography variant="h5">Modifier les Scores</Typography>
              </MenuItem>
            )}
          </>
        )}
      </Menu>
    </>
  );
};
