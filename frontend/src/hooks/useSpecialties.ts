import { useApi } from './useApi';
import { SpecialtyDto } from '../types';
import { useSnackbar } from './useSnackbar';
import { useState } from 'react';

export const useSpecialties = () => {
  const { showSnackbar } = useSnackbar();
  const [specialties, setSpecialties] = useState<SpecialtyDto[]>([]);

  const { execute: getAll, loading: isGettingSpecialties } = useApi(
    async () => {
      const response = await fetch('/api/specialties');
      if (!response.ok) {
        throw new Error(
          `fetch error : ${response.status} : ${response.statusText}`,
        );
      }
      return response.json();
    },
    {
      onSuccess: (data) => setSpecialties(data),
      onError: () => {
        showSnackbar({
          message: 'Erreur lors de la récupération des spécialités',
          severity: 'error',
        });
        setSpecialties([]);
      },
    },
  );

  return { specialties, getAll, isGettingSpecialties };
};
