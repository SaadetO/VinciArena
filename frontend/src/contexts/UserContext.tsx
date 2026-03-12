import { createContext, useState, ReactNode, useEffect } from 'react';
import {
  MaybeAuthenticatedUser,
  UserContextType,
  User,
  AuthenticatedUser,
} from '../types';

import { clearAuthenticatedUser, getAuthenticatedUser } from '../utils/session';

const defaultUserContext: UserContextType = {
  authenticatedUser: undefined,
  registerUser: async () => {},
  loginUser: async () => {},
  clearUser: () => {},
};

const UserContext = createContext<UserContextType>(defaultUserContext);

const UserContextProvider = ({ children }: { children: ReactNode }) => {
  const [authenticatedUser, setAuthenticatedUser] =
    useState<MaybeAuthenticatedUser>(undefined);

  useEffect(() => {
    const storedUser = getAuthenticatedUser();
    if (!storedUser) return;

    (async () => {
      try {
        const response = await fetch('/api/auths/login/me', {
          headers: {
            'Content-Type': 'application/json',
            Authorization: storedUser.token,
          },
        });

        if (!response.ok) throw new Error('Failed to fetch user');

        const authenticatedUser: AuthenticatedUser = await response.json();

        setAuthenticatedUser({
          ...authenticatedUser,
        });
      } catch (err) {
        console.error('Failed to fetch user: ', err);
        clearUser();
      }
    })();
  }, []);

  const registerUser = async (newUser: User) => {
    try {
      const response = await fetch('/api/auths/register', {
        method: 'POST',
        body: JSON.stringify(newUser),
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok)
        throw new Error(
          `fetch error : ${response.status} : ${response.statusText}`,
        );
    } catch (err) {
      console.error('registerUser::error: ', err);
      throw err;
    }
  };

  const loginUser = async ({ email, password, rememberMe }: User) => {
    try {
      const response = await fetch('/api/auths/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok)
        throw new Error(
          `fetch error : ${response.status} : ${response.statusText}`,
        );

      const authenticatedUser: AuthenticatedUser = await response.json();

      // REMEMBER ME
      if (rememberMe) {
        localStorage.setItem('token', authenticatedUser.token);
      } else {
        sessionStorage.setItem('token', authenticatedUser.token);
      }

      setAuthenticatedUser(authenticatedUser);
    } catch (err) {
      console.error('loginUser::error: ', err);
      throw err;
    }
  };

  const clearUser = () => {
    clearAuthenticatedUser();
    setAuthenticatedUser(undefined);
  };

  const myContext: UserContextType = {
    authenticatedUser,
    registerUser,
    loginUser,
    clearUser,
  };

  return (
    <UserContext.Provider value={myContext}>{children}</UserContext.Provider>
  );
};

export { UserContext, UserContextProvider };
