import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import React from 'react';
import App from '../App';

// Mock the components (lazy loaded in App)
vi.mock('../components/ToolboxLaunchpad.tsx', () => ({
    ToolboxLaunchpad: () => <div data-testid="toolbox-fail">TOOLBOX_FAIL</div>
}));

vi.mock('../components/diagnostic-twin/FleetOverview.tsx', () => ({
    FleetOverview: () => <div data-testid="fleet-success">FLEET_SUCCESS</div>
}));

// Mock complex providers/hooks to avoid crash
vi.mock('../contexts/AuthContext.tsx', () => ({
    useAuth: () => ({ user: { id: 'test-user', role: 'ENGINEER' }, loading: false, signOut: vi.fn() }),
    AuthProvider: ({ children }: any) => <>{children}</>
}));

// Mock useSovereignSync and others
vi.mock('../hooks/useSovereignSync.ts', () => ({ useSovereignSync: () => { } }));
vi.mock('../hooks/useSentinelWatchdog.ts', () => ({ useSentinelWatchdog: () => { } }));
vi.mock('../hooks/useSafeExit', () => ({ useSafeExit: () => { } }));

// Mock BootstrapService to avoid real boot delay
vi.mock('../services/BootstrapService', () => ({
    BootstrapService: {
        boot: () => Promise.resolve()
    }
}));

describe('NC-25200: Black Hole Fix Verification', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        localStorage.clear();
        // Reset URL hash
        window.location.hash = '';
    });

    it('redirects from root (/) to /fleet immediately', async () => {
        render(<App />);

        // We expect FleetOverview to appear, NOT ToolboxLaunchpad
        // This confirms <Route index element={<Navigate to="/fleet" />} /> is working

        await waitFor(() => {
            const fleet = screen.queryByText('FLEET_SUCCESS');
            const toolbox = screen.queryByText('TOOLBOX_FAIL');

            if (toolbox) {
                throw new Error('FAIL: Rendered ToolboxLaunchpad instead of redirecting!');
            }

            expect(fleet).toBeInTheDocument();
        }, { timeout: 10000 });

        console.log('✅ VERIFIED: App redirected to FleetOverview.');
    });
});
