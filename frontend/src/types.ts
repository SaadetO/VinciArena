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
  id: number;
  email: string | null;
  tag: string;
  specialty: string | null;  // Corresponding to Member's Speciality entity
  creation_date: string | null;     // ISO Date string
  avatar: string | null;            // URL or base64 from ProfileImage entity
  isAdmin: boolean | null;
  team: {
    id: number;
    name: string;
    isManager: boolean;      // Calculated based on if Member is manager1 or manager2 in Team
  } | null;                  // User might not have a team yet
  unavailabilities: {
    startDate: string;
    endDate: string;
  }[] | null;
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
