import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { ScadaCore } from '../ScadaCore';

describe('ScadaCore control overlay', () => {
  beforeAll(() => {
    // @ts-ignore
    global.ResizeObserver = class {
      observe() {}
      unobserve() {}
      disconnect() {}
    };
  });
  
  it('renders professional SCADA schematics', () => {
    render(
      <MemoryRouter>
        <ScadaCore />
      </MemoryRouter>
    );
    // Test that professional ISA 101 schematics are rendered
    expect(screen.getByText(/LOSS TRACER/i)).toBeTruthy();
    // Test for professional equipment labels
    expect(screen.getByText(/BEARING/i)).toBeTruthy();
  });
});
