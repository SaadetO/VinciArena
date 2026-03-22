import { ImageList, ImageListItem, Skeleton } from '@mui/material';
import { useState, useEffect } from 'react';
import { ProfileImage } from '../types';

interface Props {
  onSelect: (image: ProfileImage) => void;
}

export const ProfileImageModalContent = ({ onSelect }: Props) => {
  const [defaultImages, setDefaultImages] = useState<ProfileImage[]>([]);
  const [avatar, setAvatar] = useState<ProfileImage | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const response = await fetch(`/api/profile-images/`);
        if (!response.ok) throw new Error('Failed to fetch profile images');
        const data = await response.json();
        setDefaultImages(data);
      } catch (err) {
        console.error('Failed to fetch profile images', err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);
  return (
    <ImageList cols={4} gap={10}>
      {loading
        ? Array.from({ length: 20 }).map((_, i) => (
            <Skeleton
              key={i}
              variant="circular"
              width="100%"
              height="100%"
              sx={{ aspectRatio: '1' }}
            />
          ))
        : defaultImages.map((icon) => (
            <ImageListItem
              key={icon.idImage}
              onClick={() => {
                setAvatar(icon);
                onSelect(icon);
              }}
              sx={{
                cursor: 'pointer',
                outlineOffset: '-0.25rem',
                outline: (theme) =>
                  avatar?.idImage === icon.idImage
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
  );
};
