import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import React from 'react';
import { SystemIntegrityCertificate } from '../components/dashboard/SystemIntegrityCertificate';
import { ExecutiveWarRoom } from '../components/dashboard/ExecutiveWarRoom';
import { useTelemetryStore } from '../features/telemetry/store/useTelemetryStore';

const { savePdf } = vi.hoisted(() => ({
  savePdf: vi.fn()
}));

vi.mock('jspdf', () => ({
  default: vi.fn(() => ({
    setFontSize: vi.fn(),
    text: vi.fn(),
    save: savePdf
  }))
}));

vi.mock('../features/reporting/utils/PDFRenderer', () => ({
  PDFRenderer: {
    drawHeader: vi.fn(),
    drawFooter: vi.fn(),
    drawDigitalSeal: vi.fn()
  },
  PAGE_CONFIG: { MARGIN: 10 },
  COLORS: {}
}));

describe('Sovereign UI Smoke Test', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders SystemIntegrityCertificate header', () => {
    render(<SystemIntegrityCertificate />);
    expect(screen.getByText('SYSTEM INTEGRITY CERTIFICATE')).toBeInTheDocument();
  });

  it('renders key integrity badges', () => {
    render(<SystemIntegrityCertificate />);
    expect(screen.getByText('CORE MATH VERIFIED')).toBeInTheDocument();
    expect(screen.getByText('PRECISION: DECIMAL.JS')).toBeInTheDocument();
  });

  it('renders ExecutiveWarRoom panels', () => {
    render(<ExecutiveWarRoom />);
    expect(screen.getByText('Sovereign Verdict')).toBeInTheDocument();
    expect(screen.getByText('Ancestral Wisdom')).toBeInTheDocument();
    expect(screen.getByText('Commander Mode')).toBeInTheDocument();
  });

  it('accepts telemetry updates without crashing', () => {
    useTelemetryStore.getState().updateTelemetry({ mechanical: { rpm: 650 } } as any);
    render(<ExecutiveWarRoom />);
    expect(screen.getByText('Sovereign Verdict')).toBeInTheDocument();
  });

  it('updates RPM slider display', () => {
    const { container } = render(<ExecutiveWarRoom />);
    const slider = container.querySelector('input[type="range"]') as HTMLInputElement | null;
    expect(slider).not.toBeNull();
    fireEvent.change(slider!, { target: { value: '700' } });
    expect(screen.getByText('700 RPM')).toBeInTheDocument();
  });

  it('renders verdict sections', () => {
    render(<ExecutiveWarRoom />);
    expect(screen.getByText('Recommendation')).toBeInTheDocument();
    expect(screen.getByText('Action')).toBeInTheDocument();
    expect(screen.getByText('Financial Impact')).toBeInTheDocument();
  });

  it('generates PDF report on download', () => {
    render(<ExecutiveWarRoom />);
    fireEvent.click(screen.getByText('Download Experience Report'));
    expect(savePdf).toHaveBeenCalledWith('sovereign-report.pdf');
  });
});
