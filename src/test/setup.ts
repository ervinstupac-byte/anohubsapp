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
