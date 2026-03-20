import {
  Chip,
  Stack,
  Typography,
  Skeleton,
  IconButton,
  Tooltip,
} from '@mui/material';
import profileHeroHeader from '../../../assets/images/profile_hero_header.jpg';
import { ProfileImage, ProfileInfoDto } from '../../../types';
import { Link } from 'react-router-dom';
import { EditOutlined } from '@mui/icons-material';
import { UserContext } from '../../../contexts/UserContext';
import { useContext, Dispatch, SetStateAction } from 'react';
import { profileImageModal } from '../../../modals/profileImageModal';
import { useModal } from '../../../hooks/useModal';
import { useModalController } from '../../../hooks/useModalController';
import { useMembers } from '../../../hooks/useMembers';

export const ProfileBanner = ({
  user,
  setUser,
}: {
  user?: ProfileInfoDto;
  setUser: Dispatch<SetStateAction<ProfileInfoDto | undefined>>;
}) => {
  const { openModal } = useModal();
  const { setError } = useModalController();
  const { authenticatedUser } = useContext(UserContext);

  const { updateAvatar } = useMembers({ setUser });

  const handleAvatarChange = () => {
    let selectedImage: ProfileImage | null = null;

    const onSelect = (image: ProfileImage | null) => {
      selectedImage = image;
    };

    const onConfirm = async (close: () => void) => {
      if (!user) return;
      const avatar = selectedImage;
      if (!avatar) return;

      const previousAvatar = user.avatar;
      if (previousAvatar === avatar.path)
        return setError('Image déjà sélectionnée');

      close();

      updateAvatar(avatar, previousAvatar ?? '');
    };

    openModal(
      profileImageModal({
        onSelect,
        onConfirm,
      }),
    );
  };

  return (
    <Stack
      sx={{
        background: `linear-gradient(0, rgba(0, 0, 0, 0.2)), url("${profileHeroHeader}") no-repeat center/cover`,
      }}
      spacing="0.375rem"
      width={1}
      height="fit-content"
      padding="5rem 5rem"
    >
      <Stack spacing="0.75rem" alignItems="center" direction="row">
        {user ? (
          <Stack
            position="relative"
            borderRadius="100rem"
            overflow="hidden"
            height="2.5rem"
            width="2.5rem"
            alignItems="center"
            justifyContent="center"
          >
            <img
              src={user.avatar ? `/assets/avatars/${user.avatar}` : ''}
              style={{
                flexShrink: 0,
                width: '2.5rem',
                height: '2.5rem',
                position: 'absolute',
              }}
            />
            {user.id === authenticatedUser?.id && (
              <Tooltip title="Changer l'avatar" arrow>
                <IconButton
                  onClick={handleAvatarChange}
                  sx={{ backgroundColor: 'rgba(0, 0, 0, 0.2)' }}
                >
                  <EditOutlined
                    sx={{
                      color: (theme) => theme.palette.text.primary,
                    }}
                  />
                </IconButton>
              </Tooltip>
            )}
          </Stack>
        ) : (
          <Skeleton variant="circular" width="2.5rem" height="2.5rem" />
        )}
        <Typography variant="h1">
          {user ? user.tag : <Skeleton width="10rem" />}
        </Typography>
      </Stack>
      <Stack direction="row" spacing="0.25rem" alignItems="center">
        {user ? (
          <>
            {user.team && (
              <Chip
                component={Link}
                to={`/teams/${user.team.id}`}
                size="small"
                color="inverse"
                label={`TEAM ${user.team.name}`}
                clickable
                sx={{
                  textTransform: 'none',
                  '& .MuiChip-label': {
                    color: (theme) => theme.palette.background.s0,
                  },
                  '&:hover': {
                    background: (theme) =>
                      `color-mix(in srgb, ${theme.palette.background.s1}, white 88%)`,
                  },
                }}
              />
            )}
            <Chip
              size="medium"
              variant="text"
              label={`spécialité ${user.specialty}`}
            />
          </>
        ) : (
          <>
            <Skeleton variant="rounded" width="4rem" height="1.5rem" />
            <Skeleton variant="rounded" width="8rem" height="1.5rem" />
          </>
        )}
      </Stack>
    </Stack>
  );
};
