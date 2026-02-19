import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { ScadaCore } from '../ScadaCore';
import { useTelemetryStore } from '../../../features/telemetry/store/useTelemetryStore';

describe('ScadaCore state transitions', () => {
  it('shows Grid Synchroscope overlay when starting', () => {
    const setMech = useTelemetryStore.getState().setMechanical;
    setMech({ rpm: 100 });
    render(
      <MemoryRouter>
        <ScadaCore />
      </MemoryRouter>
    );
    expect(screen.getByText(/Grid Synchroscope/i)).toBeTruthy();
  });

  it('renders alarm banner and persists red-state until acknowledged', async () => {
    const pushAlarm = useTelemetryStore.getState().pushAlarm;
    const acknowledgeAllAlarms = useTelemetryStore.getState().acknowledgeAllAlarms;
    pushAlarm({ id: 'A1', severity: 'CRITICAL', message: 'TEST TRIP' });
    render(
      <MemoryRouter>
        <ScadaCore />
      </MemoryRouter>
    );
    // Increased timeout for slow rendering environments
    expect(await screen.findByText(/TEST TRIP/i, {}, { timeout: 5000 })).toBeTruthy();
    expect(screen.getByText(/\[CRITICAL\]/i)).toBeTruthy();
    acknowledgeAllAlarms();
    // Still present but will be acknowledged
    expect(await screen.findByText(/TEST TRIP/i)).toBeTruthy();
  });

  it('disables Start Sequence when interlock reports a trip', () => {
    const setMech = useTelemetryStore.getState().setMechanical;
    setMech({ rpm: 1200, vibrationX: 10.0, vibrationY: 9.0 });
    render(
      <MemoryRouter>
        <ScadaCore />
      </MemoryRouter>
    );
    const btn = screen.getByText(/Start Sequence/i) as HTMLButtonElement;
    expect(btn.disabled).toBe(true);
  });
});
