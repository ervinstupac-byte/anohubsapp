/**
 * Storage Utilities
 * 
 * Provides robust methods for saving and loading data from localStorage,
 * specifically handling the hydration of JSON Date strings back into Date objects.
 */

// Regex to detect ISO 8601 Date strings (e.g., "2023-12-25T12:00:00.000Z")
const isoDateRegex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d*)?(?:[-+]\d{2}:?\d{2}|Z)?$/;

/**
 * JSON Reviver function that converts Date strings back to Date objects.
 */
function dateReviver(_key: string, value: any): any {
    if (typeof value === 'string' && isoDateRegex.test(value)) {
        const date = new Date(value);
        if (!isNaN(date.getTime())) {
            return date;
        }
    }
    return value;
}

/**
 * Safe Load from LocalStorage
 * @param key The localStorage key to read from
 * @returns The parsed object of type T, or null if not found/error
 */
export function loadFromStorage<T>(key: string): T | null {
    try {
        const item = localStorage.getItem(key);
        if (!item) return null;
        return JSON.parse(item, dateReviver) as T;
    } catch (error) {
        console.error(`Error loading key "${key}" from storage:`, error);
        return null;
    }
}

/**
 * Safe Save to LocalStorage
 * @param key The localStorage key to write to
 * @param value The data to save
 */
export function saveToStorage(key: string, value: any): void {
    try {
        const serialized = JSON.stringify(value);
        localStorage.setItem(key, serialized);
    } catch (error) {
        console.error(`Error saving key "${key}" to storage:`, error);
    }
}
