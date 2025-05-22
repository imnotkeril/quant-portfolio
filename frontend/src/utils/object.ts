/**
 * Utility functions for working with objects
 */

/**
 * Pick specific properties from an object
 * @param obj Source object
 * @param keys Keys to pick
 * @returns New object with picked properties
 */
export const pick = <T, K extends keyof T>(obj: T, keys: K[]): Pick<T, K> => {
  if (!obj) return {} as Pick<T, K>;

  return keys.reduce((result, key) => {
    if (key in obj) {
      result[key] = obj[key];
    }
    return result;
  }, {} as Pick<T, K>);
};

/**
 * Omit specific properties from an object
 * @param obj Source object
 * @param keys Keys to omit
 * @returns New object without omitted properties
 */
export const omit = <T, K extends keyof T>(obj: T, keys: K[]): Omit<T, K> => {
  if (!obj) return {} as Omit<T, K>;

  const result = { ...obj };
  for (const key of keys) {
    delete result[key];
  }

  return result as Omit<T, K>;
};

/**
 * Check if an object is empty
 * @param obj Object to check
 * @returns True if object is empty (has no own properties)
 */
export const isEmpty = (obj: object): boolean => {
  if (!obj) return true;

  return Object.keys(obj).length === 0;
};

/**
 * Get a nested property from an object using a path string
 * @param obj Source object
 * @param path Path to property (e.g., 'user.address.city')
 * @param defaultValue Default value if property doesn't exist
 * @returns Property value or default value
 */
export const getNestedProperty = <T>(
  obj: Record<string, any>,
  path: string,
  defaultValue: T
): T => {
  if (!obj || !path) return defaultValue;

  const keys = path.split('.');
  let current = obj;

  for (const key of keys) {
    if (current === null || current === undefined || typeof current !== 'object') {
      return defaultValue;
    }
    current = current[key];
  }

  return (current === undefined) ? defaultValue : current;
};

/**
 * Set a nested property in an object using a path string
 * @param obj Source object
 * @param path Path to property (e.g., 'user.address.city')
 * @param value Value to set
 * @returns New object with updated property
 */
export const setNestedProperty = <T>(
  obj: Record<string, any>,
  path: string,
  value: T
): Record<string, any> => {
  if (!obj || !path) return obj;

  const result = { ...obj };
  const keys = path.split('.');
  let current = result;

  for (let i = 0; i < keys.length - 1; i++) {
    const key = keys[i];
    if (!(key in current) || current[key] === null || typeof current[key] !== 'object') {
      current[key] = {};
    }
    current = current[key];
  }

  current[keys[keys.length - 1]] = value;
  return result;
};

/**
 * Flatten a nested object into a single-level object with dot-notation keys
 * @param obj Nested object
 * @param prefix Prefix for keys (used in recursion)
 * @returns Flattened object
 */
export const flattenObject = (
  obj: Record<string, any>,
  prefix: string = ''
): Record<string, any> => {
  if (!obj) return {};

  return Object.keys(obj).reduce((acc, key) => {
    const prefixedKey = prefix ? `${prefix}.${key}` : key;

    if (typeof obj[key] === 'object' && obj[key] !== null && !Array.isArray(obj[key])) {
      Object.assign(acc, flattenObject(obj[key], prefixedKey));
    } else {
      acc[prefixedKey] = obj[key];
    }

    return acc;
  }, {} as Record<string, any>);
};

/**
 * Merge multiple objects deeply
 * @param objects Objects to merge
 * @returns Merged object
 */
export const deepMerge = (...objects: Record<string, any>[]): Record<string, any> => {
  if (!objects || !objects.length) return {};
  if (objects.length === 1) return objects[0] || {};

  const result: Record<string, any> = {};

  for (const obj of objects) {
    if (!obj) continue;

    for (const key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        if (
          typeof obj[key] === 'object' &&
          obj[key] !== null &&
          !Array.isArray(obj[key]) &&
          typeof result[key] === 'object' &&
          result[key] !== null &&
          !Array.isArray(result[key])
        ) {
          result[key] = deepMerge(result[key], obj[key]);
        } else {
          result[key] = obj[key];
        }
      }
    }
  }

  return result;
};

/**
 * Transform an object by applying a function to each value
 * @param obj Source object
 * @param fn Transformation function
 * @returns Transformed object
 */
export const mapValues = <T, R>(
  obj: Record<string, T>,
  fn: (value: T, key: string) => R
): Record<string, R> => {
  if (!obj) return {};

  return Object.keys(obj).reduce((result, key) => {
    result[key] = fn(obj[key], key);
    return result;
  }, {} as Record<string, R>);
};

/**
 * Filter an object by applying a predicate function to each value
 * @param obj Source object
 * @param fn Predicate function
 * @returns Filtered object
 */
export const filterValues = <T>(
  obj: Record<string, T>,
  fn: (value: T, key: string) => boolean
): Record<string, T> => {
  if (!obj) return {};

  return Object.keys(obj).reduce((result, key) => {
    if (fn(obj[key], key)) {
      result[key] = obj[key];
    }
    return result;
  }, {} as Record<string, T>);
};

/**
 * Create an object from an array using a key function
 * @param array Source array
 * @param keyFn Function to get key for each item
 * @returns Object with items grouped by key
 */
export const keyBy = <T>(
  array: T[],
  keyFn: (item: T) => string
): Record<string, T> => {
  if (!array || !array.length) return {};

  return array.reduce((result, item) => {
    const key = keyFn(item);
    result[key] = item;
    return result;
  }, {} as Record<string, T>);
};

/**
 * Sort object keys
 * @param obj Source object
 * @param compareFn Compare function for sorting
 * @returns New object with sorted keys
 */
export const sortKeys = <T>(
  obj: Record<string, T>,
  compareFn?: (a: string, b: string) => number
): Record<string, T> => {
  if (!obj) return {};

  const sortedKeys = Object.keys(obj).sort(compareFn);

  return sortedKeys.reduce((result, key) => {
    result[key] = obj[key];
    return result;
  }, {} as Record<string, T>);
};

/**
 * Check if two objects are deeply equal
 * @param obj1 First object
 * @param obj2 Second object
 * @returns True if objects are deeply equal
 */
export const isDeepEqual = (obj1: any, obj2: any): boolean => {
  // Check if primitives or non-objects
  if (obj1 === obj2) return true;

  // Check if either is null/undefined
  if (obj1 == null || obj2 == null) return false;

  // Check if types match
  if (typeof obj1 !== typeof obj2) return false;

  // Handle arrays
  if (Array.isArray(obj1) && Array.isArray(obj2)) {
    if (obj1.length !== obj2.length) return false;
    return obj1.every((val, idx) => isDeepEqual(val, obj2[idx]));
  }

  // Handle objects
  if (typeof obj1 === 'object' && typeof obj2 === 'object') {
    const keys1 = Object.keys(obj1);
    const keys2 = Object.keys(obj2);

    if (keys1.length !== keys2.length) return false;

    return keys1.every(key =>
      Object.prototype.hasOwnProperty.call(obj2, key) &&
      isDeepEqual(obj1[key], obj2[key])
    );
  }

  return false;
};

/**
 * Create a deep clone of an object
 * @param obj Object to clone
 * @returns Cloned object
 */
export const deepClone = <T>(obj: T): T => {
  if (obj === null || typeof obj !== 'object') return obj;

  if (Array.isArray(obj)) {
    return obj.map(item => deepClone(item)) as unknown as T;
  }

  const cloned: Record<string, any> = {};
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      cloned[key] = deepClone((obj as Record<string, any>)[key]);
    }
  }

  return cloned as T;
};