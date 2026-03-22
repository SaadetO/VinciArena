import { ReactNode } from 'react';

interface MainContext {}

interface UserContextType {
  authenticatedUser: MaybeAuthenticatedUser;
  register: (
    newUser: User,
    navigate: (path: string) => void,
  ) => Promise<void | null>;
  login: (user: User, navigate: (path: string) => void) => Promise<void | null>;
  clearUser: () => void;
  isLoggingIn: boolean;
  isRegistering: boolean;
}
interface ProfilePicture {
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
  specialty: Specialty;
  profileImage: ProfilePicture;
}

interface Specialty {
  idSpecialty: number;
  label: string;
}

interface Unavailability {
  id: number;
  startDate: string;
  endDate: string;
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

interface UserSummaryDto {
  id: number;
  tag: string;
  avatar: string | null;
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
  requester: UserSummaryDto;
}

interface TeamDetailsInfoDto {
  idTeam: number;
  name: string;
  isActive: boolean;
  managers: UserSummaryDto[];
  members: UserSummaryDto[];
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

type MaybeAuthenticatedUser = AuthenticatedUser | undefined | null;

interface ModalConfig {
  title: string;
  subtitle?: string;
  children?: ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  confirmColor?:
    | 'inherit'
    | 'primary'
    | 'secondary'
    | 'success'
    | 'error'
    | 'info'
    | 'warning';
  confirmDisabled?: boolean;
  onConfirm?: (close: () => void) => void;
  onCancel?: (close: () => void) => void;
}

interface RegisterFormData {
  email: string;
  password: string;
  confirmPassword: string;
  tag: string;
  specialtyId: number | null;
  profileImageId: number | null;
}

export type {
  MainContext,
  User,
  AuthenticatedUser,
  MaybeAuthenticatedUser,
  UserContextType,
  ProfileInfoDto,
  Team,
  Unavailability,
  JoinRequestDto,
  TeamDetailsInfoDto,
  NotificationDto,
  StoredUser,
  Member,
  SpecialtyDto,
  ProfilePicture,
  ModalConfig,
  RegisterFormData,
  UserSummaryDto,
};
