import {
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  ImageList,
  ImageListItem,
} from '@mui/material';
import { useState, useEffect } from 'react';
import { ProfileImage } from '../types';

interface Props {
  open: boolean;
  onClose: () => void;
  onSelect: (image: ProfileImage) => void;
}

export const ProfileImageMenu = ({ open, onClose, onSelect }: Props) => {
  const [defaultImages, setDefaultImages] = useState<ProfileImage[]>([]);
  const [tempSelection, setTempSelection] = useState<ProfileImage | null>(null);

  const fetchProfileImages = async () => {
    try {
      const response = await fetch(`/api/profile-images/`);
      if (response.ok) {
        const data = await response.json();
        setDefaultImages(data);
      }
    } catch (err) {
      console.error('Failed to fetch profile images', err);
    }
  };

  useEffect(() => {
    fetchProfileImages();
  }, []);

  const handleConfirm = () => {
    if (tempSelection) {
      onSelect(tempSelection); // Send choice to parent
      onClose();
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Faites votre choix</DialogTitle>
      <DialogContent dividers>
        <ImageList cols={4} gap={10}>
          {defaultImages.map((icon) => (
            <ImageListItem
              key={icon.idImage}
              onClick={() => setTempSelection(icon)}
              sx={{
                cursor: 'pointer',
                border: (theme) =>
                  tempSelection?.idImage === icon.idImage
                    ? `4px solid ${theme.palette.primary.main}`
                    : '4px solid transparent',
                borderRadius: '100rem',
                overflow: 'hidden',
              }}
            >
              <img src={`/assets/avatars/${icon.path}`} alt="avatar" />
            </ImageListItem>
          ))}
        </ImageList>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Renoncer</Button>
        <Button
          variant="contained"
          onClick={handleConfirm}
          disabled={!tempSelection}
        >
          Valider la sélection
        </Button>
      </DialogActions>
    </Dialog>
  );
};
