import { Stack, TextField } from '@mui/material';
import { SyntheticEvent, useContext, useState } from 'react';
import { UserContext } from '../../../contexts/UserContext';
import { useModalController } from '../../../hooks/useModalController';
import { useSnackbar } from '../../../hooks/useSnackbar';

interface CreateTeamModalContentProps {
  onSuccess: (team: { id: number; name: string; isManager: boolean }) => void;
  close: () => void;
}

export const CreateTeamModalContent = ({
  onSuccess,
  close,
}: CreateTeamModalContentProps) => {
  const [teamName, setTeamName] = useState('');
  const [localError, setLocalError] = useState<string | null>(null);
  
  const { authenticatedUser } = useContext(UserContext);
  const { setError, setConfirmDisabled } = useModalController();
  const { showSnackbar } = useSnackbar();

  const handleChange = (e: SyntheticEvent) => {
    const input = e.target as HTMLInputElement;
    setTeamName(input.value);
    
    // Clear validation errors on typing
    if (localError) setLocalError(null);
    if (input.value.trim().length > 0) {
      setConfirmDisabled(false);
      setError(null);
    } else {
      setConfirmDisabled(true);
    }
  };

  const handleCreate = async () => {
    if (!teamName.trim()) {
      const msg = "Le nom de l'équipe ne peut pas être vide.";
      setLocalError(msg);
      setError(msg);
      return;
    }

    setConfirmDisabled(true);
    setError(null);

    try {
      const response = await fetch('/api/teams/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: authenticatedUser?.token ?? '',
        },
        body: JSON.stringify({ name: teamName.trim() }),
      });

      if (!response.ok) {
        if (response.status === 409) {
          throw new Error('Une équipe avec ce nom existe déjà');
        }
        throw new Error('Erreur lors de la création de la team.');
      }

      const createdTeam = await response.json();

      onSuccess({
        id: createdTeam.idTeam,
        name: createdTeam.name,
        isManager: true,
      });
      
      showSnackbar({
        message: 'Team créée avec succès !',
        severity: 'success'
      });
      close();
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : 'Une erreur est survenue.';
      setLocalError(errorMsg);
      setError(errorMsg);
      setConfirmDisabled(false);
    }
  };

  // Expose the submit function globally via form wrapping
  return (
    <form 
        id="create-team-form"
        onSubmit={(e) => { 
            e.preventDefault(); 
            handleCreate(); 
        }}
    >
      <Stack>
        <TextField
          id="teamName"
          name="teamName"
          placeholder="Nom de Team"
          onChange={handleChange}
          variant="outlined"
          error={!!localError}
          helperText={localError}
          autoFocus
        />
      </Stack>
    </form>
  );
};
