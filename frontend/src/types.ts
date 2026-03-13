interface MainContext {}

interface UserContextType {
  authenticatedUser: MaybeAuthenticatedUser;
  registerUser: (newUser: User) => Promise<void>;
  loginUser: (user: User) => Promise<void>;
  clearUser: () => void;
}
interface ProfileImage {
  idImage: number;
  path: string;
}

interface User {
  email: string;
  password: string;
  rememberMe?: boolean;
}

interface Member {
  id: number;
  tag: string;
  email: string;
  admin: boolean;
  specialty: string;
  avatar: string;
}

interface ProfileInfoDto {
  id: number;
  email: string | null;
  tag: string;
  specialty: string | null;
  creationDate: string | null;
  avatar: string | null;
  admin: boolean | null;
  isSelf: boolean; // Indicates if this profile belongs to the currently logged in user
  team: {
    id: number;
    name: string;
    isManager: boolean; // Calculated based on if Member is manager1 or manager2 in Team
  } | null; // User might not have a team yet
  unavailabilities:
    | {
        id: number;
        startDate: string;
        endDate: string;
      }[]
    | null;
}

interface AuthenticatedUser {
  id: number;
  admin: boolean;
  tag: string;
  token: string;
}

interface Team {
  idTeam: number;
  name: string;
  isActive: boolean;
}

interface JoinRequestDto {
  idJoinRequest: number;
  idTeam: number;
  teamName: string;
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED';
  expirationDate: string;
  requester: ProfileInfoDto;
}

interface TeamDetailsInfoDto {
  idTeam: number;
  name: string;
  isActive: boolean;
  managers: ProfileInfoDto[];
  members: ProfileInfoDto[];
  joinRequests: JoinRequestDto[] | null;
}

interface NotificationDto {
  idNotification: number;
  content: string;
  isRead: boolean;
  dateTime: Date;
}

interface StoredUser {
  token: string;
}

interface SpecialtyDto {
  id: number;
  label: string;
}

type MaybeAuthenticatedUser = AuthenticatedUser | undefined;

export type {
  MainContext,
  User,
  AuthenticatedUser,
  MaybeAuthenticatedUser,
  UserContextType,
  ProfileInfoDto,
  Team,
  JoinRequestDto,
  TeamDetailsInfoDto,
  NotificationDto,
  StoredUser,
  Member,
  SpecialtyDto,
  ProfileImage,
};
