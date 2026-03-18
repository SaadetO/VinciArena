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
    setAuthenticatedUser(null);
  }, []);

  useEffect(() => {
    // store a mounted state to trigger the effect only when
    // the component is mounted and prevent the function
    // from running after the component has unmounted
    let isMounted = true;
    const storedUser = getAuthenticatedUser();
    if (!storedUser) {
      setAuthenticatedUser(null);
      return;
    }

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

        // if the component is still mounted, update the state
        if (isMounted) {
          setAuthenticatedUser({
            ...authenticatedUserData,
          });
        }
      } catch (err) {
        console.error('Failed to fetch user: ', err);
        // if the component is still mounted, clear the user
        if (isMounted) clearUser();
      }
    })();

    return () => {
      isMounted = false;
    };
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
