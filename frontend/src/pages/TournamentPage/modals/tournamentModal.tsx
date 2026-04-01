import { Dialog, DialogContent, DialogTitle } from '@mui/material';
import { TournamentModalContent } from './tournamentModalContent';
import { useSnackbar } from '../../../hooks/useSnackbar';
import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { TournamentDetailsInfoDto } from '../../../types';
import { useTournament } from '../../../hooks/useTournament';
import dayjs from 'dayjs';

interface TournamentModalProps {
  open: boolean;
  onClose: () => void;
  tournament?: TournamentDetailsInfoDto;
}
export const TournamentModal = ({
  open,
  onClose,
  tournament,
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
          dayjs().add(7, 'day').format('YYYY-MM-DDTHH:mm:ss'),
        startDate:
          tournament?.startDate ?? dayjs().add(14, 'day').format('YYYY-MM-DD'),
        endDate:
          tournament?.endDate ?? dayjs().add(20, 'day').format('YYYY-MM-DD'),
      });
    }
  }, [tournament, open]);

  const handleSave = async () => {
    let result;
    if (!formData || !formData.name) return;
    // set loading to true
    setIsSubmitting(true);
    if (isEdit && tournament?.idTournament) {
      result = await update(tournament.idTournament, formData);
      onClose();
    } else {
      const result = await create(formData);

      const newId = result?.idTournament;
      // if succesfully created move navigate to the new tournaments page
      if (newId) {
        showSnackbar({ message: 'Succès !', severity: 'success' });
        onClose();
        navigate(`/tournaments/${newId}`);
      } else {
        throw new Error('Resultat non attendu.');
      }
    }
    setFormData(result);
    // set loading to false
    setIsSubmitting(false);
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
            minHeight: '500px',
            backgroundColor: '#121212',
            backgroundImage: 'none',
            borderRadius: '20px',
            boxShadow: '0px 8px 32px rgba(0,0,0,0.8)',
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
          formData={formData} // Add this
          setFormData={setFormData} // Add this
          handleSave={handleSave}
          isSubmitting={isSubmitting}
          onClose={onClose}
        />
      </DialogContent>
    </Dialog>
  );
};
