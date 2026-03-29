import dayjs from 'dayjs';
import { TournamentDto } from '../types';

export interface MonthGroup {
  month: string;
  monthNumber: number;
  tournaments: TournamentDto[];
}

export interface YearGroup {
  year: string;
  yearNumber: number;
  monthsData: MonthGroup[];
}

export interface TournamentFilters {
  searchQuery: string;
  teams: string[];
  members: string[];
  timeFrame: 'past' | 'current' | 'future';
}

/**
 * Groups tournaments by year and month.
 * @param {TournamentDto[]} tournaments The tournaments to group.
 * @return {YearGroup[]} An array of year groups.
 */
export const groupTournamentsByYearAndMonth = (
  tournaments: TournamentDto[],
): YearGroup[] => {
  const grouped = tournaments.reduce(
    (acc, tournament) => {
      const date = new Date(tournament.startDate);
      const year = date.getFullYear().toString();

      const monthKey = date.toLocaleDateString('fr-FR', { month: 'long' });
      const capitalizedMonthKey =
        monthKey.charAt(0).toUpperCase() + monthKey.slice(1);

      // if accumulator doesn't have the year, add it
      if (!acc[year]) acc[year] = {};

      // if accumulator[year] doesn't have the month, add it
      if (!acc[year][capitalizedMonthKey]) {
        acc[year][capitalizedMonthKey] = {
          monthNumber: date.getMonth(),
          tournaments: [],
        };
      }

      acc[year][capitalizedMonthKey].tournaments.push(tournament);
      return acc;
    },
    {} as Record<
      string,
      Record<string, { monthNumber: number; tournaments: TournamentDto[] }>
    >,
  );

  /**
   * Converts the grouped object into an array of year groups.
   * @param {Object} grouped The grouped object.
   * @return {YearGroup[]} An array of year groups.
   */
  const yearGroups: YearGroup[] = Object.entries(grouped).map(
    ([year, monthsObj]) => {
      const monthsData = Object.entries(monthsObj).map(([month, data]) => {
        const sortedTournaments = [...data.tournaments].sort(
          (a, b) =>
            new Date(b.startDate).getTime() - new Date(a.startDate).getTime(),
        );

        return {
          month,
          monthNumber: data.monthNumber,
          tournaments: sortedTournaments,
        };
      });

      monthsData.sort((a, b) => b.monthNumber - a.monthNumber);

      return {
        year,
        yearNumber: parseInt(year),
        monthsData,
      };
    },
  );

  yearGroups.sort((a, b) => b.yearNumber - a.yearNumber);

  return yearGroups;
};

/**
 * Formats the start and end dates of a tournament.
 * @param {string} startDate The start date.
 * @param {string} endDate The end date.
 * @return {string} A string representing the formatted dates.
 */
export const getFormattedDate = (
  startDate: string,
  endDate: string,
): string => {
  const start = dayjs(startDate);
  const end = dayjs(endDate);

  const isSameMonth = start.isSame(end, 'month');

  // if the both dates are in the same month we display the Label of the day
  // else we display the day and the month
  const formatStr = isSameMonth ? 'ddd D' : 'D MMM';

  return (
    formatAndCapitalize(start, formatStr, isSameMonth) +
    ' - ' +
    formatAndCapitalize(end, formatStr, isSameMonth)
  );
};

/**
 * Formats a date and capitalizes the first letter of the day label or the month label.
 * @param {dayjs.Dayjs} d The date to format.
 * @param {string} formatStr The format string.
 * @param {boolean} isSameMonth Whether the date is in the same month.
 * @return {string} The formatted date.
 */
export const formatAndCapitalize = (
  d: dayjs.Dayjs,
  formatStr: string,
  isSameMonth: boolean,
): string => {
  const formatted = d.format(formatStr);

  // capitalize the first letter of the day label or the month label
  if (isSameMonth)
    return formatted.charAt(0).toUpperCase() + formatted.slice(1);
  else {
    const parts = formatted.split(' ');
    if (parts.length > 1)
      parts[1] = parts[1].charAt(0).toUpperCase() + parts[1].slice(1);

    return parts.join(' ');
  }
};
