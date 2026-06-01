import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { act } from 'react';
import { MemoryRouter } from 'react-router-dom';
import { ScadaCore } from '../ScadaCore';
import { dispatch } from '../../../lib/events';
import { useProjectConfigStore } from '../../../features/config/ProjectConfigStore';

describe('ScadaCore Pelton nozzle binding', () => {
  beforeAll(() => {
    // @ts-ignore
    global.ResizeObserver = class { observe() {} unobserve() {} disconnect() {} };
  });

  it('renders number of jets based on ProjectConfigStore', async () => {
    const s = useProjectConfigStore.getState();
    act(() => s.setConfig('PELTON', { pelton: { nozzleCount: 4 } }));
    render(
      <MemoryRouter>
        <ScadaCore />
      </MemoryRouter>
    );
    await act(async () => dispatch.setTurbineType({ family: 'PELTON', variant: 'pelton_multi_jet' }));
    // The mimic creates a path per jet between penstock and wheel — wait for rendering
    const label = await screen.findByText(/Pelton Wheel/i);
    const container = label.parentElement?.parentElement as HTMLElement;
    await waitFor(() => {
      const jetPaths = container.querySelectorAll('path');
      expect(jetPaths.length).toBeGreaterThanOrEqual(4);
    }, { timeout: 2000 });
  });
});
