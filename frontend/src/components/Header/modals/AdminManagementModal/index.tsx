import {
  Button,
  Dialog,
  DialogContent,
  DialogTitle,
  List,
  Menu,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { ChevronDown } from '@gravity-ui/icons';
import {
  useContext,
  useEffect,
  useState,
  useRef,
  useCallback,
  useLayoutEffect,
} from 'react';
import { UserContext } from '../../../../contexts/UserContext';
import { useSnackbar } from '../../../../hooks/useSnackbar';
import { useModal } from '../../../../hooks/useModal';
import { useModalController } from '../../../../hooks/useModalController';
import { Member, MemberFilters, MemberQueryStatus } from '../../../../types';
import { UserItem } from './components/UserItem';
import { useMembers } from '../../../../hooks/useMembers';
import { banModal } from '../banModal';

interface AdminManagementModalProps {
  open: boolean;
  onClose: () => void;
}

export const AdminManagementModal = ({
  open,
  onClose,
}: AdminManagementModalProps) => {
  const { authenticatedUser } = useContext(UserContext);
  const { showSnackbar } = useSnackbar();
  const { openModal } = useModal();
  const { setLoading } = useModalController();

  const [users, setUsers] = useState<Member[]>([]);
  const [pendingIds, setPendingIds] = useState<number[]>([]);
  const { getAll, toggleAdmin, isGettingUsers, banMember } = useMembers({
    setUsers,
    setPendingIds,
  });

  const [filters, setFilters] = useState<MemberFilters>({
    status: undefined,
    searchQuery: undefined,
  });
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollTop, setCanScrollTop] = useState(false);
  const [canScrollBottom, setCanScrollBottom] = useState(false);
  const [debouncedSearch, setDebouncedSearch] = useState(filters.searchQuery);

  const handleScroll = useCallback(() => {
    if (!scrollRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = scrollRef.current;
    setCanScrollTop(scrollTop > 5);
    setCanScrollBottom(scrollHeight - scrollTop > clientHeight + 5);
  }, []);

  useEffect(() => {
    if (!open) return;
    console.log('Fetching members: ', filters);
    getAll(filters);
    setTimeout(handleScroll, 0);
  }, [open, handleScroll, authenticatedUser?.token, getAll, filters]);

  useEffect(() => {
    if (debouncedSearch === '') {
      setFilters((prev) => ({ ...prev, searchQuery: '' }));
      return;
    }

    const timer = setTimeout(() => {
      setFilters((prev) => ({ ...prev, searchQuery: debouncedSearch }));
    }, 400);
    return () => clearTimeout(timer);
  }, [debouncedSearch]);

  const handleToggleAdmin = async (user: Member) => {
    if (user.id === authenticatedUser?.id) {
      showSnackbar({
        message: "Vous ne pouvez pas changer votre propre statut d'admin.",
        severity: 'error',
      });
      return;
    }

    if (pendingIds.includes(user.id)) return;

    toggleAdmin(user.id, user.admin);
  };

  const handleBan = (id: number, tag: string) => {
    openModal(
      banModal({
        tag,
        onConfirm: async (close) => {
          setLoading(true);
          await banMember(id);
          close();
        },
      }),
    );
  };

  const handleFilterClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleFilterClose = () => {
    setAnchorEl(null);
  };

  const handleFilterSelect = (newFilter: MemberQueryStatus | undefined) => {
    if (newFilter === filters.status) return;
    setFilters({ ...filters, status: newFilter });
    handleFilterClose();
  };

  const getMemberStatusLabel = (
    status: MemberQueryStatus | undefined,
  ): string => {
    switch (status) {
      case MemberQueryStatus.ADMIN:
        return 'Admins';
      case MemberQueryStatus.MEMBER:
        return 'Membres';
      case MemberQueryStatus.BANNED:
        return 'Bannis';
      default:
        return 'Tous';
    }
  };

  const contentRef = useRef<HTMLDivElement>(null);
  const [contentHeight, setContentHeight] = useState<number | string>('auto');

  useLayoutEffect(() => {
    if (contentRef.current && open) {
      const height = contentRef.current.scrollHeight;
      setContentHeight(height + 2);
    }
  }, [isGettingUsers, open]);

  const getFilterOptions = () => {
    return [
      undefined,
      ...(Object.values(MemberQueryStatus) as MemberQueryStatus[]),
    ].filter((status) => status !== filters.status);
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth>
      <DialogTitle variant="h2">Gérer les Membres</DialogTitle>
      <Typography textAlign="center" color="secondary" padding="0 2rem 1rem">
        Recherchez et gérez les privilèges d'administrateur
      </Typography>

      <Stack sx={{ padding: '0 1rem' }}>
        <TextField
          placeholder="Rechercher par tag ou email..."
          fullWidth
          value={debouncedSearch}
          onChange={(e) => setDebouncedSearch(e.target.value)}
          sx={{
            '& .MuiInputBase-root': {
              paddingRight: '0.375rem',
            },
            '& .MuiInputBase-input': {
              height: '2.75rem',
              fontSize: '1rem',
              padding: '0 0.375rem 0 1rem',
            },
          }}
          slotProps={{
            input: {
              endAdornment: (
                <>
                  <Button
                    sx={{
                      flexShrink: 0,
                      maxWidth: 'none',
                      marginRight: '0 !important',
                      width: 'fit-content !important',
                      background: (theme) => theme.palette.background.s4,
                      color: (theme) =>
                        `${theme.palette.text.primary} !important`,
                    }}
                    variant="contained"
                    color="secondary"
                    endIcon={
                      <ChevronDown
                        style={{
                          rotate: anchorEl ? '180deg' : '0deg',
                          transition: 'rotate 0.2s cubic-bezier(0.2, 0, 0, 1)',
                        }}
                      />
                    }
                    onClick={handleFilterClick}
                  >
                    {filters.status === undefined
                      ? 'Tous'
                      : filters.status === MemberQueryStatus.MEMBER
                        ? 'Membres'
                        : filters.status === MemberQueryStatus.BANNED
                          ? 'Bannis'
                          : 'Admins'}
                  </Button>
                  <Menu
                    anchorEl={anchorEl}
                    open={Boolean(anchorEl)}
                    anchorOrigin={{
                      vertical: 'bottom',
                      horizontal: 'right',
                    }}
                    transformOrigin={{
                      vertical: 'top',
                      horizontal: 'right',
                    }}
                    sx={{
                      '& .MuiPaper-root': {
                        width: 'fit-content',
                      },
                    }}
                    onClose={handleFilterClose}
                  >
                    {getFilterOptions().map((status) => (
                      <MenuItem
                        key={status || 'ALL'}
                        onClick={() => handleFilterSelect(status)}
                      >
                        {getMemberStatusLabel(status)}
                      </MenuItem>
                    ))}
                  </Menu>
                </>
              ),
            },
          }}
        />
      </Stack>

      <Stack
        sx={{
          position: 'relative',
          '&::before': {
            content: '""',
            display: 'block',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '2rem',
            zIndex: 10,
            background: (theme) =>
              `linear-gradient(to bottom, ${theme.palette.background.s1}, transparent)`,
            opacity: canScrollTop ? 1 : 0,
            pointerEvents: 'none',
          },
          '&::after': {
            content: '""',
            display: 'block',
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            height: '2rem',
            zIndex: 10,
            background: (theme) =>
              `linear-gradient(to top, ${theme.palette.background.s1}, transparent)`,
            opacity: canScrollBottom ? 1 : 0,
            pointerEvents: 'none',
          },
        }}
      >
        <DialogContent
          ref={scrollRef}
          onScroll={handleScroll}
          sx={{
            maxHeight: '22rem',
            height: contentHeight,
            overflowY: 'auto',
            padding: 0,
            transition: 'height 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          }}
        >
          <Stack ref={contentRef} sx={{ padding: '0.75rem 1rem' }}>
            {isGettingUsers ? (
              <List disablePadding sx={{ height: '100%' }}>
                {Array.from({ length: 4 }).map((_, index) => (
                  <UserItem
                    key={index}
                    user={null}
                    handleToggleAdmin={() => {}}
                    authenticatedUser={null}
                    isPending={false}
                    handleBan={handleBan}
                  />
                ))}
              </List>
            ) : (
              <List disablePadding sx={{ height: '100%' }}>
                {users.map((user) => (
                  <UserItem
                    key={user.id}
                    user={user}
                    handleToggleAdmin={handleToggleAdmin}
                    authenticatedUser={authenticatedUser ?? null}
                    isPending={pendingIds.includes(user.id)}
                    handleBan={handleBan}
                  />
                ))}
                {!isGettingUsers && users.length === 0 && (
                  <Stack
                    padding="2rem 1.5rem"
                    spacing="0.25rem"
                    alignItems="center"
                    justifyContent="center"
                    height="100%"
                  >
                    <Typography variant="h5" textAlign="center">
                      Aucun membre correspondant
                    </Typography>
                    <Typography
                      variant="body2"
                      textAlign="center"
                      width="14rem"
                      color="text.secondary"
                    >
                      Essayez de modifier votre recherche
                    </Typography>
                  </Stack>
                )}
              </List>
            )}
          </Stack>
        </DialogContent>
      </Stack>
    </Dialog>
  );
};
