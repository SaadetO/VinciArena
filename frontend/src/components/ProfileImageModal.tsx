import {
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  ImageList,
  ImageListItem,
  Typography,
  Stack,
} from '@mui/material';
import { useState, useEffect } from 'react';
import { ProfileImage } from '../types';

interface Props {
  open: boolean;
  onClose: () => void;
  onSelect: (image: ProfileImage) => void;
}

export const ProfileImageModal = ({ open, onClose, onSelect }: Props) => {
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
      <DialogTitle variant="h2">Faites votre choix</DialogTitle>
      <Typography textAlign="center" padding="0 2rem 1rem" color="secondary">
        Choisissez une image de profil parmi les images proposées.
      </Typography>
      <Stack
        maxHeight="20rem"
        sx={{
          position: 'relative',
          '&::before': {
            content: '""',
            display: 'block',
            position: 'absolute',
            top: 0,
            left: 0,
            height: '2rem',
            zIndex: 100,
            background: (theme) =>
              `linear-gradient(to bottom, ${theme.palette.background.s1}, ${theme.palette.background.s1} 25%, transparent)`,
            width: '100%',
          },
          '&::after': {
            content: '""',
            display: 'block',
            position: 'absolute',
            bottom: 0,
            left: 0,
            height: '2rem',
            zIndex: 100,
            background: (theme) =>
              `linear-gradient(to top, ${theme.palette.background.s1}, ${theme.palette.background.s1} 25%, transparent)`,
            width: '100%',
          },
        }}
      >
        <DialogContent>
          <ImageList cols={4} gap={10}>
            {defaultImages.map((icon) => (
              <ImageListItem
                key={icon.idImage}
                onClick={() => setTempSelection(icon)}
                sx={{
                  cursor: 'pointer',
                  outlineOffset: '-0.25rem',
                  outline: (theme) =>
                    tempSelection?.idImage === icon.idImage
                      ? `0.25rem solid ${theme.palette.primary.main}`
                      : 'none',
                  borderRadius: '100rem',
                  overflow: 'hidden',
                }}
              >
                <img src={`/assets/avatars/${icon.path}`} alt="avatar" />
              </ImageListItem>
            ))}
          </ImageList>
        </DialogContent>
      </Stack>
      <DialogActions>
        <Button
          variant="contained"
          color="secondary"
          onClick={onClose}
          fullWidth
        >
          annuler
        </Button>
        <Button
          variant="contained"
          onClick={handleConfirm}
          disabled={!tempSelection}
          fullWidth
        >
          confirmer
        </Button>
      </DialogActions>
    </Dialog>
  );
};
