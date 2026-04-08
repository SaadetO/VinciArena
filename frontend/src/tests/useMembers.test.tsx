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
  it('should fetch summaries and handle ApiError correctly', async () => {
    const mockSummaries = [{ id: 1, tag: 'Player1' }];

    // 1. Test Success
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: true,
      json: async () => mockSummaries,
    } as Response);

    const setSummaries = vi.fn();
    const { result } = renderHook(() => useMembers({ setSummaries }), {
      wrapper,
    });

    await act(async () => {
      await result.current.getAllSummaries();
    });

    expect(setSummaries).toHaveBeenCalledWith(mockSummaries);

    // 2. Test ApiError path (Status 500)
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: false,
      status: 500,
    } as Response);

    await act(async () => {
      await result.current.getAllSummaries();
    });

    // verify snackbar uses the message from the thrown ApiError
    expect(showSnackbar).toHaveBeenCalledWith(
      expect.objectContaining({
        message: 'Échec de la récupération des membres.',
        severity: 'error',
      }),
    );
  });

  it('should handle getById lifecycle: validation, success, and error mapping', async () => {
    const setError = vi.fn();
    const setUser = vi.fn();
    const { result } = renderHook(() => useMembers({ setError, setUser }), {
      wrapper,
    });

    // 1. check validation logic (id <= 0) - should not call fetch
    await act(async () => {
      await result.current.getById(0);
    });
    expect(fetch).not.toHaveBeenCalled();

    // 2. check success path
    const mockProfile = { id: 10, tag: 'User10' };
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: true,
      json: async () => mockProfile,
    } as Response);

    await act(async () => {
      await result.current.getById(10);
    });
    expect(setUser).toHaveBeenCalledWith(mockProfile);

    // 3. check error path (ApiError) and the setError object structure
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: false,
      status: 404,
    } as Response);

    await act(async () => {
      await result.current.getById(10);
    });

    expect(setError).toHaveBeenCalledWith({
      code: 404,
      message: 'Échec de la récupération du profil.',
      subtitle: 'Une erreur est survenue lors de la récupération du profil.',
    });
  });
  it('should handle updatePassword success and failure', async () => {
    const { result } = renderHook(() => useMembers(), { wrapper });

    // 1. success path: check method, body and snackbar
    vi.mocked(fetch).mockResolvedValueOnce({ ok: true } as Response);

    await act(async () => {
      await result.current.updatePassword('newPassword123');
    });

    expect(fetch).toHaveBeenCalledWith(
      '/api/members/me/password',
      expect.objectContaining({
        method: 'PATCH',
        body: JSON.stringify({ password: 'newPassword123' }),
      }),
    );

    expect(showSnackbar).toHaveBeenCalledWith(
      expect.objectContaining({
        message: 'Mot de passe modifié avec succès !',
        severity: 'success',
      }),
    );

    // 2. failure path: check error snackbar
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: false,
      status: 400,
    } as Response);

    await act(async () => {
      await result.current.updatePassword('badPass');
    });

    expect(showSnackbar).toHaveBeenCalledWith(
      expect.objectContaining({
        message: 'Échec de la mise à jour du mot de passe.',
        severity: 'error',
      }),
    );
  });
  it('should handle updateSpecialty with optimism and rollback on error', async () => {
    const setUser = vi.fn();
    const { result } = renderHook(() => useMembers({ setUser }), { wrapper });
    const newSpecialty = { id: 2, label: 'Support' };
    const oldLabel = 'Jungle';

    // 1. simulate a server error to test rollback
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: false,
      status: 500,
    } as Response);

    await act(async () => {
      await result.current.updateSpecialty(newSpecialty, oldLabel);
    });

    // check optimism: called with a function that sets the new label
    expect(setUser).toHaveBeenCalled();
    const optimismUpdate = setUser.mock.calls[0][0];
    expect(optimismUpdate({ specialty: oldLabel })).toEqual({
      specialty: 'Support',
    });

    // check rollback: called with a function that restores the old label
    const rollbackUpdate = setUser.mock.calls[1][0];
    expect(rollbackUpdate({ specialty: 'Support' })).toEqual({
      specialty: 'Jungle',
    });

    // check error feedback
    expect(showSnackbar).toHaveBeenCalledWith(
      expect.objectContaining({
        message: 'Échec de la mise à jour de la spécialité.',
        severity: 'error',
      }),
    );
  });
});
