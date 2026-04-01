import { Dialog, DialogContent, DialogTitle } from '@mui/material';
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
    // Basic safety check
    if (!formData || !formData.name?.trim()) return;

    setIsSubmitting(true);
    try {
      if (isEdit && tournament?.idTournament) {
        await update(tournament.idTournament, formData);
        showSnackbar({ message: 'Tournoi mis à jour !', severity: 'success' });
        onClose();
      } else {
        const result = await create(formData);
        const newId = result?.idTournament;

        if (newId) {
          showSnackbar({
            message: 'Tournoi créé avec succès !',
            severity: 'success',
          });
          onClose();
          navigate(`/tournaments/${newId}`);
        } else {
          throw new Error('Résultat non attendu.');
        }
      }
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
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
          pb: 0, // Reduced bottom padding since Tabs are right below
          fontSize: '1.75rem',
          fontWeight: 'bold',
          color: 'white',
          paddingBlockEnd: 2,
        }}
      >
        {isEdit ? 'Modifier le Tournoi' : 'Créer un nouveau Tournoi'}
      </DialogTitle>

      <DialogContent sx={{ px: 4, py: 3, overflowX: 'hidden' }}>
        <TournamentModalContent
          key={tournament?.idTournament ?? 'new'}
          tournament={tournament}
          onDataChange={setFormData}
          handleSave={handleSave}
          isSubmitting={isSubmitting}
          onClose={onClose}
        />
      </DialogContent>
    </Dialog>
  );
};
