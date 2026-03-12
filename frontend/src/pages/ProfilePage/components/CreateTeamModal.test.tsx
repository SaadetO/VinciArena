import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, test, expect, vi, beforeEach } from 'vitest';
import { CreateTeamModal } from './CreateTeamModal';
import { getAuthenticatedUser } from '../../../utils/session';

vi.mock('../../../utils/session', () => ({
  getAuthenticatedUser: vi.fn(),
}));

describe('CreateTeamModal', () => {
  const fetchMock = vi.fn();

  // Resets all mocks in between tests
  beforeEach(() => {
    vi.resetAllMocks();
    vi.stubGlobal('fetch', fetchMock); // Replace global variable "fetch" by fetchMock in our tests
  });

  // 1.
  test('renders a form with team name input and buttons', () => {
    render(
      <CreateTeamModal open={true} onClose={() => {}} onSuccess={() => {}} />,
    );

    expect(screen.getByText('Créer une Team')).toBeTruthy();
    expect(screen.getByPlaceholderText('Nom de Team')).toBeTruthy();
    expect(screen.getByRole('button', { name: /créer/i })).toBeTruthy();
    expect(screen.getByRole('button', { name: /annuler/i })).toBeTruthy();
  });

  // 2.
  test('shows error when creating team with empty name', async () => {
    render(
      <CreateTeamModal open={true} onClose={() => {}} onSuccess={() => {}} />,
    );

    const createButton = screen.getByRole('button', { name: /créer/i });
    fireEvent.click(createButton);

    // Checks that error message is displayed for an empty team name
    expect(
      screen.getByText("Le nom de l'équipe ne peut pas être vide."),
    ).toBeTruthy();

    // Checks that fetch hasn't been called
    expect(fetchMock).not.toHaveBeenCalled();
  });

  // 3.
  test('calls fetch and onClose on successful team creation', async () => {
    const mockOnClose = vi.fn();

    // Mocks authenticated user
    vi.mocked(getAuthenticatedUser).mockReturnValue({
      token: 'fake-token',
    });

    // Mocks successfull api request
    fetchMock.mockResolvedValue({
      ok: true,
      status: 201,
      json: async () => ({ id: 10, name: 'My Team' }),
    });

    const mockOnSuccess = vi.fn();
    render(
      <CreateTeamModal
        open={true}
        onClose={mockOnClose}
        onSuccess={mockOnSuccess}
      />,
    );

    // Filling the field
    const input = screen.getByPlaceholderText('Nom de Team');
    fireEvent.change(input, { target: { value: 'My Team' } });

    // Simulate button being clicked
    const createButton = screen.getByRole('button', { name: /créer/i });
    fireEvent.click(createButton);

    // Checks API request has been made
    expect(fetchMock).toHaveBeenCalledWith('/api/teams/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'fake-token',
      },
      body: JSON.stringify({ name: 'My Team' }),
    });

    // Wait for API promise and checks that Dialog has closed
    await waitFor(() => {
      expect(mockOnClose).toHaveBeenCalled();
    });
  });

  // 4.
  test('shows error message on 409 conflict', async () => {
    vi.mocked(getAuthenticatedUser).mockReturnValue({
      token: 'fake-token',
    });

    // Mocks API request creating a conflict
    fetchMock.mockResolvedValue({
      ok: false,
      status: 409,
    });

    render(
      <CreateTeamModal open={true} onClose={() => {}} onSuccess={() => {}} />,
    );

    const input = screen.getByPlaceholderText('Nom de Team');
    fireEvent.change(input, { target: { value: 'Existing Team' } });

    const createButton = screen.getByRole('button', { name: /créer/i });
    fireEvent.click(createButton);

    // Wait for error to be displayed
    await waitFor(() => {
      expect(
        screen.getByText('Une équipe avec ce nom existe déjà'),
      ).toBeTruthy();
    });
  });

  // 5.
  test('shows generic error message on other errors (e.g. 500)', async () => {
    vi.mocked(getAuthenticatedUser).mockReturnValue({
      token: 'fake-token',
    });

    // Mocks API error 500
    fetchMock.mockResolvedValue({
      ok: false,
      status: 500,
    });

    render(
      <CreateTeamModal open={true} onClose={() => {}} onSuccess={() => {}} />,
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
