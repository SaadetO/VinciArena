import {
  createContext,
  useState,
  ReactNode,
  useEffect,
  useCallback,
  useMemo,
} from 'react';
import {
  MaybeAuthenticatedUser,
  UserContextType,
  User,
  AuthenticatedUser,
} from '../types';

import {
  clearAuthenticatedUser,
  getAuthenticatedUser,
  storeAuthenticatedUser,
} from '../utils/session';

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

  const clearUser = useCallback(() => {
    clearAuthenticatedUser();
    setAuthenticatedUser(undefined);
  }, []);

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

        const authenticatedUserData: AuthenticatedUser = await response.json();

        setAuthenticatedUser({
          ...authenticatedUserData,
        });
      } catch (err) {
        console.error('Failed to fetch user: ', err);
        clearUser();
      }
    })();
  }, [clearUser]);

  const registerUser = useCallback(async (newUser: User) => {
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
  }, []);

  const loginUser = useCallback(
    async ({ email, password, rememberMe }: User) => {
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

        const authenticatedUserData: AuthenticatedUser = await response.json();

        storeAuthenticatedUser(authenticatedUserData, rememberMe ?? false);

        setAuthenticatedUser(authenticatedUserData);
      } catch (err) {
        console.error('loginUser::error: ', err);
        throw err;
      }
    },
    [],
  );

  /**
   * make sure that the userContextValue is memoized
   * to prevent unnecessary re-renders of components that use it
   */
  const myContext: UserContextType = useMemo(
    () => ({
      authenticatedUser,
      registerUser,
      loginUser,
      clearUser,
    }),
    [authenticatedUser, registerUser, loginUser, clearUser],
  );

  return (
    <UserContext.Provider value={myContext}>{children}</UserContext.Provider>
  );
};

export { UserContext, UserContextProvider };
