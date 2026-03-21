import {
  createContext,
  useState,
  useEffect,
  useContext,
  ReactNode,
} from 'react';
import { NotificationDto } from '../types';
import { useApi } from '../hooks/useApi';
import { UserContext } from './UserContext';
import { useSnackbar } from '../hooks/useSnackbar';
import { useLocation } from 'react-router-dom';

interface NotificationContextProps {
  notifications: NotificationDto[];
  unreadCount: number;
  markAsRead: (idNotification: number) => void;
  getAll: () => void;
  getUnreadCount: () => void;
}

const NotificationContext = createContext<NotificationContextProps>({
  notifications: [],
  unreadCount: 0,
  markAsRead: () => {},
  getAll: () => {},
  getUnreadCount: () => {},
});

const NotificationProvider = ({ children }: { children: ReactNode }) => {
  const [notifications, setNotifications] = useState<NotificationDto[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const { authenticatedUser } = useContext(UserContext);
  const { showSnackbar } = useSnackbar();
  const { pathname } = useLocation();
  const isNotificationPage = pathname == '/notifications';

  const { execute: getAll } = useApi(
    async () => {
      const response = await fetch(`/api/notifications/member/me`, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: authenticatedUser?.token ?? '',
        },
      });
      if (!response.ok)
        throw new Error('Échec de la récupération des notifications.');
      return response.json();
    },
    {
      onSuccess: (data) => setNotifications(data),
      onError: (err) =>
        showSnackbar({
          message:
            err instanceof Error
              ? err.message
              : 'Une erreur est survenue lors de la récupération des notifications.',
          severity: 'error',
        }),
    },
  );

  const { execute: getUnreadCount } = useApi(
    async () => {
      const response = await fetch(
        `/api/notifications/member/me/unread-count`,
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: authenticatedUser?.token ?? '',
          },
        },
      );
      if (!response.ok)
        throw new Error(
          'Échec de la récupération du nombre de notifications non lues.',
        );
      return response.json();
    },
    {
      onSuccess: (data) => setUnreadCount(data),
      onError: (err) =>
        showSnackbar({
          message:
            err instanceof Error
              ? err.message
              : 'Une erreur est survenue lors de la récupération du nombre de notifications non lues.',
          severity: 'error',
        }),
    },
  );

  const { execute: markAsRead } = useApi(
    async (idNotification: number) => {
      const response = await fetch(
        `/api/notifications/${idNotification}/read`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            Authorization: authenticatedUser?.token ?? '',
          },
        },
      );
      if (!response.ok)
        throw new Error(
          'Échec de la mise à jour du statut de la notification.',
        );
    },
    {
      onOptimism: (idNotification) => {
        setNotifications((prev) =>
          prev.map((notif) =>
            notif.idNotification === idNotification
              ? { ...notif, isRead: true }
              : notif,
          ),
        );
        setUnreadCount((prev) => Math.max(0, prev - 1));
      },
      onRollback: (idNotification) => {
        setNotifications((prev) =>
          prev.map((notif) =>
            notif.idNotification === idNotification
              ? { ...notif, isRead: false }
              : notif,
          ),
        );
        setUnreadCount((prev) => prev + 1);
      },
      onSuccess: () =>
        showSnackbar({
          message: 'Notification marquée comme lue avec succès !',
          severity: 'success',
        }),
      onError: (err) =>
        showSnackbar({
          message:
            err instanceof Error
              ? err.message
              : 'Une erreur est survenue lors de la mise à jour du statut de la notification.',
          severity: 'error',
        }),
    },
  );

  useEffect(() => {
    if (authenticatedUser === undefined) return;
    if (authenticatedUser === null) {
      setNotifications([]);
      setUnreadCount(0);
      return;
    }

    // Initial fetch for navBar only
    getUnreadCount();
    if (isNotificationPage) getAll();

    // Poll every 10 seconds only the unreadCount
    const intervalId = setInterval(() => {
      getUnreadCount();
      if (isNotificationPage) getAll();
    }, 10000);

    return () => clearInterval(intervalId);
  }, [authenticatedUser, getAll, getUnreadCount, isNotificationPage]);

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        markAsRead,
        getAll,
        getUnreadCount,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export { NotificationContext, NotificationProvider };
