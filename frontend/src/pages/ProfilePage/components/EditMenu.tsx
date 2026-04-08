import { useState, MouseEvent, Dispatch, SetStateAction } from 'react';
import { Button, Menu, MenuItem, Typography } from '@mui/material';
import { ChevronDown } from '@gravity-ui/icons';
import { ProfileInfoDto, SpecialtyDto } from '../../../types';
import { useModal } from '../../../hooks/useModal';
import { useModalController } from '../../../hooks/useModalController';
import { useMembers } from '../../../hooks/useMembers';
import { changePasswordModal } from '../modals/changePasswordModal';
import { changeSpecialtyModal } from '../modals/changeSpecialtyModal';

export const EditMenu = ({
  user,
  setUser,
}: {
  user: ProfileInfoDto;
  setUser: Dispatch<SetStateAction<ProfileInfoDto | undefined>>;
}) => {
  const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null);
  const isOpen = menuAnchor != null;
  const { openModal } = useModal();
  const { setLoading } = useModalController();
  const { updatePassword, updateSpecialty } = useMembers({ setUser });

  const handleMenuClick = (event: MouseEvent<HTMLElement>) => {
    setMenuAnchor(event.currentTarget);
  };
  const handleMenuClose = () => {
    setMenuAnchor(null);
  };

  const handlePasswordChange = () => {
    handleMenuClose();
    let selectedPassword: string | null = null;
    const onSelect = (pwd: string | null) => {
      selectedPassword = pwd;
    };
    const onConfirm = async (close: () => void) => {
      if (!selectedPassword) return;
      setLoading(true);
      await updatePassword(selectedPassword);
      close();
    };
    openModal(changePasswordModal({ onSelect, onConfirm }));
  };

  const handleSpecialtyChange = () => {
    handleMenuClose();
    let selectedSpecialty: SpecialtyDto | null = null;
    const onSelect = (spec: SpecialtyDto | null) => {
      selectedSpecialty = spec;
    };
    const onConfirm = async (close: () => void) => {
      if (!user || !selectedSpecialty) return;
      setLoading(true);
      close();
      updateSpecialty(selectedSpecialty, user.specialty ?? '');
    };
    openModal(
      changeSpecialtyModal({
        onSelect,
        onConfirm,
        currentSpecialty: user.specialty ?? '',
      }),
    );
  };

  return (
    <>
      <Button
        variant="contained"
        color="secondary"
        onClick={handleMenuClick}
        endIcon={
          <ChevronDown
            style={{
              color: 'text.secondary',
              transition: 'transform 0.2s cubic-bezier(0.2, 0, 0, 1)',
              transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
            }}
          />
        }
      >
        Modifier
      </Button>
      <Menu
        anchorEl={menuAnchor}
        open={isOpen}
        onClose={handleMenuClose}
        sx={{
          '& .MuiPaper-root': {
            width: 'fit-content',
          },
        }}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
      >
        <MenuItem onClick={handlePasswordChange}>
          <Typography variant="h5">Modifier le Mot de passe</Typography>
        </MenuItem>
        <MenuItem onClick={handleSpecialtyChange}>
          <Typography variant="h5">Modifier la Spécialité</Typography>
        </MenuItem>
      </Menu>
    </>
  );
};
