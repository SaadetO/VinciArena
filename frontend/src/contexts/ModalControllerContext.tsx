import { createContext } from 'react';

interface ModalController {
  setError: (error: string | null) => void;
}

export const ModalControllerContext = createContext<ModalController | null>(
  null,
);
