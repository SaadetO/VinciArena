import { useEffect, useState } from 'react';
import { TeamDetailsInfoDto, UserSummaryDto } from '../../../types';
import {
  Autocomplete,
  Avatar,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { useModalController } from '../../../hooks/useModalController';

interface ExcludeMemberModalContentProps {
  team: TeamDetailsInfoDto | undefined;
  onSelect: (user: UserSummaryDto | null) => void;
}

export const ExcludeMemberModalContent = ({
  team,
  onSelect,
}: ExcludeMemberModalContentProps) => {
  const [localError, setLocalError] = useState<string | null>(null);
  const [selectedUser, setSelectedUser] = useState<UserSummaryDto | null>(null);

  const { setError } = useModalController();

  useEffect(() => {
    onSelect(selectedUser);
  }, [selectedUser, onSelect]);

  // TODO: change options to get all members except the authenticatedUser
  // (one of the team's manager)

  return (
    <>
      <Autocomplete
        data-testid="member-selection-autocomplete"
        options={
          team?.members.filter(
            (user: UserSummaryDto) =>
              !team?.managers.find((manager) => manager.id === user.id),
          ) ?? []
        }
        fullWidth
        value={selectedUser}
        getOptionLabel={(user) => user.tag}
        getOptionKey={(user) => user.id}
        autoHighlight
        onChange={(_, value) => {
          setSelectedUser(value);
          if (localError) {
            setLocalError(null);
            setError(null);
          }
        }}
        renderOption={(props, option) => (
          <Stack
            direction="row"
            component="li"
            {...props}
            data-testid={`member-option-${option.tag}`}
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              p: '0.5rem 1rem !important',
            }}
          >
            <Avatar
              src={option.avatar ? `/assets/avatars/${option.avatar}` : ''}
              alt={option.tag}
              sx={{ width: '1.5rem', height: '1.5rem' }}
            />
            <Typography variant="h5">{option.tag}</Typography>
          </Stack>
        )}
        renderInput={(params) => (
          <TextField
            {...params}
            placeholder="Sélectionnez un membre"
            error={!!localError}
            helperText={localError}
            required
            autoFocus
            inputProps={{
              ...params.inputProps,
              'data-testid': 'member-selection-input',
            }}
          />
        )}
      />
    </>
  );
};
