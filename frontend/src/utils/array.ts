/**
 * Utility functions for working with arrays
 */

/**
 * Chunk an array into groups of a specified size
 * @param array Array to chunk
 * @param size Size of each chunk
 * @returns Array of chunks
 */
export const chunk = <T>(array: T[], size: number): T[][] => {
  if (!array || !array.length || size <= 0) return [];

  const result: T[][] = [];
  for (let i = 0; i < array.length; i += size) {
    result.push(array.slice(i, i + size));
  }

  return result;
};

/**
 * Get unique values from an array
 * @param array Array to get unique values from
 * @returns Array of unique values
 */
export const unique = <T>(array: T[]): T[] => {
  if (!array || !array.length) return [];

  return Array.from(new Set(array));
};

/**
 * Sort an array of objects by a key
 * @param array Array to sort
 * @param key Key to sort by
 * @param direction Sort direction (asc or desc)
 * @returns Sorted array
 */
export const sortByKey = <T extends Record<string, any>>(
  array: T[],
  key: keyof T,
  direction: 'asc' | 'desc' = 'asc'
): T[] => {
  if (!array || !array.length) return [];

  const sortedArray = [...array].sort((a, b) => {
    const valueA = a[key];
    const valueB = b[key];

    // Handle null/undefined values
    if (valueA === null || valueA === undefined) {
      return direction === 'asc' ? -1 : 1;
    }
    if (valueB === null || valueB === undefined) {
      return direction === 'asc' ? 1 : -1;
    }

    // Compare values
    if (typeof valueA === 'string' && typeof valueB === 'string') {
      return direction === 'asc'
        ? valueA.localeCompare(valueB)
        : valueB.localeCompare(valueA);
    } else {
      const numA = Number(valueA);
      const numB = Number(valueB);

      if (isNaN(numA) || isNaN(numB)) {
        // Can't convert to number, use string comparison
        const strA = String(valueA);
        const strB = String(valueB);
        return direction === 'asc'
          ? strA.localeCompare(strB)
          : strB.localeCompare(strA);
      } else {
        // Numeric comparison
        return direction === 'asc' ? numA - numB : numB - numA;
      }
    }
  });

  return sortedArray;
};

/**
 * Group an array of objects by a key
 * @param array Array to group
 * @param key Key to group by
 * @returns Object with groups
 */
export const groupBy = <T extends Record<string, any>>(
  array: T[],
  key: keyof T
): Record<string, T[]> => {
  if (!array || !array.length) return {};

  return array.reduce((result, item) => {
    const groupKey = String(item[key] || 'undefined');
    if (!result[groupKey]) {
      result[groupKey] = [];
    }
    result[groupKey].push(item);
    return result;
  }, {} as Record<string, T[]>);
};

/**
 * Find the sum of values in an array
 * @param array Array of numbers
 * @returns Sum of values
 */
export const sum = (array: number[]): number => {
  if (!array || !array.length) return 0;

  return array.reduce((total, value) => total + value, 0);
};

/**
 * Find the average of values in an array
 * @param array Array of numbers
 * @returns Average value
 */
export const average = (array: number[]): number => {
  if (!array || !array.length) return 0;

  return sum(array) / array.length;
};

/**
 * Find the minimum value in an array
 * @param array Array of numbers
 * @returns Minimum value
 */
export const min = (array: number[]): number => {
  if (!array || !array.length) return 0;

  return Math.min(...array);
};

/**
 * Find the maximum value in an array
 * @param array Array of numbers
 * @returns Maximum value
 */
export const max = (array: number[]): number => {
  if (!array || !array.length) return 0;

  return Math.max(...array);
};

/**
 * Find the median value in an array
 * @param array Array of numbers
 * @returns Median value
 */
export const median = (array: number[]): number => {
  if (!array || !array.length) return 0;

  const sorted = [...array].sort((a, b) => a - b);
  const middle = Math.floor(sorted.length / 2);

  if (sorted.length % 2 === 0) {
    return (sorted[middle - 1] + sorted[middle]) / 2;
  } else {
    return sorted[middle];
  }
};

/**
 * Find the mode (most common value) in an array
 * @param array Array of values
 * @returns Mode value or undefined if no mode
 */
export const mode = <T>(array: T[]): T | undefined => {
  if (!array || !array.length) return undefined;

  const counts = new Map<T, number>();
  let maxCount = 0;
  let maxValue: T | undefined = undefined;

  for (const value of array) {
    const count = (counts.get(value) || 0) + 1;
    counts.set(value, count);

    if (count > maxCount) {
      maxCount = count;
      maxValue = value;
    }
  }

  // Check if the mode is unique (appears more than once and more than other values)
  if (maxCount <= 1 || Array.from(counts.values()).filter(c => c === maxCount).length > 1) {
    return undefined;
  }

  return maxValue;
};

/**
 * Find the percentile value in an array
 * @param array Array of numbers
 * @param percentile Percentile (0-1)
 * @returns Percentile value
 */
export const percentile = (array: number[], percentile: number): number => {
  if (!array || !array.length) return 0;
  if (percentile < 0 || percentile > 1) {
    throw new Error('Percentile must be between 0 and 1');
  }

  const sorted = [...array].sort((a, b) => a - b);
  const index = Math.max(0, Math.min(sorted.length - 1, Math.floor(percentile * sorted.length)));

  return sorted[index];
};

/**
 * Calculate the standard deviation of values in an array
 * @param array Array of numbers
 * @param population Whether to use population formula (N) instead of sample formula (N-1)
 * @returns Standard deviation
 */
export const standardDeviation = (
  array: number[],
  population: boolean = false
): number => {
  if (!array || array.length <= (population ? 0 : 1)) return 0;

  const avg = average(array);
  const squaredDiffs = array.map(value => Math.pow(value - avg, 2));
  const divisor = population ? array.length : array.length - 1;

  return Math.sqrt(sum(squaredDiffs) / divisor);
};

/**
 * Calculate rolling window values for an array
 * @param array Array of values
 * @param windowSize Size of the rolling window
 * @param fn Function to apply to each window
 * @returns Array of rolling window values
 */
export const rolling = <T, R>(
  array: T[],
  windowSize: number,
  fn: (window: T[]) => R
): R[] => {
  if (!array || !array.length || windowSize <= 0) return [];
  if (windowSize > array.length) return [fn(array)];

  const result: R[] = [];

  for (let i = 0; i <= array.length - windowSize; i++) {
    const window = array.slice(i, i + windowSize);
    result.push(fn(window));
  }

  return result;
};

/**
 * Zip multiple arrays together
 * @param arrays Arrays to zip
 * @returns Array of arrays, where each sub-array contains the elements from each input array at the same index
 */
export const zip = <T>(...arrays: T[][]): T[][] => {
  if (!arrays || !arrays.length) return [];

  const minLength = Math.min(...arrays.map(arr => arr.length));
  const result: T[][] = [];

  for (let i = 0; i < minLength; i++) {
    result.push(arrays.map(arr => arr[i]));
  }

  return result;
};

/**
 * Move an item in an array from one index to another
 * @param array Array to modify
 * @param fromIndex Index to move from
 * @param toIndex Index to move to
 * @returns New array with the item moved
 */
export const moveItem = <T>(array: T[], fromIndex: number, toIndex: number): T[] => {
  if (!array || !array.length) return [];
  if (fromIndex < 0 || fromIndex >= array.length || toIndex < 0 || toIndex >= array.length) {
    return [...array];
  }

  const result = [...array];
  const [removed] = result.splice(fromIndex, 1);
  result.splice(toIndex, 0, removed);

  return result;
};