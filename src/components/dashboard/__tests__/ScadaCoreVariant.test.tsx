import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { ScadaCore } from '../ScadaCore';
import { dispatch } from '../../../lib/events';

describe('ScadaCore variant switching', () => {
  beforeAll(() => {
    // @ts-ignore
    global.ResizeObserver = class {
      observe() {}
      unobserve() {}
      disconnect() {}
    };
  });
  it('renders Pelton mimic when SET_TURBINE_TYPE event dispatched', async () => {
    render(
      <MemoryRouter>
        <ScadaCore />
      </MemoryRouter>
    );
    dispatch.setTurbineType({ family: 'PELTON', variant: 'pelton_multi_jet' });
    expect(await screen.findByText(/Pelton Wheel/i)).toBeTruthy();
  });

  it('renders Kaplan mimic when family KAPLAN selected', async () => {
    render(
      <MemoryRouter>
        <ScadaCore />
      </MemoryRouter>
    );
    dispatch.setTurbineType({ family: 'KAPLAN', variant: 'kaplan_bulb' });
    expect(await screen.findByText(/Inline Bulb/i)).toBeTruthy();
  });
});
