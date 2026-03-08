interface MainContext {}

interface UserContextType {
  authenticatedUser: MaybeAuthenticatedUser;
  registerUser: (newUser: User) => Promise<void>;
  loginUser: (user: User) => Promise<void>;
  clearUser: () => void;
}

interface User {
  email: string;
  password: string;
}

interface ProfileInfoDto {
  tag: string;
  avatar: string;
  email: string;
  specialty: string;
  creation_date: string;
  team: {
    id: string;
    name: string;
    isManager: boolean;
  };
}

interface AuthenticatedUser {
  username: string;
  token: string;
}

type MaybeAuthenticatedUser = AuthenticatedUser | undefined;

export type {
  MainContext,
  User,
  AuthenticatedUser,
  MaybeAuthenticatedUser,
  UserContextType,
  ProfileInfoDto,
};
