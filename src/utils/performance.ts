/**
 * performance.ts
 * 
 * NC-2600: Performance Utility Functions
 * 
 * Centralized performance utilities to replace scattered implementations
 */

/**
 * Simple debounce implementation without external dependencies
 */
export const debounce = <T extends (...args: any[]) => void>(
  func: T,
  delay: number
): ((...args: Parameters<T>) => void) => {
  let timeoutId: NodeJS.Timeout | null = null;
  
  return (...args: Parameters<T>) => {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
    
    timeoutId = setTimeout(() => {
      func(...args);
    }, delay);
  };
};

/**
 * Performance monitoring utilities
 */
export const now = (): number => Date.now();

export const measureTime = <T>(
  fn: () => T,
  label?: string
): { result: T; duration: number } => {
  const start = now();
  const result = fn();
  const duration = now() - start;
  
  if (process.env.NODE_ENV === 'development') {
    console.log(`Performance [${label || 'Operation'}]: ${duration}ms`);
  }
  
  return { result, duration };
};
