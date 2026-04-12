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
  useMemo,
  useRef,
  useCallback,
  useLayoutEffect,
} from 'react';
import { UserContext } from '../../../../contexts/UserContext';
import { useSnackbar } from '../../../../hooks/useSnackbar';
import { useModal } from '../../../../hooks/useModal';
import { useModalController } from '../../../../hooks/useModalController';
import { Member } from '../../../../types';
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

  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState<'all' | 'members' | 'admins'>('all');
  const [filterVersion, setFilterVersion] = useState(0);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [displayedUserIds, setDisplayedUserIds] = useState<number[]>([]);
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
    if (!open) return;
    getAll();
    setTimeout(handleScroll, 0);
  }, [open, handleScroll, authenticatedUser?.token, getAll]);

  useLayoutEffect(() => {
    let result = users;

    if (filter === 'members') {
      result = result.filter((user) => !user.admin);
    } else if (filter === 'admins') {
      result = result.filter((user) => user.admin);
    }

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (user) =>
          user.tag.toLowerCase().includes(query) ||
          user.email.toLowerCase().includes(query),
      );
    }

    setDisplayedUserIds(result.map((u) => u.id));
  }, [searchQuery, filter, filterVersion, users]);

  const filteredUsers = useMemo(() => {
    return displayedUserIds
      .map((id) => users.find((u) => u.id === id))
      .filter((u): u is Member => !!u);
  }, [users, displayedUserIds]);

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

  const handleFilterSelect = (newFilter: 'all' | 'members' | 'admins') => {
    if (newFilter === filter) {
      setFilterVersion((v) => v + 1);
    }
    setFilter(newFilter);
    handleFilterClose();
  };

  const contentRef = useRef<HTMLDivElement>(null);
  const [contentHeight, setContentHeight] = useState<number | string>('auto');

  useLayoutEffect(() => {
    if (contentRef.current && open) {
      const height = contentRef.current.scrollHeight;
      setContentHeight(height + 2);
    }
  }, [filteredUsers.length, isGettingUsers, open, searchQuery]);

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
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
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
                    data-testid="admin-filter-button"
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
                    endIcon={<ChevronDown />}
                    onClick={handleFilterClick}
                  >
                    {filter === 'all'
                      ? 'Tous'
                      : filter === 'members'
                        ? 'Membres'
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
                    <MenuItem
                      onClick={() => handleFilterSelect('all')}
                      data-testid="filter-option-all"
                    >
                      Tous
                    </MenuItem>
                    <MenuItem
                      onClick={() => handleFilterSelect('members')}
                      data-testid="filter-option-members"
                    >
                      Membres
                    </MenuItem>
                    <MenuItem
                      onClick={() => handleFilterSelect('admins')}
                      data-testid="filter-option-admins"
                    >
                      Admins
                    </MenuItem>
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
                {filteredUsers.map((user) => (
                  <UserItem
                    key={user.id}
                    user={user}
                    handleToggleAdmin={handleToggleAdmin}
                    authenticatedUser={authenticatedUser ?? null}
                    isPending={pendingIds.includes(user.id)}
                    handleBan={handleBan}
                  />
                ))}
                {!isGettingUsers && filteredUsers.length === 0 && (
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
