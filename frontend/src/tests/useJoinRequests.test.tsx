import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useJoinRequests } from '../hooks/useJoinRequests';
import { UserContext } from '../contexts/UserContext';
import { SnackbarContext } from '../contexts/SnackbarContext';
import { AuthenticatedUser, JoinRequestDto, UserContextType } from '../types';
import React from 'react';

const mockUser: AuthenticatedUser = {
  id: 1,
  tag: 'Player1',
  token: 'Bearer mock-token',
  admin: false,
};

const mockJoinRequest: JoinRequestDto = {
  idJoinRequest: 10,
  requester: {
    id: 5,
    tag: 'NewPlayer',
    avatar: 'avatar',
  },
  status: 'PENDING',
  idTeam: 0,
  teamName: '',
  expirationDate: '',
};

describe('useJoinRequests hook', () => {
  const showSnackbar = vi.fn();

  // full context to avoid "as any" usage
  const mockUserContextValue: UserContextType = {
    authenticatedUser: mockUser,
    isLoggingIn: false,
    isRegistering: false,
    login: vi.fn(),
    register: vi.fn(),
    clearUser: vi.fn(),
    setAuthenticatedUser: vi.fn(),
  };

  const mockSnackbarContextValue = {
    showSnackbar,
  };

  // inject contexts to a test compontent so the hook can use tokens and snackbars
  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <UserContext.Provider value={mockUserContextValue}>
      <SnackbarContext.Provider value={mockSnackbarContextValue}>
        {children}
      </SnackbarContext.Provider>
    </UserContext.Provider>
  );

  beforeEach(() => {
    // replace browser fetch with vitest stub
    vi.stubGlobal('fetch', vi.fn());
    vi.clearAllMocks();
  });

  it('should create a join request successfully', async () => {
    // simulate server saying everything is ok
    vi.mocked(fetch).mockResolvedValue({ ok: true } as Response);

    const { result } = renderHook(() => useJoinRequests(), { wrapper });

    await act(async () => {
      await result.current.createJoinRequest(1);
    });

    // verify correct endpoint and method
    expect(fetch).toHaveBeenCalledWith(
      '/api/teams/1/join-requests',
      expect.objectContaining({ method: 'POST' }),
    );

    expect(showSnackbar).toHaveBeenCalledWith(
      expect.objectContaining({
        message: 'Demande effectuée avec succès !',
        severity: 'success',
      }),
    );
  });

  it('should trigger optimistic update and handle 404 error with specific message', async () => {
    // simulate server error
    vi.mocked(fetch).mockResolvedValue({
      ok: false,
      status: 404,
    } as Response);

    const setTeam = vi.fn();
    const { result } = renderHook(() => useJoinRequests({ setTeam }), {
      wrapper,
    });

    await act(async () => {
      await result.current.updateJoinRequestStatus(
        mockJoinRequest,
        'ACCEPTED',
        undefined,
      );
    });

    // check if it tried to update ui before server answered
    expect(setTeam).toHaveBeenCalled();

    // verify error
    expect(showSnackbar).toHaveBeenCalledWith(
      expect.objectContaining({
        severity: 'error',
      }),
    );
  });
});
