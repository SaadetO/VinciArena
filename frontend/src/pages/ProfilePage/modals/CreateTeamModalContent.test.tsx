import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, test, expect, vi, beforeEach } from 'vitest';
import { UserContext } from '../../../contexts/UserContext';
import { SnackbarContext } from '../../../contexts/SnackbarContext';
import { ModalControllerContext } from '../../../contexts/ModalControllerContext';
import { AuthenticatedUser, UserContextType } from '../../../types';
import { CreateTeamModalContent } from './CreateTeamModalContent';

describe('CreateTeamModalContent', () => {
  const fetchMock = vi.fn();
  const mockAuthenticatedUser: AuthenticatedUser = {
    id: 1,
    token: 'fake-token',
    admin: false,
    tag: 'test-tag',
  };

  const renderWithContext = (
    ui: React.ReactElement,
    user: AuthenticatedUser | null = null,
  ) => {
    return render(
      <UserContext.Provider
        value={
          {
            authenticatedUser: user ?? undefined,
            loginUser: vi.fn(),
            registerUser: vi.fn(),
            clearUser: vi.fn(),
          } as UserContextType
        }
      >
        <SnackbarContext.Provider value={{ showSnackbar: vi.fn() }}>
          <ModalControllerContext.Provider value={{ setConfirmDisabled: vi.fn(), setError: vi.fn() }}>
            {ui}
          </ModalControllerContext.Provider>
        </SnackbarContext.Provider>
      </UserContext.Provider>,
    );
  };

  beforeEach(() => {
    vi.resetAllMocks();
    vi.stubGlobal('fetch', fetchMock);
  });

  test('renders a form with team name input', () => {
    renderWithContext(
      <CreateTeamModalContent close={() => {}} onSuccess={() => {}} />,
    );

    expect(screen.getByPlaceholderText('Nom de Team')).toBeTruthy();
  });

  test('shows error when creating team with empty name', async () => {
    renderWithContext(
      <CreateTeamModalContent close={() => {}} onSuccess={() => {}} />,
    );

    // Form onSubmit is handled via DOM
    const form = document.getElementById('create-team-form');
    if (form) fireEvent.submit(form);

    expect(
      screen.getByText("Le nom de l'équipe ne peut pas être vide."),
    ).toBeTruthy();

    expect(fetchMock).not.toHaveBeenCalled();
  });

  test('calls fetch and close on successful team creation', async () => {
    const mockClose = vi.fn();
    const mockOnSuccess = vi.fn();

    fetchMock.mockResolvedValue({
      ok: true,
      status: 201,
      json: async () => ({ idTeam: 10, name: 'My Team' }),
    });

    renderWithContext(
      <CreateTeamModalContent
        close={mockClose}
        onSuccess={mockOnSuccess}
      />,
      mockAuthenticatedUser,
    );

    const input = screen.getByPlaceholderText('Nom de Team');
    fireEvent.change(input, { target: { value: 'My Team' } });

    const form = document.getElementById('create-team-form');
    if (form) fireEvent.submit(form);

    expect(fetchMock).toHaveBeenCalledWith('/api/teams/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'fake-token',
      },
      body: JSON.stringify({ name: 'My Team' }),
    });

    await waitFor(() => {
      expect(mockOnSuccess).toHaveBeenCalledWith({
        id: 10,
        name: 'My Team',
        isManager: true,
      });
      expect(mockClose).toHaveBeenCalled();
    });
  });

  test('shows error message on 409 conflict', async () => {
    fetchMock.mockResolvedValue({
      ok: false,
      status: 409,
    });

    renderWithContext(
      <CreateTeamModalContent close={() => {}} onSuccess={() => {}} />,
      mockAuthenticatedUser,
    );

    const input = screen.getByPlaceholderText('Nom de Team');
    fireEvent.change(input, { target: { value: 'Existing Team' } });

    const form = document.getElementById('create-team-form');
    if (form) fireEvent.submit(form);

    await waitFor(() => {
      expect(
        screen.getByText('Une équipe avec ce nom existe déjà'),
      ).toBeTruthy();
    });
  });

  test('shows generic error message on other errors (e.g. 500)', async () => {
    fetchMock.mockResolvedValue({
      ok: false,
      status: 500,
    });

    renderWithContext(
      <CreateTeamModalContent close={() => {}} onSuccess={() => {}} />,
      mockAuthenticatedUser,
    );

    const input = screen.getByPlaceholderText('Nom de Team');
    fireEvent.change(input, { target: { value: 'Failed Team' } });

    const form = document.getElementById('create-team-form');
    if (form) fireEvent.submit(form);

    await waitFor(() => {
      expect(
        screen.getByText('Erreur lors de la création de la team.'),
      ).toBeTruthy();
    });
  });
});
