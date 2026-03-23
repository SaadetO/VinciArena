import { render, screen, waitFor } from '@testing-library/react';
import { useContext } from 'react';
import { describe, it, expect, vi, afterEach } from 'vitest';

import { BrowserRouter } from 'react-router-dom';
import {
  NotificationContext,
  NotificationProvider,
} from '../contexts/NotificationContext';
import { UserContext } from '../contexts/UserContext';
import { SnackbarContext } from '../contexts/SnackbarContext';
import { UserContextType } from '../types';

// clear mocks
afterEach(() => {
  vi.clearAllMocks();
});

describe('NotificationContext basic tests', () => {
  // mock SnackBarContext
  const mockSnackbarContext = {
    showSnackbar: vi.fn(),
  } as unknown as React.ContextType<typeof SnackbarContext>;

  // test component to display data from the context
  const TestDisplay = () => {
    const { allNotifications, unreadNotifications, unreadCount } =
      useContext(NotificationContext);
    return (
      <div>
        <span data-testid="list-size">{allNotifications.length}</span>
        <span data-testid="unread-size">{unreadNotifications.length}</span>
        <span data-testid="count">{unreadCount}</span>
      </div>
    );
  };

  it('starts with empty notifications and zero count', () => {
    // mock user context without token (logged out user)
    const mockUserContext = {
      authenticatedUser: null,
      setAuthenticatedUser: vi.fn(),
    } as unknown as UserContextType;

    // render test component
    render(
      <SnackbarContext.Provider value={mockSnackbarContext}>
        <UserContext.Provider value={mockUserContext}>
          <BrowserRouter>
            <NotificationProvider>
              <TestDisplay />
            </NotificationProvider>
          </BrowserRouter>
        </UserContext.Provider>
      </SnackbarContext.Provider>,
    );

    // assert notifications list sizes to 0 and unread count to be 0
    expect(screen.getByTestId('list-size').textContent).toBe('0');
    expect(screen.getByTestId('unread-size').textContent).toBe('0');
    expect(screen.getByTestId('count').textContent).toBe('0');
  });

  it('updates the list when getAll is called', async () => {
    // mock fetch from backend
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => [{ idNotification: 1, content: 'Test', isRead: false }],
    });

    // mock user with token (logged in)
    const mockUser = {
      authenticatedUser: { token: 'mock-token' },
    } as unknown as UserContextType;

    // test component with a button that triggers getAll()
    const TestTrigger = () => {
      const { allNotifications, getAll } = useContext(NotificationContext);
      return (
        <div>
          <button onClick={() => getAll(false)}>Test Click</button>
          <span data-testid="size">{allNotifications.length}</span>
        </div>
      );
    };

    // render test component
    render(
      <SnackbarContext.Provider value={mockSnackbarContext}>
        <UserContext.Provider value={mockUser}>
          <BrowserRouter>
            <NotificationProvider>
              <TestTrigger />
            </NotificationProvider>
          </BrowserRouter>
        </UserContext.Provider>
      </SnackbarContext.Provider>,
    );

    // testing hook by clicking button associated with getAll
    screen.getByText('Test Click').click();

    // assert: wait for list length to become 1
    await waitFor(() => {
      expect(screen.getByTestId('size').textContent).toBe('1');
    });
  });
});
