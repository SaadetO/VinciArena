import dayjs from 'dayjs';
import { MatchSummaryDto } from '../types';

export interface DayGroup {
  /** Pre-formatted label, e.g. "Vendredi 20 Février" */
  day: string;
  /** ISO date string (YYYY-MM-DD) used for sorting */
  dateKey: string;
  matches: MatchSummaryDto[];
}

export interface MatchYearGroup {
  year: string;
  yearNumber: number;
  daysData: DayGroup[];
}

/**
 * Groups matches by year and day.
 * Each day label is formatted as "Vendredi 20 Février" (capitalised, in French).
 *
 * @param matches The matches to group.
 * @returns An array of year groups, each containing day groups, sorted descending.
 */
export const groupMatchesByYearAndDay = (
  matches: MatchSummaryDto[],
): MatchYearGroup[] => {
  const grouped = matches.reduce(
    (acc, match) => {
      const d = dayjs(match.dateHour);
      const year = d.year().toString();
      const dateKey = d.format('YYYY-MM-DD');

      // "dddd D MMMM" → e.g. "vendredi 20 février"
      const rawLabel = d.format('dddd D MMMM');
      const dayLabel = rawLabel
        .split(' ')
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
        .join(' ');

      if (!acc[year]) acc[year] = {};

      if (!acc[year][dateKey]) {
        acc[year][dateKey] = {
          dayLabel,
          matches: [],
        };
      }

      acc[year][dateKey].matches.push(match);
      return acc;
    },
    {} as Record<
      string,
      Record<string, { dayLabel: string; matches: MatchSummaryDto[] }>
    >,
  );

  const yearGroups: MatchYearGroup[] = Object.entries(grouped).map(
    ([year, daysObj]) => {
      const daysData: DayGroup[] = Object.entries(daysObj).map(
        ([dateKey, data]) => {
          // Sort matches within a day by time (latest first)
          const sortedMatches = [...data.matches].sort(
            (a, b) =>
              new Date(b.dateHour).getTime() - new Date(a.dateHour).getTime(),
          );

          return {
            day: data.dayLabel,
            dateKey,
            matches: sortedMatches,
          };
        },
      );

      // Sort days descending (latest first within a year)
      daysData.sort((a, b) => b.dateKey.localeCompare(a.dateKey));

      return {
        year,
        yearNumber: parseInt(year),
        daysData,
      };
    },
  );

  // Sort years descending (most recent year first)
  yearGroups.sort((a, b) => b.yearNumber - a.yearNumber);

  return yearGroups;
};
