import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { act } from 'react';
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
    await act(async () => {
      dispatch.setTurbineType({ family: 'PELTON', variant: 'pelton_multi_jet' });
    });
    await waitFor(
      async () => {
        expect(await screen.findByText(/Pelton Wheel/i)).toBeTruthy();
      },
      { timeout: 2000 }
    );
  });

  it('renders Kaplan mimic when family KAPLAN selected', async () => {
    render(
      <MemoryRouter>
        <ScadaCore />
      </MemoryRouter>
    );
    await act(async () => {
      dispatch.setTurbineType({ family: 'KAPLAN', variant: 'kaplan_bulb' });
    });
    await waitFor(
      async () => {
        expect(await screen.findByText(/Inline Bulb/i)).toBeTruthy();
      },
      { timeout: 2000 }
    );
  });
});
