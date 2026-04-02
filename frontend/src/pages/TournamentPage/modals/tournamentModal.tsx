import { Dialog, DialogContent, DialogTitle } from '@mui/material';
import { TournamentModalContent } from './tournamentModalContent';
import { useSnackbar } from '../../../hooks/useSnackbar';
import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { TournamentDetailsInfoDto } from '../../../types';
import { useTournament } from '../../../hooks/useTournaments';

import dayjs from 'dayjs';

interface TournamentModalProps {
  open: boolean;
  onClose: () => void;
  tournament?: TournamentDetailsInfoDto;
  setTournament?: React.Dispatch<
    React.SetStateAction<TournamentDetailsInfoDto | undefined>
  >;
}
export const TournamentModal = ({
  open,
  onClose,
  tournament,
  setTournament,
}: TournamentModalProps) => {
  const { showSnackbar } = useSnackbar();
  const navigate = useNavigate();

  // TODO : externalise the logic
  // track input data
  const [formData, setFormData] = useState<Partial<TournamentDetailsInfoDto>>(
    {},
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isEdit = !!tournament;
  const { create, update } = useTournament({});

  useEffect(() => {
    if (open) {
      setFormData({
        name: tournament?.name ?? '',
        description: tournament?.description ?? '',
        capacity: tournament?.capacity ?? 16,
        registrationDeadline:
          tournament?.registrationDeadline ??
          dayjs()
            .add(7, 'day')
            .set('hour', 20)
            .set('minute', 0)
            .format('YYYY-MM-DDTHH:mm:ss'),
        startDate:
          tournament?.startDate ?? dayjs().add(14, 'day').format('YYYY-MM-DD'),
        endDate:
          tournament?.endDate ?? dayjs().add(20, 'day').format('YYYY-MM-DD'),
      });
    }
  }, [tournament, open]);
  const handleSave = async () => {
    if (!formData?.name?.trim()) return;
    setIsSubmitting(true); // 1. Start Loading

    try {
      let result: TournamentDetailsInfoDto | undefined;
      if (isEdit && tournament?.idTournament) {
        result = await update(tournament.idTournament, formData);
        console.log(result);
        if (result) {
          setFormData(result);
          if (setTournament) {
            if (setTournament) {
              setTournament((prev) => {
                if (!prev) return result;
                return { ...prev, ...result };
              });
            }
          }
        }
        showSnackbar({ message: 'Tournoi modifié !', severity: 'success' });
        onClose();
      } else {
        result = await create(formData);
        if (result?.idTournament) {
          showSnackbar({ message: 'Tournoi crée !', severity: 'success' });
          onClose();
          navigate(`/tournaments/${result.idTournament}`);
        }
      }
    } catch (error) {
      console.error('Submission failed', error);
    } finally {
      setIsSubmitting(false);
    }
  };
  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth={false}
      sx={{
        '& .MuiDialog-container': {
          '& .MuiPaper-root': {
            width: '100%',
            maxWidth: '900px',
            minHeight: 'auto',
            height: 'auto',
            backgroundColor: '#121212',
            borderRadius: '20px',
          },
        },
      }}
    >
      <DialogTitle
        sx={{
          p: 4,
          pb: 2,
          fontSize: '1.75rem',
          fontWeight: 'bold',
          color: 'white',
        }}
      >
        {isEdit ? 'Modifier le Tournoi' : 'Créer un nouveau Tournoi'}
      </DialogTitle>

      <DialogContent sx={{ px: 4, py: 3, overflowX: 'hidden' }}>
        <TournamentModalContent
          key={`${tournament?.idTournament ?? 'new'}-${open}`}
          tournament={tournament}
          formData={formData}
          setFormData={setFormData}
          handleSave={handleSave}
          isSubmitting={isSubmitting}
          onClose={onClose}
        />
      </DialogContent>
    </Dialog>
  );
};
