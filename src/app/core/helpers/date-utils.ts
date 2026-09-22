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
