import {
  Alert,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
  Typography,
} from '@mui/material';
import {
  createContext,
  ReactNode,
  useState,
  useCallback,
  useMemo,
  useRef,
  useEffect,
} from 'react';
import { ModalConfig } from '../types';
import { ModalControllerContext } from './ModalControllerContext';

interface ModalContextType {
  openModal: (config: ModalConfig) => void;
  closeModal: () => void;
}

const ModalContext = createContext<ModalContextType | null>(null);

const ModalContextProvider = ({ children }: { children: ReactNode }) => {
  const [open, setOpen] = useState(false);
  const [config, setConfig] = useState<ModalConfig | null>(null);
  const [confirmDisabled, setConfirmDisabled] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const openModal = useCallback((cfg: ModalConfig) => {
    setConfirmDisabled(cfg.confirmDisabled ?? false);
    setError(null);
    setConfig(cfg);
    setOpen(true);
  }, []);

  const closeModal = useCallback(() => {
    setOpen(false);
    // small delay so the dialog animates out before clearing config
    setTimeout(() => setConfig(null), 200);
  }, []);

  /**
   * make sure that the modalContextValue is memoized
   * to prevent unnecessary re-renders of components that use it
   */
  const modalContextValue = useMemo(
    () => ({ openModal, closeModal }),
    [openModal, closeModal],
  );

  const modalControllerContextValue = useMemo(
    () => ({
      setConfirmDisabled,
      setError: (err: string | null) => {
        setError(err);
        if (err) setConfirmDisabled(true);
      },
    }),
    [],
  );

  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollTop, setCanScrollTop] = useState(false);
  const [canScrollBottom, setCanScrollBottom] = useState(false);

  const handleScroll = useCallback(() => {
    if (!scrollRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = scrollRef.current;

    setCanScrollTop(scrollTop > 5);
    setCanScrollBottom(scrollHeight - scrollTop > clientHeight + 5);
  }, []);

  useEffect(() => {
    if (open) {
      // Small delay to ensure content is rendered and measurements are accurate
      const timeout = setTimeout(handleScroll, 100);
      return () => clearTimeout(timeout);
    }
  }, [open, config, handleScroll]);

  return (
    <ModalContext.Provider value={modalContextValue}>
      <ModalControllerContext.Provider value={modalControllerContextValue}>
        {children}

        <Dialog open={open} onClose={closeModal} maxWidth="sm" fullWidth>
          <DialogTitle variant="h2">{config?.title}</DialogTitle>
          {config?.subtitle && (
            <Typography
              textAlign="center"
              padding="0 2rem 1rem"
              color="secondary"
            >
              {config?.subtitle}
            </Typography>
          )}
          <Stack
            maxHeight="20rem"
            sx={{
              position: 'relative',
              '&::before': {
                content: '""',
                display: 'block',
                position: 'absolute',
                top: 0,
                left: 0,
                height: '2rem',
                zIndex: 100,
                background: (theme) =>
                  `linear-gradient(to bottom, ${theme.palette.background.s1}, ${theme.palette.background.s1} 25%, transparent)`,
                width: '100%',
                opacity: canScrollTop ? 1 : 0,
                pointerEvents: 'none',
                transition: 'opacity 0.2s',
              },
              '&::after': {
                content: '""',
                display: 'block',
                position: 'absolute',
                bottom: 0,
                left: 0,
                height: '2rem',
                zIndex: 100,
                background: (theme) =>
                  `linear-gradient(to top, ${theme.palette.background.s1}, ${theme.palette.background.s1} 25%, transparent)`,
                width: '100%',
                opacity: canScrollBottom ? 1 : 0,
                pointerEvents: 'none',
                transition: 'opacity 0.2s',
              },
            }}
          >
            {config?.children && (
              <DialogContent
                ref={scrollRef}
                onScroll={handleScroll}
                sx={{
                  maxHeight: '25rem',
                  overflowY: 'auto',
                }}
              >
                {config.children}
              </DialogContent>
            )}
          </Stack>
          {error && (
            <Stack padding="0 1rem 1rem">
              <Alert severity="error" size="small" align="center">
                {error}
              </Alert>
            </Stack>
          )}
          <DialogActions>
            <Button
              variant="contained"
              color="secondary"
              onClick={() => {
                config?.onCancel?.(closeModal);
              }}
              fullWidth
            >
              {config?.cancelLabel ?? 'Cancel'}
            </Button>
            <Button
              variant="contained"
              onClick={() => {
                config?.onConfirm?.(closeModal);
              }}
              fullWidth
              disabled={confirmDisabled}
            >
              {config?.confirmLabel ?? 'Confirm'}
            </Button>
          </DialogActions>
        </Dialog>
      </ModalControllerContext.Provider>
    </ModalContext.Provider>
  );
};

export { ModalContext, ModalContextProvider };
