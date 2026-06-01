// Test setup file for Vitest
import '@testing-library/jest-dom';

// Simulated IntersectionObserver for tests that don't have a real DOM
global.IntersectionObserver = class IntersectionObserver {
  constructor() {}
  observe() {}
  unobserve() {}
  disconnect() {}
} as any;

// Provide a lightweight fallback for TelemetryContext in tests so components
// that call `useTelemetry()` don't throw when not wrapped in a provider.
import { vi } from 'vitest';
try {
  vi.mock('../contexts/TelemetryContext.tsx', async () => {
    const actual = await vi.importActual('../contexts/TelemetryContext.tsx');
    return {
      ...actual,
      useTelemetry: () => ({
        telemetry: {},
        activeIncident: null,
        triggerEmergency: () => undefined,
        clearEmergency: () => undefined,
        forceUpdate: () => undefined,
        updatePipeDiameter: () => undefined,
        shutdownExcitation: () => undefined,
        updateWicketGateSetpoint: () => undefined,
        resetFatigue: () => undefined
      })
    } as any;
  });
} catch (e) {
  // If mocking fails in some environments, swallow to avoid breaking tests setup
  // The real tests should still wrap components where necessary.
  // eslint-disable-next-line no-console
  console.warn('[test setup] TelemetryContext mock failed', e);
}
try {
  vi.mock('../contexts/MaintenanceContext.tsx', async () => {
    const actual = await vi.importActual('../contexts/MaintenanceContext.tsx');
    return {
      ...actual,
      useMaintenance: () => ({
        workOrders: [],
        logs: [],
        operatingHours: 0,
        predictServiceDate: () => null,
        createLogEntry: () => undefined,
        createWorkOrder: () => undefined,
        getMaintenanceSummary: () => ({ upcoming: 0 })
      })
    } as any;
  });
} catch (e) {
  // eslint-disable-next-line no-console
  console.warn('[test setup] MaintenanceContext mock failed', e);
}

// Minimal IndexedDB shim for Dexie in Node.js/jsdom test environment
if (typeof (global as any).indexedDB === 'undefined') {
  try {
    (global as any).indexedDB = {
      databases: () => [],
      open: () => ({ onupgradeneeded: null, onsuccess: null, onerror: null }),
      deleteDatabase: () => ({})
    } as any;
  } catch (e) {
    // ignore
  }
}
