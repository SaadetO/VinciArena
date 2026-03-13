import { Box, Chip, Stack, Typography, Skeleton } from '@mui/material';
import profileHeroHeader from '../../../assets/images/profile_hero_header.jpg';
import { ProfileInfoDto } from '../../../types';
import { Link } from 'react-router-dom';

export const ProfileBanner = ({ user }: { user?: ProfileInfoDto }) => {
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
          <Box
            borderRadius="100rem"
            overflow="hidden"
            height="2.5rem"
            width="2.5rem"
          >
            <img
              src={user.avatar ? `/assets/avatars/${user.avatar}` : ''}
              width="100%"
              height="100%"
            />
          </Box>
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
