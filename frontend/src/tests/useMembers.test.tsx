import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useMembers } from '../hooks/useMembers';
import { UserContext } from '../contexts/UserContext';
import { SnackbarContext } from '../contexts/SnackbarContext';
import {
  AuthenticatedUser,
  Member,
  ProfilePicture,
  UserContextType,
} from '../types';
import React from 'react';

// setup mock user and a member for admin tests
const mockUser: AuthenticatedUser = {
  id: 1,
  tag: 'Admin',
  token: 'Bearer token',
  admin: true,
};

const mockMember: Member = {
  id: 10,
  tag: 'TargetUser',
  email: 'test@mail.com',
  admin: false,
  deleted: false,
  specialty: { idSpecialty: 1, label: 'specialty' },
  profileImage: { idImage: 1, path: 'path' },
};

describe('useMembers hook', () => {
  const showSnackbar = vi.fn();

  const mockUserContextValue: UserContextType = {
    authenticatedUser: mockUser,
    isLoggingIn: false,
    isRegistering: false,
    login: vi.fn(),
    register: vi.fn(),
    clearUser: vi.fn(),
    setAuthenticatedUser: vi.fn(),
  };

  const mockSnackbarContextValue = { showSnackbar };

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <UserContext.Provider value={mockUserContextValue}>
      <SnackbarContext.Provider value={mockSnackbarContextValue}>
        {children}
      </SnackbarContext.Provider>
    </UserContext.Provider>
  );

  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn());
    vi.clearAllMocks();
  });

  it('should fetch all members and update state', async () => {
    // mock successful list retrieval
    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      json: async () => [mockMember],
    } as Response);

    const setUsers = vi.fn();
    const { result } = renderHook(() => useMembers({ setUsers }), { wrapper });

    await act(async () => {
      await result.current.getAll();
    });

    expect(setUsers).toHaveBeenCalledWith([mockMember]);
  });

  it('should handle optimistic avatar update and rollback on 500', async () => {
    // simulate server crash
    vi.mocked(fetch).mockResolvedValue({ ok: false, status: 500 } as Response);

    const setUser = vi.fn();
    const { result } = renderHook(() => useMembers({ setUser }), { wrapper });

    await act(async () => {
      await result.current.updateAvatar(
        { path: 'new-path' } as ProfilePicture,
        'old-path',
      );
    });

    // optimism -> set new path
    expect(setUser).toHaveBeenCalledWith(expect.any(Function));
    const optimismFn = setUser.mock.calls[0][0];
    expect(optimismFn({ avatar: 'old-path' })).toEqual({ avatar: 'new-path' });

    // rollback -> revert to old path
    const rollbackFn = setUser.mock.calls[1][0];
    expect(rollbackFn({ avatar: 'new-path' })).toEqual({ avatar: 'old-path' });

    expect(showSnackbar).toHaveBeenCalledWith(
      expect.objectContaining({ severity: 'error' }),
    );
  });

  it('should manage pending IDs during ban process', async () => {
    // mock successful ban
    vi.mocked(fetch).mockResolvedValue({ ok: true } as Response);

    const setPendingIds = vi.fn();
    const { result } = renderHook(() => useMembers({ setPendingIds }), {
      wrapper,
    });

    await act(async () => {
      await result.current.banMember(10);
    });

    // verify id in pending list
    const addIdFn = setPendingIds.mock.calls[0][0];
    expect(addIdFn([])).toContain(10);

    // verify id was removed after success
    const removeIdFn = setPendingIds.mock.calls[1][0];
    expect(removeIdFn([10])).not.toContain(10);
  });

  it('should toggle admin status optimistically', async () => {
    vi.mocked(fetch).mockResolvedValue({ ok: true } as Response);

    const setUsers = vi.fn();
    const { result } = renderHook(() => useMembers({ setUsers }), { wrapper });

    await act(async () => {
      await result.current.toggleAdmin(10, false); // promote user to admin
    });

    // check if optimism function changed the boolean
    const updateFn = setUsers.mock.calls[0][0];
    const updatedList = updateFn([mockMember]);
    expect(updatedList[0].admin).toBe(true);

    expect(showSnackbar).toHaveBeenCalledWith(
      expect.objectContaining({
        message: "Membre promu au rang d'administrateur avec succès !",
      }),
    );
  });
});
