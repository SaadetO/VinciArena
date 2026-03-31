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
import { useModal } from '../../../../hooks/useModal';
import { Member } from '../../../../types';
import { UserItem } from './components/UserItem';
import { useMembers } from '../../../../hooks/useMembers';

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
  const [, setCanScrollTop] = useState(false);
  const [, setCanScrollBottom] = useState(false);
  const usersRef = useRef(users);
  usersRef.current = users;

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
    let result = usersRef.current;

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
  }, [searchQuery, filter, filterVersion, users.length]);

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

  const handleBan = (id: number) => {
    openModal({
      title: 'Bannir un membre',
      subtitle: 'Êtes-vous sûr de vouloir bannir ce membre ?',
      confirmLabel: 'Confirmer',
      cancelLabel: 'Annuler',
      onConfirm: async (close) => {
        await banMember(id);
        close();
      },
      onCancel: (close) => close(),
    });
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
  const [, setContentHeight] = useState<number | string>('auto');

  useLayoutEffect(() => {
    if (contentRef.current && open) {
      const height = contentRef.current.scrollHeight;
      setContentHeight(height + 2);
    }
  }, [filteredUsers.length, isGettingUsers, open, searchQuery]);

  return (
    <Dialog open={open} onClose={onClose} fullWidth>
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
                      background: (theme) => theme.palette.background.s4,
                      color: (theme) =>
                        `${theme.palette.text.primary} !important`,
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

      <Stack>
        <DialogContent ref={scrollRef} onScroll={handleScroll}>
          <Stack ref={contentRef}>
            <List>
              {filteredUsers.map((user) => (
                <UserItem
                  key={user.id}
                  user={user}
                  handleToggleAdmin={handleToggleAdmin}
                  handleBan={handleBan}
                  authenticatedUser={authenticatedUser ?? null}
                  isPending={pendingIds.includes(user.id)}
                />
              ))}
            </List>
          </Stack>
        </DialogContent>
      </Stack>
    </Dialog>
  );
};
