/**
 * Utility functions for handling standard JavaScript Date objects and C# DateOnly API strings.
 */

/**
 * Parses an API date value (string "YYYY-MM-DD" or ISO datetime string or Date) into a local Date object.
 */
export function parseApiDate(dateVal: Date | string | null | undefined): Date {
  if (!dateVal) {
    return new Date();
  }
  if (dateVal instanceof Date) {
    return new Date(dateVal.getTime());
  }

  if (typeof dateVal === 'string') {
    const ymdMatch = /^(\d{4})-(\d{2})-(\d{2})/.exec(dateVal);
    if (ymdMatch) {
      const year = parseInt(ymdMatch[1], 10);
      const month = parseInt(ymdMatch[2], 10) - 1;
      const day = parseInt(ymdMatch[3], 10);
      return new Date(year, month, day);
    }
    return new Date(dateVal);
  }

  return new Date(dateVal);
}

/**
 * Formats a Date object as "YYYY-MM-DD" string (for C# DateOnly API or HTML date inputs).
 */
export function formatDateToIsoDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Checks if two dates represent the same calendar day.
 */
export function isSameDay(
  d1: Date | string | null | undefined,
  d2: Date | string | null | undefined,
): boolean {
  if (!d1 || !d2) return false;
  const date1 = parseApiDate(d1);
  const date2 = parseApiDate(d2);

  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate()
  );
}

/**
 * Compare if only days are greater than or equal to other date
 * @param d1 Date to be compared
 * @param d2 Date
 * @returns true if d1 is greater than or equal to d2 (ignoring time), false otherwise
 */
export function isDateGreaterThanDate(d1: Date, d2: Date): boolean {
  const date1 = parseApiDate(d1);
  const date2 = parseApiDate(d2);

  return (
    date1.getFullYear() > date2.getFullYear() ||
    (date1.getFullYear() === date2.getFullYear() && date1.getMonth() > date2.getMonth()) ||
    (date1.getFullYear() === date2.getFullYear() &&
      date1.getMonth() === date2.getMonth() &&
      date1.getDate() > date2.getDate())
  );
}

/**
 * Compare if only days are less than or equal to other date
 * @param d1 Date to be compared
 * @param d2 Date
 * @returns true if d1 is less than or equal to d2 (ignoring time), false otherwise
 */
export function isDateLessThanDate(d1: Date, d2: Date): boolean {
  const date1 = parseApiDate(d1);
  const date2 = parseApiDate(d2);

  return (
    date1.getFullYear() < date2.getFullYear() ||
    (date1.getFullYear() === date2.getFullYear() && date1.getMonth() < date2.getMonth()) ||
    (date1.getFullYear() === date2.getFullYear() &&
      date1.getMonth() === date2.getMonth() &&
      date1.getDate() < date2.getDate())
  );
}

/**
 * Get difference in days between two dates (ignoring time).
 * If the first date is in the past compared to the second (reference) date, it will return a negative number.
 * If the first date is in the future compared to the second (reference) date, it will return a positive number.
 * If the dates are the same, it will return 0.
 * @param d1 Date
 * @param d2 Reference date (e.g. today)
 * @example
 * getDayDifference(new Date('2022-01-01'), new Date('2022-01-02')) // returns 1
 * getDayDifference(new Date('2022-01-02'), new Date('2022-01-01')) // returns -1
 * @returns Number of days between d1 and d2. Negative value if diff is in past, otherwise positive
 */
export function getDayDifference(d1: Date, d2: Date): number {
  const date1 = parseApiDate(d1);
  const date2 = parseApiDate(d2);

  date1.setHours(0, 0, 0, 0);
  date2.setHours(0, 0, 0, 0);

  const diff = Math.round((date1.getTime() - date2.getTime()) / (1000 * 60 * 60 * 24));

  return diff;
}
