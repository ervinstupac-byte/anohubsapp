/**
 * idAdapter.ts
 * 
 * NC-2600: Sovereign ID Adapter Utility
 * 
 * Centralized ID conversion utility for all components
 * Replaces scattered idAdapter usage throughout the codebase
 */

/**
 * Convert any ID type to a standardized string format for storage
 */
export const toStorage = (id: any): string => {
  if (id === null || id === undefined) {
    return 'null';
  }
  return String(id);
};

/**
 * Convert any ID type to a standardized number format for database
 */
export const toNumber = (id: any): number => {
  if (id === null || id === undefined) {
    return 0;
  }
  const num = Number(id);
  return Number.isNaN(num) ? 0 : num;
};

/**
 * Convert any ID type to a database-compatible format
 */
export const toDb = (id: any): number => {
  if (id === null || id === undefined) {
    return 0;
  }
  const num = Number(id);
  return Number.isNaN(num) ? 0 : num;
};

/**
 * Legacy compatibility - direct BigInt handling for large IDs
 */
export const toBigInt = (id: any): bigint => {
  if (id === null || id === undefined) {
    return BigInt(0);
  }
  try {
    return BigInt(id.toString());
  } catch {
    return BigInt(0);
  }
};

export const idAdapter = {
  toStorage,
  toNumber,
  toDb,
  toBigInt
};

export default idAdapter;
