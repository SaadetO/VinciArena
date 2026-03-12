import dayjs from 'dayjs';
import 'dayjs/locale/fr';

dayjs.locale('fr');

/**
 * Formats a date into a relative time string in French.
 * Examples:
 * - "il y a 5 minutes"
 * - "il y a 2 heures"
 * - "il y a 3 jours"
 * - "il y a 1 semaine et 2 jours"
 * 
 * @param date The date to format
 * @returns A formatted relative time string in French
 */
export const formatRelativeTime = (date: Date | string | number): string => {
  const now = dayjs();
  const target = dayjs(date);
  
  const diffInMinutes = now.diff(target, 'minute');
  if (diffInMinutes < 1) return "À l'instant";
  if (diffInMinutes < 60) return `Il y a ${diffInMinutes} minute${diffInMinutes > 1 ? 's' : ''}`;
  
  const diffInHours = now.diff(target, 'hour');
  if (diffInHours < 24) return `Il y a ${diffInHours} heure${diffInHours > 1 ? 's' : ''}`;
  
  const diffInDays = now.diff(target, 'day');
  if (diffInDays < 7) return `Il y a ${diffInDays} jour${diffInDays > 1 ? 's' : ''}`;
  
  const weeks = Math.floor(diffInDays / 7);
  const remainingDays = diffInDays % 7;
  
  let result = `Il y a ${weeks} semaine${weeks > 1 ? 's' : ''}`;
  if (remainingDays > 0) {
    result += ` et ${remainingDays} jour${remainingDays > 1 ? 's' : ''}`;
  }
  
  return result;
};
