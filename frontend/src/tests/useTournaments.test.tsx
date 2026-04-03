import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import { UserContext } from '../contexts/UserContext';
import { SnackbarContext } from '../contexts/SnackbarContext';
import { BrowserRouter } from 'react-router-dom';
import { ReactNode } from 'react';
import { UserContextType } from '../types';
import { useTournament } from '../hooks/useTournaments';

/**
 * 1. MOCK INFRASTRUCTURE
 * We define these at the top level so they are available to the wrapper
 * and all test blocks.
 */
const mockShowSnackbar = vi.fn();
const mockNavigate = vi.fn();

// Mock useNavigate from react-router-dom
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return { ...actual, useNavigate: () => mockNavigate };
});

// 2. CONTEXT MOCKS
// Fully typed mock to satisfy UserContextType
const AUTH_USER: UserContextType = {
  authenticatedUser: {
    token: 'mock-token',
    id: 1,
    admin: true,
    tag: 'ADMIN#0001',
  },
  register: vi.fn(),
  login: vi.fn(),
  clearUser: vi.fn(),
  isLoggingIn: false,
  isRegistering: false,
  setAuthenticatedUser: vi.fn(),
};

const mockSnackbarContext = {
  showSnackbar: mockShowSnackbar,
} as unknown as NonNullable<React.ContextType<typeof SnackbarContext>>;

const wrapper = ({ children }: { children: ReactNode }) => (
  <SnackbarContext.Provider value={mockSnackbarContext}>
    <UserContext.Provider value={AUTH_USER}>
      <BrowserRouter>{children}</BrowserRouter>
    </UserContext.Provider>
  </SnackbarContext.Provider>
);

afterEach(() => {
  vi.clearAllMocks();
});

describe('useTournament basic tests', () => {
  it('calls getAll with correct query parameters', async () => {
    // Mock successful fetch
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => [{ idTournament: 1, name: 'Test' }],
    } as Response);

    const setTournaments = vi.fn();
    const { result } = renderHook(() => useTournament({ setTournaments }), {
      wrapper,
    });

    await act(async () => {
      await result.current.getAll({
        statuses: ['DONE'],
        members: [123],
        teams: undefined,
        searchQuery: 'Pro',
      });
    });

    // Verify the URL construction
    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining(
        '/api/tournaments?statuses=DONE&membersIds=123&search=Pro',
      ),
    );
    expect(setTournaments).toHaveBeenCalledWith([
      { idTournament: 1, name: 'Test' },
    ]);
  });

  it('navigates to the tournament page after successful creation', async () => {
    const mockData = { idTournament: 99, name: 'New Tournament' };
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => mockData,
    } as Response);

    const onSuccess = vi.fn();
    const { result } = renderHook(() => useTournament({ onSuccess }), {
      wrapper,
    });

    await act(async () => {
      await result.current.create({ name: 'New Tournament' });
    });

    expect(onSuccess).toHaveBeenCalledWith(mockData);
    expect(mockNavigate).toHaveBeenCalledWith('/tournaments/99');
  });

  it('optimistically updates the status when publishing', async () => {
    const setTournament = vi.fn();

    // Strictly type the resolver to avoid "Unexpected any"
    let resolveFetch: (value: Response | PromiseLike<Response>) => void;

    global.fetch = vi.fn().mockImplementation(
      () =>
        new Promise<Response>((res) => {
          resolveFetch = res;
        }),
    );

    const { result } = renderHook(() => useTournament({ setTournament }), {
      wrapper,
    });

    // Trigger publish
    act(() => {
      result.current.publish(1);
    });

    /**
     * OPTIMISM CHECK:
     * We expect setTournament to be called with a function (the state updater)
     * before the API call has actually finished.
     */
    expect(setTournament).toHaveBeenCalledWith(expect.any(Function));

    // Simulate API success
    await act(async () => {
      resolveFetch({
        ok: true,
        json: async () => ({ idTournament: 1, status: 'REGISTRATION_OPEN' }),
      } as Response);
    });

    expect(mockShowSnackbar).toHaveBeenCalledWith(
      expect.objectContaining({
        severity: 'success',
      }),
    );
  });

  it('shows error snackbar when getById fails', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 404,
    } as Response);

    const setError = vi.fn();
    const { result } = renderHook(() => useTournament({ setError }), {
      wrapper,
    });

    await act(async () => {
      await result.current.getById(404);
    });

    expect(setError).toHaveBeenCalledWith(
      expect.objectContaining({
        code: 404,
        message: 'Tournoi introuvable',
      }),
    );
  });
});
