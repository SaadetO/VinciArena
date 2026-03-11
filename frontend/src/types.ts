interface MainContext {}

interface UserContextType {
  authenticatedUser: MaybeAuthenticatedUser;
  registerUser: (newUser: User) => Promise<void>;
  loginUser: (user: User) => Promise<void>;
  clearUser: () => void;
  unreadCount: number;
}

interface User {
  email: string;
  password: string;
}

interface ProfileInfoDto {
  id: number;
  email: string | null;
  tag: string;
  specialty: string | null;
  creationDate: string | null;
  avatar: string | null;
  isAdmin: boolean | null;
  team: {
    id: number;
    name: string;
    isManager: boolean;
  } | null;
  unavailabilities:
    | {
        startDate: string;
        endDate: string;
      }[]
    | null;
}

interface AuthenticatedUser {
  id: number;
  username: string;
  token: string;
}

interface NotificationDto {
  idNotification: number;
  content: string;
  isRead: boolean;
  dateTime: Date;
}

type MaybeAuthenticatedUser = AuthenticatedUser | undefined;

export type {
  MainContext,
  User,
  AuthenticatedUser,
  MaybeAuthenticatedUser,
  UserContextType,
  ProfileInfoDto,
  NotificationDto,
};
