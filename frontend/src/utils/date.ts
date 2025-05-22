/**
 * Utility functions for working with dates
 */

/**
 * Get current date in YYYY-MM-DD format
 * @returns Current date in YYYY-MM-DD format
 */
export const getCurrentDate = (): string => {
  const today = new Date();
  return formatDateToString(today);
};

/**
 * Format Date object to YYYY-MM-DD string
 * @param date Date object
 * @returns Date string in YYYY-MM-DD format
 */
export const formatDateToString = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
};

/**
 * Parse date string to Date object
 * @param dateStr Date string in YYYY-MM-DD format
 * @returns Date object
 */
export const parseDate = (dateStr: string): Date => {
  if (!dateStr) return new Date();

  // Check if the format is YYYY-MM-DD
  const regex = /^\d{4}-\d{2}-\d{2}$/;
  if (!regex.test(dateStr)) {
    throw new Error('Invalid date format. Expected YYYY-MM-DD');
  }

  const [year, month, day] = dateStr.split('-').map(Number);
  return new Date(year, month - 1, day);
};

/**
 * Check if a date is before another date
 * @param date1 First date (Date object or YYYY-MM-DD string)
 * @param date2 Second date (Date object or YYYY-MM-DD string)
 * @returns True if date1 is before date2
 */
export const isDateBefore = (
  date1: Date | string,
  date2: Date | string
): boolean => {
  const d1 = typeof date1 === 'string' ? parseDate(date1) : date1;
  const d2 = typeof date2 === 'string' ? parseDate(date2) : date2;

  return d1.getTime() < d2.getTime();
};

/**
 * Check if a date is after another date
 * @param date1 First date (Date object or YYYY-MM-DD string)
 * @param date2 Second date (Date object or YYYY-MM-DD string)
 * @returns True if date1 is after date2
 */
export const isDateAfter = (
  date1: Date | string,
  date2: Date | string
): boolean => {
  const d1 = typeof date1 === 'string' ? parseDate(date1) : date1;
  const d2 = typeof date2 === 'string' ? parseDate(date2) : date2;

  return d1.getTime() > d2.getTime();
};

/**
 * Check if a date is between two other dates
 * @param date Date to check (Date object or YYYY-MM-DD string)
 * @param startDate Start date (Date object or YYYY-MM-DD string)
 * @param endDate End date (Date object or YYYY-MM-DD string)
 * @param inclusive Whether to include start and end dates (default: true)
 * @returns True if date is between startDate and endDate
 */
export const isDateBetween = (
  date: Date | string,
  startDate: Date | string,
  endDate: Date | string,
  inclusive: boolean = true
): boolean => {
  const d = typeof date === 'string' ? parseDate(date) : date;
  const start = typeof startDate === 'string' ? parseDate(startDate) : startDate;
  const end = typeof endDate === 'string' ? parseDate(endDate) : endDate;

  const dTime = d.getTime();
  const startTime = start.getTime();
  const endTime = end.getTime();

  if (inclusive) {
    return dTime >= startTime && dTime <= endTime;
  } else {
    return dTime > startTime && dTime < endTime;
  }
};

/**
 * Add days to a date
 * @param date Date to add days to (Date object or YYYY-MM-DD string)
 * @param days Number of days to add (can be negative)
 * @returns New Date object
 */
export const addDays = (date: Date | string, days: number): Date => {
  const d = typeof date === 'string' ? parseDate(date) : new Date(date);
  d.setDate(d.getDate() + days);
  return d;
};

/**
 * Add months to a date
 * @param date Date to add months to (Date object or YYYY-MM-DD string)
 * @param months Number of months to add (can be negative)
 * @returns New Date object
 */
export const addMonths = (date: Date | string, months: number): Date => {
  const d = typeof date === 'string' ? parseDate(date) : new Date(date);
  d.setMonth(d.getMonth() + months);
  return d;
};

/**
 * Add years to a date
 * @param date Date to add years to (Date object or YYYY-MM-DD string)
 * @param years Number of years to add (can be negative)
 * @returns New Date object
 */
export const addYears = (date: Date | string, years: number): Date => {
  const d = typeof date === 'string' ? parseDate(date) : new Date(date);
  d.setFullYear(d.getFullYear() + years);
  return d;
};

/**
 * Get the difference in days between two dates
 * @param date1 First date (Date object or YYYY-MM-DD string)
 * @param date2 Second date (Date object or YYYY-MM-DD string)
 * @returns Number of days between date1 and date2
 */
export const getDaysDifference = (
  date1: Date | string,
  date2: Date | string
): number => {
  const d1 = typeof date1 === 'string' ? parseDate(date1) : date1;
  const d2 = typeof date2 === 'string' ? parseDate(date2) : date2;

  // Convert to UTC to avoid daylight saving time issues
  const utc1 = Date.UTC(d1.getFullYear(), d1.getMonth(), d1.getDate());
  const utc2 = Date.UTC(d2.getFullYear(), d2.getMonth(), d2.getDate());

  const MS_PER_DAY = 1000 * 60 * 60 * 24;
  return Math.floor((utc2 - utc1) / MS_PER_DAY);
};

/**
 * Get the start date of the year for a given date
 * @param date Date (Date object or YYYY-MM-DD string)
 * @returns Date object representing the start of the year
 */
export const getStartOfYear = (date: Date | string): Date => {
  const d = typeof date === 'string' ? parseDate(date) : new Date(date);
  return new Date(d.getFullYear(), 0, 1);
};

/**
 * Get the end date of the year for a given date
 * @param date Date (Date object or YYYY-MM-DD string)
 * @returns Date object representing the end of the year
 */
export const getEndOfYear = (date: Date | string): Date => {
  const d = typeof date === 'string' ? parseDate(date) : new Date(date);
  return new Date(d.getFullYear(), 11, 31);
};

/**
 * Get the start date of the month for a given date
 * @param date Date (Date object or YYYY-MM-DD string)
 * @returns Date object representing the start of the month
 */
export const getStartOfMonth = (date: Date | string): Date => {
  const d = typeof date === 'string' ? parseDate(date) : new Date(date);
  return new Date(d.getFullYear(), d.getMonth(), 1);
};

/**
 * Get the end date of the month for a given date
 * @param date Date (Date object or YYYY-MM-DD string)
 * @returns Date object representing the end of the month
 */
export const getEndOfMonth = (date: Date | string): Date => {
  const d = typeof date === 'string' ? parseDate(date) : new Date(date);
  return new Date(d.getFullYear(), d.getMonth() + 1, 0);
};

/**
 * Get the first day of the current year
 * @returns Date object representing the start of the current year
 */
export const getStartOfCurrentYear = (): Date => {
  return getStartOfYear(new Date());
};

/**
 * Get the first day of the current month
 * @returns Date object representing the start of the current month
 */
export const getStartOfCurrentMonth = (): Date => {
  return getStartOfMonth(new Date());
};

/**
 * Get an array of dates between start and end dates
 * @param startDate Start date (Date object or YYYY-MM-DD string)
 * @param endDate End date (Date object or YYYY-MM-DD string)
 * @param includeStartEnd Whether to include start and end dates (default: true)
 * @returns Array of dates in YYYY-MM-DD format
 */
export const getDatesBetween = (
  startDate: Date | string,
  endDate: Date | string,
  includeStartEnd: boolean = true
): string[] => {
  const start = typeof startDate === 'string' ? parseDate(startDate) : startDate;
  const end = typeof endDate === 'string' ? parseDate(endDate) : endDate;

  if (start.getTime() > end.getTime()) {
    throw new Error('Start date must be before end date');
  }

  const dates: string[] = [];

  // Set current date to start date
  const current = new Date(start);

  // Skip start date if not including
  if (!includeStartEnd) {
    current.setDate(current.getDate() + 1);
  }

  // Iterate through dates
  while (current.getTime() <= end.getTime()) {
    dates.push(formatDateToString(current));
    current.setDate(current.getDate() + 1);

    // Skip end date if not including
    if (!includeStartEnd && current.getTime() === end.getTime()) {
      break;
    }
  }

  return dates;
};

/**
 * Get an array of trading days (Monday to Friday) between start and end dates
 * @param startDate Start date (Date object or YYYY-MM-DD string)
 * @param endDate End date (Date object or YYYY-MM-DD string)
 * @returns Array of trading days in YYYY-MM-DD format
 */
export const getTradingDaysBetween = (
  startDate: Date | string,
  endDate: Date | string
): string[] => {
  const allDates = getDatesBetween(startDate, endDate);

  // Filter out weekends (Saturday = 6, Sunday = 0)
  return allDates.filter(dateStr => {
    const date = parseDate(dateStr);
    const day = date.getDay();
    return day !== 0 && day !== 6;
  });
};

/**
 * Get a date for a specific timeframe relative to a reference date
 * @param timeframe Timeframe (e.g., '1d', '1w', '1m', '3m', '6m', '1y', '5y', 'ytd')
 * @param referenceDate Reference date (default: current date)
 * @returns Date object for the specified timeframe
 */
export const getDateForTimeframe = (
  timeframe: string,
  referenceDate: Date | string = new Date()
): Date => {
  const reference = typeof referenceDate === 'string'
    ? parseDate(referenceDate)
    : new Date(referenceDate);

  switch (timeframe) {
    case '1d':
      return addDays(reference, -1);
    case '1w':
      return addDays(reference, -7);
    case '1m':
      return addMonths(reference, -1);
    case '3m':
      return addMonths(reference, -3);
    case '6m':
      return addMonths(reference, -6);
    case '1y':
      return addYears(reference, -1);
    case '2y':
      return addYears(reference, -2);
    case '5y':
      return addYears(reference, -5);
    case 'ytd':
      return getStartOfYear(reference);
    case 'mtd':
      return getStartOfMonth(reference);
    case 'max':
      // Default to 10 years
      return addYears(reference, -10);
    default:
      throw new Error(`Unknown timeframe: ${timeframe}`);
  }
};