import React from 'react';
import '../../i18n';
import { render, screen } from '@testing-library/react';
import { describe, it, vi, beforeEach } from 'vitest';

// Mock supabase to avoid network calls
vi.mock('../../../src/services/supabaseClient.ts', () => {
  return {
    supabase: {
      from: (table: string) => ({
        select: async () => ({ count: 0 })
      }),
      auth: {
        getSession: async () => ({ data: { session: { user: { email: 'test.user@example.com' } } } }),
        onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } })
      }
    },
    getTableCount: async (table: string) => 0
  };
});

// Provide a mocked Auth context so components using useAuth work in test
vi.mock('../../../src/contexts/AuthContext.tsx', () => ({
  useAuth: () => ({ user: { email: 'test.user@example.com' }, session: null, signOut: async () => {}, loading: false }),
  AuthProvider: ({ children }: any) => children
}));

import { Hub } from '../Hub.tsx';
import { NavigationProvider } from '../../../src/contexts/NavigationContext.tsx';

const MockProviders: React.FC<{children: React.ReactNode}> = ({ children }) => (
  <NavigationProvider value={{ navigateTo: () => {}, navigateBack: () => {}, navigateToHub: () => {}, navigateToTurbineDetail: () => {}, showFeedbackModal: () => {} }}>
    {children}
  </NavigationProvider>
);

describe('Hub', () => {
  beforeEach(() => {
    // noop
  });

  it('renders core headings and metrics', async () => {
    render(
      <MockProviders>
        <Hub />
      </MockProviders>
    );

    expect(await screen.findByText(/Welcome,/i)).toBeDefined();
    expect(screen.getByText(/Operational Modules/i)).toBeDefined();
    expect(screen.getByText(/Global Standard of Excellence Enforcement Platform\./i)).toBeDefined();
  });
});
