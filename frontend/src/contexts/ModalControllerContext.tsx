import { createContext } from "react";

interface ModalController {
  setConfirmDisabled: (disabled: boolean) => void;
  setError: (error: string | null) => void;
};

export const ModalControllerContext = createContext<ModalController | null>(null);

