const PRESENT_DATE_SORT_VALUE = Number.MAX_SAFE_INTEGER;

/**
 * Parses a variety of free-form date strings into a numeric timestamp
 * suitable for comparison / sorting.
 *
 * Handles: ISO dates, "MM/YYYY", "YYYY-MM", "YYYY", and keywords like
 * "Present" / "Current" / "Now" (treated as the latest possible date).
 *
 * Returns `null` when the value is empty or unparseable.
 */
export const parseDateForSort = (value?: string): number | null => {
  if (!value) return null;

  const trimmed = value.trim();
  if (!trimmed) return null;

  const lower = trimmed.toLowerCase();

  if (lower.includes('present') || lower.includes('current') || lower.includes('now')) {
    return PRESENT_DATE_SORT_VALUE;
  }

  const native = Date.parse(trimmed);
  if (!Number.isNaN(native)) return native;

  // MM/YYYY or MM-YYYY
  const mmYYYY = lower.match(/^(\d{1,2})[/-](\d{4})$/);
  if (mmYYYY) {
    const month = Number(mmYYYY[1]);
    const year = Number(mmYYYY[2]);
    if (month >= 1 && month <= 12) return new Date(year, month - 1, 1).getTime();
  }

  // YYYY/MM or YYYY-MM
  const yyyyMM = lower.match(/^(\d{4})[/-](\d{1,2})$/);
  if (yyyyMM) {
    const year = Number(yyyyMM[1]);
    const month = Number(yyyyMM[2]);
    if (month >= 1 && month <= 12) return new Date(year, month - 1, 1).getTime();
  }

  // Bare year
  const yearOnly = lower.match(/^(\d{4})$/);
  if (yearOnly) return new Date(Number(yearOnly[1]), 0, 1).getTime();

  return null;
};

export { PRESENT_DATE_SORT_VALUE };

/**
 * Common shape for any portfolio-style item that may carry date fields.
 * All fields are optional so this covers work experience, education,
 * projects, certifications, awards, and publications.
 */
interface DateableItem {
  time?: string;
  date?: string;
  start_date?: string;
  end_date?: string;
  current?: boolean;
}

/**
 * Extracts the "latest" date from an item by checking, in priority order:
 *   1. `current` flag  (→ treated as "present")
 *   2. `end_date`
 *   3. Trailing segment of `time` (text after the last "-")
 *   4. `date`
 *   5. `start_date`
 *   6. Full `time` string
 *
 * Returns 0 when no date information can be derived.
 */
export const getLatestDate = (item: DateableItem): number => {
  if (item.current) return PRESENT_DATE_SORT_VALUE;

  const endDate = parseDateForSort(item.end_date);
  if (endDate !== null) return endDate;

  const timeRangeEnd = item.time?.split('-').pop();
  const timeEnd = parseDateForSort(timeRangeEnd);
  if (timeEnd !== null) return timeEnd;

  const dateField = parseDateForSort(item.date);
  if (dateField !== null) return dateField;

  const startDate = parseDateForSort(item.start_date);
  if (startDate !== null) return startDate;

  const fullTime = parseDateForSort(item.time);
  if (fullTime !== null) return fullTime;

  return 0;
};

/**
 * Returns a new array sorted from latest to oldest (descending).
 * Items without any parseable date sink to the bottom.
 */
export const sortByDateDesc = <T extends DateableItem>(items: T[]): T[] =>
  [...items].sort((a, b) => getLatestDate(b) - getLatestDate(a));
