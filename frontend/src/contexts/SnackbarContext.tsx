import { createContext, useState, ReactNode, useRef, useEffect } from 'react';
import { Snackbar, Alert, AlertColor, Slide } from '@mui/material';

type SnackbarConfig = {
  message: string;
  severity?: AlertColor;
  duration?: number;
  position?: { vertical: 'bottom' | 'top'; horizontal: 'left' | 'right' | 'center' };
};

type SnackbarContextType = {
  showSnackbar: (config: SnackbarConfig) => void;
};

const SnackbarContext = createContext<SnackbarContextType | null>(null);

const SnackbarProvider = ({ children }: { children: ReactNode }) => {
  const [open, setOpen] = useState(false);
  const [config, setConfig] = useState<SnackbarConfig | null>(null);
  const timeoutRef = useRef<number | null>(null);

  const clearExistingTimeout = () => {
    if (timeoutRef.current === null) return;
    clearTimeout(timeoutRef.current);
    timeoutRef.current = null;
  };

  useEffect(() => {
    return () => clearExistingTimeout();
  }, []);

  const showSnackbar = (cfg: SnackbarConfig) => {
    clearExistingTimeout();
    if (open) {
      setOpen(false);
      timeoutRef.current = window.setTimeout(() => {
        setConfig(cfg);
        setOpen(true);
      }, 150);
    } else {
      setConfig(cfg);
      setOpen(true);
    }
  };

  const handleClose = (_: unknown, reason?: string) => {
    if (reason === 'clickaway') return;
    setOpen(false);
  };

  return (
    <SnackbarContext.Provider value={{ showSnackbar }}>
      {children}

      <Slide direction="up" in={open}>
        <Snackbar
          open={open}
          autoHideDuration={config?.duration ?? null}
          onClose={handleClose}
          anchorOrigin={{
            vertical: config?.position?.vertical ?? 'bottom',
            horizontal: config?.position?.horizontal ?? 'left',
          }}
        >
          <Alert
            severity={config?.severity ?? 'info'}
            onClose={handleClose}
            sx={{
              minWidth: '20rem',
            }}
          >
            {config?.message}
          </Alert>
        </Snackbar>
      </Slide>
    </SnackbarContext.Provider>
  );
};

export { SnackbarContext, SnackbarProvider };
