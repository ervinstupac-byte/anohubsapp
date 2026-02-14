import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
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
    s.setConfig('PELTON', { pelton: { nozzleCount: 4 } });
    render(
      <MemoryRouter>
        <ScadaCore />
      </MemoryRouter>
    );
    dispatch.setTurbineType({ family: 'PELTON', variant: 'pelton_multi_jet' });
    // The mimic creates a path per jet between penstock and wheel
    const label = await screen.findByText(/Pelton Wheel/i);
    const container = label.parentElement?.parentElement as HTMLElement;
    const jetPaths = container.querySelectorAll('path');
    expect(jetPaths.length).toBeGreaterThanOrEqual(4);
  });
});
