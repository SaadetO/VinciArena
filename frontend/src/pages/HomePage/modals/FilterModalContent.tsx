import { useState, useEffect, useMemo } from 'react';
import { Stack } from '@mui/material';
import { MemberSummaryDto, Team } from '../../../types';
import { FilterAutocomplete } from '../components/FilterAutocomplete';
interface FilterModalContentProps {
  initialTeams: number[];
  initialMembers: number[];
  initialStatuses: string[];
  showStatusFilter: boolean;
  onlyStatusFilter?: boolean;
  isAdmin?: boolean;
  cachedTeams: Team[];
  cachedMembers: MemberSummaryDto[];
  fetchTeams: () => Promise<Team[] | null>;
  fetchMembers: () => Promise<MemberSummaryDto[] | null>;
  onFiltersChange: (filters: {
    teams: number[];
    members: number[];
    statuses: string[];
  }) => void;
}

export const FilterModalContent = ({
  initialTeams,
  initialMembers,
  initialStatuses,
  showStatusFilter,
  onlyStatusFilter = false,
  isAdmin = false,
  cachedTeams,
  cachedMembers,
  fetchTeams,
  fetchMembers,
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

  const [localAllTeams, setLocalAllTeams] = useState<Team[]>(cachedTeams);
  const [localAllMembers, setLocalAllMembers] =
    useState<MemberSummaryDto[]>(cachedMembers);

  const [isLoadingTeams, setIsLoadingTeams] = useState(
    cachedTeams.length === 0,
  );
  const [isLoadingMembers, setIsLoadingMembers] = useState(
    cachedMembers.length === 0,
  );

  const [selectedTeams, setSelectedTeams] = useState<Team[]>([]);
  const [selectedMembers, setSelectedMembers] = useState<MemberSummaryDto[]>(
    [],
  );
  const [selectedStatuses, setSelectedStatuses] = useState<
    { label: string; value: string }[]
  >([]);

  useEffect(() => {
    if (cachedTeams.length === 0) {
      setIsLoadingTeams(true);
      fetchTeams().then((data) => {
        if (data) {
          setLocalAllTeams(data);
          setSelectedTeams(data.filter((t) => initialTeams.includes(t.idTeam)));
        }
        setIsLoadingTeams(false);
      });
    } else {
      setSelectedTeams(
        cachedTeams.filter((t) => initialTeams.includes(t.idTeam)),
      );
    }
  }, [cachedMembers, cachedTeams, fetchMembers, initialTeams, fetchTeams]);

  useEffect(() => {
    if (cachedMembers.length === 0) {
      setIsLoadingMembers(true);
      fetchMembers().then((data) => {
        if (data) {
          setLocalAllMembers(data);
          setSelectedMembers(data.filter((m) => initialMembers.includes(m.id)));
        }
        setIsLoadingMembers(false);
      });
    } else {
      setSelectedMembers(
        cachedMembers.filter((m) => initialMembers.includes(m.id)),
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    setSelectedStatuses(
      statusOptions.filter((s) => initialStatuses.includes(s.value)),
    );
  }, [initialStatuses, statusOptions]);

  // Report local state changes to parent via ref
  useEffect(() => {
    onFiltersChange({
      teams: selectedTeams.map((t) => t.idTeam),
      members: selectedMembers.map((m) => m.id),
      statuses: selectedStatuses.map((s) => s.value),
    });
  }, [selectedTeams, selectedMembers, selectedStatuses, onFiltersChange]);

  return (
    <Stack spacing="0.625rem">
      {!onlyStatusFilter && (
        <>
          <FilterAutocomplete
            options={localAllTeams}
            value={selectedTeams}
            onChange={setSelectedTeams}
            loading={isLoadingTeams}
            placeholder="Sélectionnez des équipes"
            getOptionLabel={(team) => team.name}
            getOptionId={(team) => team.idTeam}
          />
          <FilterAutocomplete
            options={localAllMembers}
            value={selectedMembers}
            onChange={setSelectedMembers}
            loading={isLoadingMembers}
            placeholder="Sélectionnez des membres"
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
          onChange={setSelectedStatuses}
          loading={false}
          placeholder="Sélectionnez des statuts"
          getOptionLabel={(status) => status.label}
          getOptionId={(status) => status.value}
        />
      )}
    </Stack>
  );
};
