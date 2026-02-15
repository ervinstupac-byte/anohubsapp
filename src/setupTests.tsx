import React from 'react';
import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Mock react-i18next
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
    i18n: {
      changeLanguage: () => new Promise(() => {}),
    },
  }),
  initReactI18next: {
    type: '3rdParty',
    init: () => {},
  },
}));

// Mock Recharts to avoid ResizeObserver errors and memory issues
vi.mock('recharts', () => {
  return {
    ResponsiveContainer: ({ children }: { children: any }) => (
      <div style={{ width: 800, height: 800 }}>{children}</div>
    ),
    LineChart: () => <div>LineChart</div>,
    Line: () => <div>Line</div>,
    XAxis: () => <div>XAxis</div>,
    YAxis: () => <div>YAxis</div>,
    CartesianGrid: () => <div>CartesianGrid</div>,
    Tooltip: () => <div>Tooltip</div>,
    Legend: () => <div>Legend</div>,
    AreaChart: () => <div>AreaChart</div>,
    Area: () => <div>Area</div>,
    BarChart: () => <div>BarChart</div>,
    Bar: () => <div>Bar</div>,
    PieChart: () => <div>PieChart</div>,
    Pie: () => <div>Pie</div>,
    Cell: () => <div>Cell</div>,
    Sector: () => <div>Sector</div>
  };
});

// Mock Supabase
vi.mock('@supabase/supabase-js', () => ({
  createClient: () => ({
    from: () => ({
      select: () => ({
        eq: () => ({
          single: () => Promise.resolve({ data: null, error: null }),
        }),
      }),
    }),
  }),
}));
