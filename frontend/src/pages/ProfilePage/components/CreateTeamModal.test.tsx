import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, test, expect, vi, beforeEach } from 'vitest';
import { CreateTeamModal } from './CreateTeamModal';
import { UserContext } from '../../../contexts/UserContext';
import { AuthenticatedUser } from '../../../types';

describe('CreateTeamModal', () => {
  const fetchMock = vi.fn();
  const mockAuthenticatedUser: AuthenticatedUser = {
    id: 1,
    token: 'fake-token',
    isAdmin: false,
    tag: 'test-tag',
  };

  const renderWithContext = (ui: React.ReactElement, user: any = null) => {
    return render(
      <UserContext.Provider
        value={
          {
            authenticatedUser: user,
            loginUser: vi.fn(),
            registerUser: vi.fn(),
            clearUser: vi.fn(),
          } as any
        }
      >
        {ui}
      </UserContext.Provider>,
    );
  };

  beforeEach(() => {
    vi.resetAllMocks();
    vi.stubGlobal('fetch', fetchMock);
  });

  test('renders a form with team name input and buttons', () => {
    renderWithContext(
      <CreateTeamModal open={true} onClose={() => {}} onSuccess={() => {}} />,
    );

    expect(screen.getByText('Créer une Team')).toBeTruthy();
    expect(screen.getByPlaceholderText('Nom de Team')).toBeTruthy();
    expect(screen.getByRole('button', { name: /créer/i })).toBeTruthy();
    expect(screen.getByRole('button', { name: /annuler/i })).toBeTruthy();
  });

  test('shows error when creating team with empty name', async () => {
    renderWithContext(
      <CreateTeamModal open={true} onClose={() => {}} onSuccess={() => {}} />,
    );

    const createButton = screen.getByRole('button', { name: /créer/i });
    fireEvent.click(createButton);

    expect(
      screen.getByText("Le nom de l'équipe ne peut pas être vide."),
    ).toBeTruthy();

    expect(fetchMock).not.toHaveBeenCalled();
  });

  test('calls fetch and onClose on successful team creation', async () => {
    const mockOnClose = vi.fn();
    const mockOnSuccess = vi.fn();

    fetchMock.mockResolvedValue({
      ok: true,
      status: 201,
      json: async () => ({ idTeam: 10, name: 'My Team' }),
    });

    renderWithContext(
      <CreateTeamModal
        open={true}
        onClose={mockOnClose}
        onSuccess={mockOnSuccess}
      />,
      mockAuthenticatedUser,
    );

    const input = screen.getByPlaceholderText('Nom de Team');
    fireEvent.change(input, { target: { value: 'My Team' } });

    const createButton = screen.getByRole('button', { name: /créer/i });
    fireEvent.click(createButton);

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
      expect(mockOnClose).toHaveBeenCalled();
    });
  });

  test('shows error message on 409 conflict', async () => {
    fetchMock.mockResolvedValue({
      ok: false,
      status: 409,
    });

    renderWithContext(
      <CreateTeamModal open={true} onClose={() => {}} onSuccess={() => {}} />,
      mockAuthenticatedUser,
    );

    const input = screen.getByPlaceholderText('Nom de Team');
    fireEvent.change(input, { target: { value: 'Existing Team' } });

    const createButton = screen.getByRole('button', { name: /créer/i });
    fireEvent.click(createButton);

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
      <CreateTeamModal open={true} onClose={() => {}} onSuccess={() => {}} />,
      mockAuthenticatedUser,
    );

    const input = screen.getByPlaceholderText('Nom de Team');
    fireEvent.change(input, { target: { value: 'Failed Team' } });

    const createButton = screen.getByRole('button', { name: /créer/i });
    fireEvent.click(createButton);

    await waitFor(() => {
      expect(
        screen.getByText('Erreur lors de la création de la team.'),
      ).toBeTruthy();
    });
  });
});
