import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  CircularProgress,
} from '@mui/material';
import { TournamentModalContent } from './tournamentModalContent';
import { useSnackbar } from '../../../hooks/useSnackbar';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { TournamentDetailsInfoDto } from '../../../types';
import { useTournament } from '../../../hooks/useTournament';

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

  // track input data
  const [formData, setFormData] =
    useState<Partial<TournamentDetailsInfoDto> | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isEdit = !!tournament;
  const { create, update } = useTournament({});
  const handleSave = async () => {
    if (!formData || !formData.name) return;
    // set loading to true
    setIsSubmitting(true);
    if (isEdit && tournament?.idTournament) {
      await update(tournament.idTournament, formData);
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
          pb: 3,
          fontSize: '1.75rem',
          fontWeight: 'bold',
          color: 'white',
        }}
      >
        {isEdit ? 'Modifier le Tournoi' : 'Créer un nouveau Tournoi'}
      </DialogTitle>
      <DialogContent sx={{ px: 4, py: 3, overflowX: 'hidden' }}>
        <TournamentModalContent
          key={tournament?.idTournament ?? 'new'}
          tournament={tournament}
          onDataChange={setFormData}
        />
      </DialogContent>

      <DialogActions sx={{ p: 4, pt: 0, gap: 2 }}>
        <Button
          onClick={onClose}
          disabled={isSubmitting}
          sx={{
            color: 'rgba(255,255,255,0.6)',
            textTransform: 'none',
            fontSize: '1rem',
          }}
        >
          Annuler
        </Button>
        <Button
          onClick={handleSave}
          variant="contained"
          disabled={!formData?.name || isSubmitting}
          sx={{
            borderRadius: '30px',
            px: 6,
            py: 1.5,
            textTransform: 'none',
            fontWeight: 'bold',
            backgroundColor: '#00B4D8',
            '&:hover': { backgroundColor: '#0096B4' },
            minWidth: '150px',
          }}
        >
          {isSubmitting ? (
            <CircularProgress size={24} sx={{ color: 'white' }} />
          ) : isEdit ? (
            'Enregistrer'
          ) : (
            'Créer le tournoi'
          )}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
