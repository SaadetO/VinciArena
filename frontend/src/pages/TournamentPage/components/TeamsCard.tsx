import { Button, Chip, Skeleton, Stack, Typography } from '@mui/material';
import { TeamSummaryDto } from '../../../types';
import { Link } from 'react-router-dom';

export const TeamsCard = ({ teams }: { teams?: TeamSummaryDto[] }) => {
  return (
    <Stack
      sx={{ background: (theme) => theme.palette.background.s1 }}
      padding="1.25rem 1rem 1rem"
      borderRadius="1.5rem"
      spacing="1.25rem"
    >
      <Stack direction="row" alignItems="center">
        <Typography variant="h4" flex={1}>
          Teams participantes
        </Typography>
        <Button
          variant="contained"
          color="secondary"
          sx={{ my: '-0.25rem' }}
          onClick={() => {}}
        >
          S'inscrire
        </Button>
      </Stack>
      <Stack gap="0.75rem" direction="row" flexWrap="wrap">
        {teams ? (
          teams.length > 0 ? (
            teams.map((team) => (
              <Chip
                sx={{
                  cursor: 'pointer',
                  '&:hover': {
                    background: (theme) => theme.palette.background.s4,
                  },
                }}
                key={team.idTeam}
                component={Link}
                to={`/teams/${team.idTeam}`}
                label={team.name}
                variant="filled"
              />
            ))
          ) : (
            <Stack
              padding="2rem 1.5rem"
              spacing="0.25rem"
              alignItems="center"
              width="100%"
              sx={{
                background: (theme) => theme.palette.background.s2,
              }}
              borderRadius="0.75rem"
            >
              <Typography variant="h5" textAlign="center">
                Aucune équipe inscrite
              </Typography>
              <Typography
                variant="body2"
                textAlign="center"
                color="text.secondary"
              >
                Il n'y a pas encore d'équipes enregistrées pour ce tournoi.
              </Typography>
            </Stack>
          )
        ) : (
          <>
            {Array.from({ length: 2 }).map((_, index) => (
              <Stack
                key={index}
                direction="row"
                gap="0.5rem"
                alignItems="center"
                height="2.75rem"
                padding="0 1rem 0 0.75rem"
                sx={{
                  background: (theme) => theme.palette.background.s2,
                }}
                borderRadius="0.75rem"
              >
                <Skeleton variant="circular" width="1.5rem" height="1.5rem" />
                <Skeleton
                  variant="text"
                  width={`${4 + (index % 3) * 1.5}rem`}
                  height={22}
                />
              </Stack>
            ))}
          </>
        )}
      </Stack>
    </Stack>
  );
};
