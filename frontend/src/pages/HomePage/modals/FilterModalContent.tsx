import { useState, useEffect } from 'react';
import { Stack } from '@mui/material';
import { MemberSummaryDto, Team } from '../../../types';
import { FilterAutocomplete } from '../components/FilterAutocomplete';
interface FilterModalContentProps {
  initialTeams: number[];
  initialMembers: number[];
  cachedTeams: Team[];
  cachedMembers: MemberSummaryDto[];
  fetchTeams: () => Promise<Team[] | null>;
  fetchMembers: () => Promise<MemberSummaryDto[] | null>;
  onFiltersChange: (filters: { teams: number[]; members: number[] }) => void;
}

export const FilterModalContent = ({
  initialTeams,
  initialMembers,
  cachedTeams,
  cachedMembers,
  fetchTeams,
  fetchMembers,
  onFiltersChange,
}: FilterModalContentProps) => {
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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

  // Report local state changes to parent via ref
  useEffect(() => {
    onFiltersChange({
      teams: selectedTeams.map((t) => t.idTeam),
      members: selectedMembers.map((m) => m.id),
    });
  }, [selectedTeams, selectedMembers, onFiltersChange]);

  return (
    <Stack spacing="0.75rem">
      <FilterAutocomplete
        options={localAllTeams}
        value={selectedTeams}
        onChange={setSelectedTeams}
        loading={isLoadingTeams}
        placeholder="Rechercher une équipe..."
        getOptionLabel={(team) => team.name}
        getOptionId={(team) => team.idTeam}
      />
      <FilterAutocomplete
        options={localAllMembers}
        value={selectedMembers}
        onChange={setSelectedMembers}
        loading={isLoadingMembers}
        placeholder="Rechercher un membre..."
        getOptionLabel={(member) => member.tag}
        getOptionId={(member) => member.id}
        getOptionAvatar={(member) => member.avatar ?? undefined}
      />
    </Stack>
  );
};
