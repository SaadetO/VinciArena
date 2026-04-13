import { useState, useEffect, useMemo } from 'react';
import { Box, IconButton, Stack, Tooltip } from '@mui/material';
import { MemberSummaryDto, Team } from '../../../types';
import { FilterAutocomplete } from '../components/FilterAutocomplete';
import { DatePicker } from '@mui/x-date-pickers';
import { TournamentFilters } from '../../../utils/tournamentUtils';
import { getDurationString } from '../../../utils/date';
import { ArrowRight, CircleXmark } from '@gravity-ui/icons';
import { theme } from '../../../themes';
import { useModalController } from '../../../hooks/useModalController';
import dayjs from 'dayjs';
import { useTeams } from '../../../hooks/useTeams';
import { useMembers } from '../../../hooks/useMembers';

interface FilterModalContentProps {
  initialFilters: Partial<TournamentFilters>;
  showStatusFilter: boolean;
  onlyStatusFilter?: boolean;
  isAdmin?: boolean;
  onFiltersChange: (filters: Partial<TournamentFilters>) => void;
}

export const FilterModalContent = ({
  initialFilters,
  showStatusFilter,
  onlyStatusFilter = false,
  isAdmin = false,
  onFiltersChange,
}: FilterModalContentProps) => {
  const statusOptions = useMemo(() => {
    const options = [
      { label: 'Inscriptions', value: 'REGISTRATION_OPEN' },
      { label: 'Inscriptions closes', value: 'REGISTRATION_CLOSED' },
      { label: 'Planifié', value: 'PLANNED' },
      { label: 'Annulé', value: 'CANCELLED' },
    ];
    if (isAdmin) {
      options.unshift({ label: 'En préparation', value: 'IN_PREPARATION' });
    }
    return options;
  }, [isAdmin]);

  const [localFilters, setLocalFilters] =
    useState<Partial<TournamentFilters>>(initialFilters);

  const [allTeams, setAllTeams] = useState<Team[]>([]);
  const [allMembers, setAllMembers] = useState<MemberSummaryDto[]>([]);

  const { getAll: getAllTeams, isGettingAllTeams } = useTeams({
    setTeams: setAllTeams,
  });
  const { getAllSummaries: getAllMembers, isGettingSummaries } = useMembers({
    setSummaries: setAllMembers,
  });

  useEffect(() => {
    if (!onlyStatusFilter) {
      getAllTeams({ isActive: true });
      getAllMembers({});
    }
  }, [onlyStatusFilter, getAllTeams, getAllMembers]);

  // Derived selected arrays for Autocomplete components
  const selectedTeams = useMemo(
    () => allTeams.filter((t) => localFilters.teams?.includes(t.idTeam)),
    [allTeams, localFilters.teams],
  );

  const selectedMembers = useMemo(
    () => allMembers.filter((m) => localFilters.members?.includes(m.id)),
    [allMembers, localFilters.members],
  );

  const selectedStatuses = useMemo(
    () => statusOptions.filter((s) => localFilters.statuses?.includes(s.value)),
    [statusOptions, localFilters.statuses],
  );

  useEffect(() => {
    onFiltersChange(localFilters);
  }, [localFilters, onFiltersChange]);

  // Dates //

  const { setError } = useModalController();

  useEffect(() => {
    let error;

    const startDateStr = localFilters.dates?.minDate;
    const endDateStr = localFilters.dates?.maxDate;

    if (startDateStr && endDateStr) {
      const startDate = dayjs(startDateStr);
      const endDate = dayjs(endDateStr);

      if (!startDate.isValid() || !endDate.isValid())
        error = 'Les dates doivent être valides.';
    }

    setError(error || null);
  }, [localFilters.dates, setError]);

  const handleDateChange = (
    date: dayjs.Dayjs | null,
    field: 'minDate' | 'maxDate',
  ) => {
    if (!date) return;

    setLocalFilters((prev) => {
      const prevDates = prev.dates || {
        minDate: undefined,
        maxDate: undefined,
      };
      const newDates = { ...prevDates, [field]: date.format('YYYY-MM-DD') };

      if (!newDates.minDate || !newDates.maxDate) {
        return { ...prev, dates: newDates };
      }

      const minD = dayjs(newDates.minDate);
      const maxD = dayjs(newDates.maxDate);

      if (field === 'minDate' && minD.isAfter(maxD))
        newDates.maxDate = minD.add(7, 'day').format('YYYY-MM-DD');
      else if (field === 'maxDate' && maxD.isBefore(minD))
        newDates.minDate = maxD.subtract(7, 'day').format('YYYY-MM-DD');

      if (field === 'minDate' && minD.isSame(maxD, 'day'))
        newDates.maxDate = minD.add(7, 'day').format('YYYY-MM-DD');

      if (field === 'maxDate' && maxD.isSame(minD, 'day'))
        newDates.minDate = maxD.subtract(7, 'day').format('YYYY-MM-DD');

      return { ...prev, dates: newDates };
    });
  };
  return (
    <Stack spacing="0.625rem">
      {!onlyStatusFilter && (
        <>
          <FilterAutocomplete
            options={allTeams}
            value={selectedTeams}
            onChange={(teams) =>
              setLocalFilters({
                ...localFilters,
                teams: teams.map((t) => t.idTeam),
              })
            }
            loading={isGettingAllTeams}
            placeholder="Filtrer par équipes"
            getOptionLabel={(team) => team.name}
            getOptionId={(team) => team.idTeam}
          />
          <FilterAutocomplete
            options={allMembers}
            value={selectedMembers}
            onChange={(members) =>
              setLocalFilters({
                ...localFilters,
                members: members.map((m) => m.id),
              })
            }
            loading={isGettingSummaries}
            placeholder="Filtrer par membres"
            getOptionLabel={(member) => member.tag}
            getOptionId={(member) => member.id}
            getOptionAvatar={(member) => member.avatar ?? undefined}
          />
        </>
      )}
      {showStatusFilter && (
        <FilterAutocomplete
          options={statusOptions}
          value={selectedStatuses}
          onChange={(statuses) =>
            setLocalFilters({
              ...localFilters,
              statuses: statuses.map((s) => s.value),
            })
          }
          loading={false}
          placeholder="Filtrer par états"
          getOptionLabel={(status) => status.label}
          getOptionId={(status) => status.value}
        />
      )}
      <Stack
        spacing="1rem"
        direction="row"
        alignItems="center"
        justifyContent="center"
      >
        <DatePicker
          format="DD/MM/YY"
          name="minDate"
          value={
            localFilters.dates?.minDate
              ? dayjs(localFilters.dates.minDate)
              : null
          }
          onChange={(date) => handleDateChange(date, 'minDate')}
        />
        <Tooltip
          title={getDurationString({
            startDate: localFilters.dates?.minDate
              ? dayjs(localFilters.dates.minDate)
              : dayjs(),
            endDate: localFilters.dates?.maxDate
              ? dayjs(localFilters.dates.maxDate)
              : dayjs(),
          })}
          arrow
          placement="top"
        >
          <Box>
            <ArrowRight
              style={{
                color: theme.palette.text.secondary,
                cursor: 'help',
                height: '1rem',
                width: '1rem',
              }}
            />
          </Box>
        </Tooltip>
        <DatePicker
          format="DD/MM/YY"
          name="maxDate"
          value={
            localFilters.dates?.maxDate
              ? dayjs(localFilters.dates.maxDate)
              : null
          }
          onChange={(date) => handleDateChange(date, 'maxDate')}
        />
        {(localFilters.dates?.minDate || localFilters.dates?.maxDate) && (
          <Tooltip title="Réinitialiser les dates" arrow placement="top">
            <IconButton
              size="small"
              color="secondary"
              sx={{
                marginLeft: '0.5rem !important',
                height: '2.25rem',
                width: '2.25rem',
              }}
              onClick={() =>
                setLocalFilters({
                  ...localFilters,
                  dates: {
                    minDate: undefined,
                    maxDate: undefined,
                  },
                })
              }
            >
              <CircleXmark style={{ color: theme.palette.text.secondary }} />
            </IconButton>
          </Tooltip>
        )}
      </Stack>
    </Stack>
  );
};
