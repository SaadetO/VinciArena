import { InputLabel, Stack, Typography } from '@mui/material';
import { MatchSummaryDto } from '../../../types';
import { useModalController } from '../../../hooks/useModalController';
import { useEffect } from 'react';
import { NumericTextField } from '../../../modals/TournamentModal/components/NumericTextField';
import { VersusSymbol } from './VersusSymbol';

interface AdminEncodeScoreFormProps {
  match: MatchSummaryDto;
  scoreTeam1: number;
  setScoreTeam1: (value: number) => void;
  scoreTeam2: number;
  setScoreTeam2: (value: number) => void;
}

export const AdminEncodeScoreForm = ({
  match,
  scoreTeam1,
  setScoreTeam1,
  scoreTeam2,
  setScoreTeam2,
}: AdminEncodeScoreFormProps) => {
  const { setConfirmDisabled } = useModalController();

  useEffect(() => {
    const isInvalid =
      scoreTeam1 === undefined ||
      scoreTeam2 === undefined ||
      scoreTeam1 === scoreTeam2;
    setConfirmDisabled(isInvalid);
  }, [scoreTeam1, scoreTeam2, setConfirmDisabled]);
  return (
    <Stack spacing="2rem" padding="1rem 0">
      <Stack
        direction="row"
        spacing="2rem"
        alignItems="flex-end"
        justifyContent="center"
      >
        <Stack spacing="0.25rem" flex={1}>
          <InputLabel>{match.team1.name}</InputLabel>
          <NumericTextField
            value={scoreTeam1}
            onChange={setScoreTeam1}
            min={0}
            fullWidth={false}
          />
        </Stack>

        <Stack justifyContent="center" height="2.25rem">
          <VersusSymbol absolute={false} />
        </Stack>

        <Stack spacing="0.25rem" flex={1}>
          <InputLabel>{match.team2.name}</InputLabel>
          <NumericTextField
            value={scoreTeam2}
            onChange={setScoreTeam2}
            min={0}
            fullWidth={false}
          />
        </Stack>
      </Stack>

      {scoreTeam1 === scoreTeam2 && (
        <Typography variant="body2" color="error" textAlign="center">
          Les matchs nuls ne sont pas autorisés.
        </Typography>
      )}
    </Stack>
  );
};
