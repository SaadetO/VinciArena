import { StoredUser } from '../types';

const storeAuthenticatedUser = () => {};

const getAuthenticatedUser = (): StoredUser | undefined => {
  const token =
    localStorage.getItem('token') || sessionStorage.getItem('token');

  if (!token) return undefined;

  return { token };
};

const clearAuthenticatedUser = () => {
  localStorage.removeItem('token');
  sessionStorage.removeItem('token');
};

export { storeAuthenticatedUser, getAuthenticatedUser, clearAuthenticatedUser };
