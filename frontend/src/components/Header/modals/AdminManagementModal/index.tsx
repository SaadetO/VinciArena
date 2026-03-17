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
import { ArrowDropDown } from '@mui/icons-material';
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
import { Member } from '../../../../types';
import { UserItem } from './components/UserItem';

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
  const [users, setUsers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [pendingIds, setPendingIds] = useState<number[]>([]);
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
    if (open) {
      const fetchUsers = async () => {
        setLoading(true);
        try {
          const response = await fetch('/api/members', {
            headers: { Authorization: authenticatedUser?.token ?? '' },
          });
          if (response.ok) {
            setUsers(await response.json());
          }
        } catch (err) {
          console.error('Failed to fetch users', err);
        } finally {
          setLoading(false);
          // Small delay for content rendering before scroll check
          setTimeout(handleScroll, 100);
        }
      };
      fetchUsers();
    }
  }, [open, authenticatedUser?.token, handleScroll]);

  useLayoutEffect(() => {
    // Only update the list membership when search, filter, or total count changes
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
  }, [users, searchQuery, filter, filterVersion]);

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

    setPendingIds((prev) => [...prev, user.id]);
    const previousUsers = [...users];
    // Optimistic update
    setUsers((prev) =>
      prev.map((u) => (u.id === user.id ? { ...u, admin: !u.admin } : u)),
    );

    try {
      const response = await fetch(`/api/members/toggle-admin/${user.id}`, {
        method: 'PUT',
        headers: {
          Authorization: authenticatedUser?.token ?? '',
        },
      });

      if (!response.ok) throw new Error();

      showSnackbar({
        message: user.admin
          ? 'Utilisateur rétrogradé avec succès !'
          : 'Utilisateur promu admin avec succès !',
        severity: 'success',
      });
    } catch (err) {
      setUsers(previousUsers);
      showSnackbar({
        message: 'Une erreur est survenue.',
        severity: 'error',
      });
    } finally {
      setPendingIds((prev) => prev.filter((id) => id !== user.id));
    }
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

  // Dynamic height animation
  const contentRef = useRef<HTMLDivElement>(null);
  const [contentHeight, setContentHeight] = useState<number | string>('auto');

  useLayoutEffect(() => {
    if (contentRef.current && open) {
      const height = contentRef.current.scrollHeight;
      setContentHeight(height + 2); // 2px buffer for rounding
    }
  }, [filteredUsers.length, loading, open, searchQuery]);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle variant="h2">Gérer les Membres</DialogTitle>
      <Typography textAlign="center" color="secondary" sx={{ mb: 2 }}>
        Recherchez et gérez les privilèges d'administrateur
      </Typography>

      <Stack sx={{ padding: '0 1rem' }}>
        <TextField
          placeholder="Rechercher par tag ou email..."
          fullWidth
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          sx={{
            '& .MuiInputBase-input': {
              padding: '0 0.5rem 0 1rem',
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
                      width: 'fit-content !important',
                      color: (theme) =>
                        `${theme.palette.text.primary} !important`,
                      textTransform: 'none',
                    }}
                    variant="contained"
                    color="secondary"
                    endIcon={<ArrowDropDown />}
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
                    sx={{
                      '& .MuiPaper-root': {
                        width: 'fit-content',
                      },
                    }}
                    onClose={handleFilterClose}
                  >
                    <MenuItem onClick={() => handleFilterSelect('all')}>
                      Tous
                    </MenuItem>
                    <MenuItem onClick={() => handleFilterSelect('members')}>
                      Membres
                    </MenuItem>
                    <MenuItem onClick={() => handleFilterSelect('admins')}>
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
              `linear-gradient(to bottom, ${theme.palette.background.s1}, ${theme.palette.background.s1} 25%, transparent)`,
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
            right: 0,
            height: '2rem',
            zIndex: 10,
            background: (theme) =>
              `linear-gradient(to top, ${theme.palette.background.s1}, ${theme.palette.background.s1} 25%, transparent)`,
            opacity: canScrollBottom ? 1 : 0,
            pointerEvents: 'none',
            transition: 'opacity 0.2s',
          },
        }}
      >
        <DialogContent
          ref={scrollRef}
          onScroll={handleScroll}
          sx={{
            maxHeight: '20rem',
            height: contentHeight,
            overflowY: 'auto',
            padding: 0,
            transition: 'height 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          }}
        >
          <Stack ref={contentRef} sx={{ padding: '1rem' }}>
            {loading ? (
              <List disablePadding sx={{ height: '100%' }}>
                {[...Array(4)].map((_, index) => (
                  <UserItem
                    key={index}
                    user={null}
                    handleToggleAdmin={() => {}}
                    authenticatedUser={null}
                    isPending={false}
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
                  />
                ))}
                {!loading && filteredUsers.length === 0 && (
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
