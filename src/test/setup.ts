// Test setup file for Vitest
import '@testing-library/jest-dom';

// Mock IntersectionObserver for tests that don't have a real DOM
global.IntersectionObserver = class IntersectionObserver {
  constructor() {}
  observe() {}
  unobserve() {}
  disconnect() {}
} as any;
