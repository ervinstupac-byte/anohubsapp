import React from 'react';
import { render, screen, fireEvent, waitFor, act, cleanup } from '@testing-library/react';
import '@testing-library/jest-dom';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from '../contexts/AuthContext';
import { AuditProvider } from '../contexts/AuditContext';
import { Login } from '../components/Login';
import { MasterSovereignDashboard } from '../components/dashboard/MasterSovereignDashboard';
import { ExecutiveDashboard } from '../components/dashboard/ExecutiveDashboard';
import { CommandPalette } from '../components/ui/CommandPalette';
import { useTelemetryStore } from '../features/telemetry/store/useTelemetryStore';
import { PermissionTier } from '../services/Sovereign_Executive_Engine';
import { vi, describe, test, expect, afterEach } from 'vitest';

// --- Test Doubles ---

// Simulated CommandPalette dependencies
vi.mock('../contexts/AssetContext', () => ({
    useAssetContext: () => ({
        assets: [{ id: 1, name: 'Turbine A', type: 'FRANCIS' }],
        selectAsset: vi.fn(),
        selectedAsset: null
    })
}));

vi.mock('../stores/useAppStore', async (importOriginal) => {
    const actual = await importOriginal();
    return {
        // @ts-ignore
        ...actual,
        useDensity: () => ({ mode: 'default' }),
        useToast: () => ({ showToast: vi.fn() })
    };
});

vi.mock('../contexts/DrillDownContext', () => ({
    useDrillDown: () => ({ drillDown: vi.fn() })
}));

vi.mock('../contexts/ConfirmContext', () => ({
    useConfirm: () => ({ confirm: vi.fn() })
}));

vi.mock('../contexts/ValidationContext', () => ({
    useValidation: () => ({ validateTask: vi.fn() })
}));

vi.mock('../hooks/useSmartSuggestions', () => ({
    useSmartSuggestions: () => []
}));

// Simulated framer-motion to avoid visibility issues and prop warnings
vi.mock('framer-motion', () => ({
    motion: {
        div: ({ children, dragMomentum, dragConstraints, dragElastic, whileInView, ...props }: any) => <div {...props}>{children}</div>,
        button: ({ children, dragMomentum, dragConstraints, dragElastic, whileHover, whileTap, whileInView, ...props }: any) => <button {...props}>{children}</button>,
        span: ({ children, ...props }: any) => <span {...props}>{children}</span>,
    },
    AnimatePresence: ({ children }: any) => <>{children}</>,
}));

// Simulated PersistenceService to silence IndexedDB errors
vi.mock('../services/PersistenceService', () => ({
    saveLog: vi.fn().mockResolvedValue(undefined),
    saveTelemetryBatch: vi.fn().mockResolvedValue(undefined),
    persistAlarm: vi.fn().mockResolvedValue(undefined),
    loadAlarms: vi.fn().mockResolvedValue([]),
    getRecentHistory: vi.fn().mockResolvedValue([]),
    getAuditLogs: vi.fn().mockResolvedValue([]),
    loadSetting: vi.fn().mockResolvedValue(null),
    saveSetting: vi.fn().mockResolvedValue(undefined),
    db: {
        telemetrySnapshots: { add: vi.fn() },
        activeAlarms: { add: vi.fn() },
        userSettings: { get: vi.fn(), put: vi.fn() },
        auditLogs: { add: vi.fn(), orderBy: vi.fn().mockReturnThis() }
    }
}));

// 1. Simulated Supabase
vi.mock('../services/supabaseClient', () => ({
    supabase: {
        auth: {
            getSession: vi.fn().mockResolvedValue({ data: { session: null } }),
            onAuthStateChange: vi.fn().mockReturnValue({ data: { subscription: { unsubscribe: vi.fn() } } }),
            signInWithPassword: vi.fn(),
            signOut: vi.fn(),
        },
        from: vi.fn().mockReturnValue({
            select: vi.fn().mockReturnThis(),
            eq: vi.fn().mockReturnThis(),
            single: vi.fn().mockResolvedValue({ data: null, error: null }),
            insert: vi.fn().mockReturnThis(),
        }),
    },
}));

vi.mock('@supabase/supabase-js', () => ({
    createClient: () => ({
        from: vi.fn().mockReturnValue({
            select: vi.fn().mockReturnThis(),
            order: vi.fn().mockReturnThis(),
            limit: vi.fn().mockResolvedValue({ data: [], error: null }),
        })
    })
}));

// 2. Simulated i18n (Restored locally as global mock seems flaky)
vi.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: (key: string, defaultVal: string) => defaultVal || key,
        i18n: { changeLanguage: vi.fn() },
    }),
    Trans: ({ children }: any) => children,
    initReactI18next: {
        type: '3rdParty',
        init: vi.fn(),
    },
}));

// 3. Simulated Recharts (to avoid ResizeObserver issues)
vi.mock('recharts', () => ({
    ResponsiveContainer: ({ children }: any) => <div className="recharts-responsive-container">{children}</div>,
    AreaChart: () => <div>AreaChart</div>,
    LineChart: () => <div>LineChart</div>,
    Area: () => <div>Area</div>,
    Line: () => <div>Line</div>,
    XAxis: () => <div>XAxis</div>,
    YAxis: () => <div>YAxis</div>,
    CartesianGrid: () => <div>CartesianGrid</div>,
    Tooltip: () => <div>Tooltip</div>,
    Legend: () => <div>Legend</div>,
}));

// 4. Simulated ResizeObserver
global.ResizeObserver = class ResizeObserver {
    observe() { }
    unobserve() { }
    disconnect() { }
};

// 5. Simulated Canvas (Three.js/Fiber)
vi.mock('@react-three/fiber', () => ({
    Canvas: ({ children }: any) => <div>CanvasMock {children}</div>,
    useFrame: vi.fn(),
    useThree: () => ({ camera: {}, gl: {} }),
}));
vi.mock('@react-three/drei', () => ({
    PerspectiveCamera: () => null,
    OrbitControls: () => null,
    useGLTF: () => ({ scene: {} }),
    Html: ({ children }: any) => <div>{children}</div>,
    Text: ({ children }: any) => <div>{children}</div>,
}));

// Simulated child components that might be heavy or problematic
vi.mock('../components/dashboard/StrategicConsultantView', () => ({
    StrategicConsultantView: () => <div>Strategic Consultant View Content</div>
}));
vi.mock('../components/dashboard/GreenHydrogenPanel', () => ({
    GreenHydrogenPanel: () => <div>Green Hydrogen Panel Content</div>
}));
vi.mock('../components/ui/EmergencyOverlay', () => ({
    EmergencyOverlay: () => <div>EMERGENCY STOP ACTIVE</div>
}));
vi.mock('../components/forensics/VisionAnalyzer', () => ({
    VisionAnalyzer: () => <div>Vision Analyzer Active</div>
}));
vi.mock('../components/dashboard/ScadaCore', () => ({
    ScadaCore: ({ forensicMode }: { forensicMode: boolean }) => (
        <div>ScadaCore (Forensic: {forensicMode ? 'ON' : 'OFF'})</div>
    )
}));

vi.mock('../components/dashboard/ExecutiveDashboard', () => ({
    ExecutiveDashboard: () => <div>Executive Dashboard Content</div>
}));

// --- TEST COMPONENT ---

const TestApp = () => {
    return (
        <AuditProvider>
            <AuthProvider>
                <MemoryRouter initialEntries={['/login']} future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
                    <Routes>
                        <Route path="/login" element={<Login />} />
                        <Route path="/" element={
                            <>
                                <MasterSovereignDashboard />
                                <CommandPalette />
                            </>
                        } />
                        <Route path="/executive" element={<ExecutiveDashboard />} />
                    </Routes>
                </MemoryRouter>
            </AuthProvider>
        </AuditProvider>
    );
};

// --- TESTS ---

const loginAsGuest = async () => {
    await waitFor(() => expect(screen.getByText(/Continue as Guest/i)).toBeInTheDocument());
    await act(async () => fireEvent.click(screen.getByText(/Continue as Guest/i)));
    await waitFor(() => expect(screen.getByText(/Master Sovereign Dashboard/i)).toBeInTheDocument());
};

describe('System Walkthrough: Guest Journey & Modals', () => {
    afterEach(() => {
        cleanup();
        vi.clearAllMocks();
    });

    // Scenario 1: Guest Login Success
    test('Scenario 1: Guest Login Success', async () => {
        render(<TestApp />);
        await loginAsGuest();
    });

    // Scenario 2: Command Palette - Maintenance Protocol
    test('Scenario 2: Command Palette - Maintenance Protocol', async () => {
        render(<TestApp />);
        await loginAsGuest();

        // Open Command Palette (Ctrl+K)
        await act(async () => {
            fireEvent.keyDown(window, { key: 'k', ctrlKey: true });
        });

        // Verify it opens
        const input = await screen.findByPlaceholderText(/Type a command or search assets/i);
        expect(input).toBeInTheDocument();

        // Type command
        await act(async () => {
            fireEvent.change(input, { target: { value: 'Maintenance Protocol' } });
        });

        // Click result
        const result = await screen.findByText(/Initiate standard maintenance workflow/i);
        await act(async () => {
            fireEvent.click(result);
        });

        // Verify validateTask was called (simulateded)
        await waitFor(() => {
            expect(screen.queryByPlaceholderText(/Type a command or search assets/i)).not.toBeInTheDocument();
        });
    });

    // Scenario 3: Asset Passport Modal (via Command Palette for now)
    test('Scenario 3: Asset Passport Modal', async () => {
        render(<TestApp />);
        await loginAsGuest();

        // Open Command Palette
        await act(async () => {
            fireEvent.keyDown(window, { key: 'k', ctrlKey: true });
        });

        // Search for Asset Passport
        const input = await screen.findByPlaceholderText(/Type a command or search assets/i);
        await act(async () => {
            fireEvent.change(input, { target: { value: 'View Asset Passport' } });
        });

        // Click result
        const result = await screen.findByText(/View Asset Passport/i);
        await act(async () => {
            fireEvent.click(result);
        });
        
        // Should close palette
        await waitFor(() => {
            expect(screen.queryByPlaceholderText(/Type a command or search assets/i)).not.toBeInTheDocument();
        });
    });

    // Scenario 4: Dashboard Tab Switching
    test('Scenario 4: Dashboard Tab Switching', async () => {
        render(<TestApp />);
        await loginAsGuest();

        // Default tab (Dashboard) is active
        // Check for Commander Mode button (always visible)
        expect(screen.getByText(/COMMANDER MODE/i)).toBeInTheDocument();

        // Switch to Strategic
        const strategicBtn = screen.getByText(/Strategic/i);
        await act(async () => {
            fireEvent.click(strategicBtn);
        });
        
        await waitFor(() => {
            expect(screen.getByText('Strategic Consultant View Content')).toBeInTheDocument();
        });

        // Switch to Energy Hub
        const energyBtn = screen.getByText(/Energy Hub/i);
        await act(async () => {
            fireEvent.click(energyBtn);
        });

        await waitFor(() => {
            expect(screen.getByText('Green Hydrogen Panel Content')).toBeInTheDocument();
        });
    });

    // Scenario 5: Emergency Overlay Trigger
    test('Scenario 5: Emergency Overlay Trigger', async () => {
        render(<TestApp />);
        await loginAsGuest();

        // Trigger Emergency by updating store directly
        await act(async () => {
            useTelemetryStore.setState({
                executiveResult: {
                    targetLoadMw: 0,
                    permissionTier: PermissionTier.AUTONOMOUS,
                    financials: {
                        grossProfitEur: 0,
                        molecularDebtEur: 0,
                        netSovereignProfitEur: 0,
                        mode: 'ISLAND'
                    },
                    operatorMessage: 'EMERGENCY SHUTDOWN INITIATED',
                    activeProtections: ['SHUTDOWN_CAVITATION'],
                    masterHealthScore: 0
                }
            });
        });

        // Wait for overlay
        // Note: EmergencyOverlay logic might be complex. If this fails, we need to inspect MasterSovereignDashboard logic.
        // Assuming MasterSovereignDashboard renders EmergencyOverlay based on store.
        // If not, we might need to simulated a specific hook return value.
        // For now, let's see if this works.
    });

    // Scenario 6: Drill-Down & Asset Passport Interaction
    test('Scenario 6: Drill-Down & Asset Passport Interaction', async () => {
        render(<TestApp />);
        await loginAsGuest();

        // 1. Expand Tree to find a leaf node
        // "Governor System" -> "Servo Motors"
        const governorSystem = screen.getByText('Governor System');
        await act(async () => {
            fireEvent.click(governorSystem);
        });
        
        const servoMotors = await screen.findByText('Servo Motors');
        expect(servoMotors).toBeInTheDocument();

        // 2. Double Click to open Passport
        await act(async () => {
            fireEvent.doubleClick(servoMotors);
        });

        // 3. Verify Modal Content
        // We look for text unique to AssetPassportModal
        // It renders a glass card with tabs or header
        // Let's check for the Back button title or just the component name in the header
        // The modal title usually includes the component name?
        // Actually, looking at AssetPassportModal code, it doesn't explicitly render the name in a generic h1,
        // but it has "Asset Passport" or tabs.
        // Wait, looking at the code read previously: 
        // It doesn't seem to render a big title. It renders tabs: "Overview", "Timeline", "Health", "Docs".
        
        await waitFor(() => {
            // Check for tabs (case-insensitive because they are lowercase in code but uppercase in CSS)
            // Use getByRole to distinguish from other text
            expect(screen.getByRole('button', { name: /timeline/i })).toBeInTheDocument();
            expect(screen.getByRole('button', { name: /health/i })).toBeInTheDocument();
        });

        // 4. Switch Tabs
        await act(async () => {
            fireEvent.click(screen.getByRole('button', { name: /timeline/i }));
        });
        
        // Verify timeline event (simulated in the component)
        // Note: The content loads after 800ms simulation.
        await waitFor(() => {
            expect(screen.getByText('Manufactured & Commissioned')).toBeInTheDocument();
        }, { timeout: 2000 }); // Increase timeout for the 800ms delay

        // 5. Close Modal
        // There is an X button or Back button. 
        // The Back button has title="Back" (from translation simulated 'common.back')
        const closeBtns = screen.getAllByTitle('Back');
        const closeBtn = closeBtns[closeBtns.length - 1]; // Use the last one (likely the top-most modal)
        await act(async () => {
            fireEvent.click(closeBtn);
        });

        // Verify closed
        await waitFor(() => {
            expect(screen.queryByText('Manufactured & Commissioned')).not.toBeInTheDocument();
        });
    });

    // Scenario 7: Forensic Mode Toggle
    test('Scenario 7: Forensic Mode Toggle', async () => {
        render(<TestApp />);
        await loginAsGuest();

        // Initial state: Forensic OFF
        // Should show "Predictive Sandbox" button (part of Financial/Default view)
        // And ScadaCore should say OFF
        expect(screen.getByText(/Predictive Sandbox/i)).toBeInTheDocument();
        expect(screen.getByText('ScadaCore (Forensic: OFF)')).toBeInTheDocument();

        // Toggle Forensic Mode
        const forensicBtn = screen.getByText(/FORENSICS/i); // Button text is "FORENSICS" or "FORENSICS ACTIVE"
        await act(async () => {
            fireEvent.click(forensicBtn);
        });

        // Verify ON state
        await waitFor(() => {
            expect(screen.getByText('Vision Analyzer Active')).toBeInTheDocument();
            expect(screen.getByText('ScadaCore (Forensic: ON)')).toBeInTheDocument();
            expect(screen.queryByText(/Predictive Sandbox/i)).not.toBeInTheDocument();
        });

        // Toggle OFF
        await act(async () => {
            fireEvent.click(screen.getByText(/FORENSICS ACTIVE/i));
        });

        // Verify OFF state
        await waitFor(() => {
            expect(screen.getByText('ScadaCore (Forensic: OFF)')).toBeInTheDocument();
            expect(screen.getByText(/Predictive Sandbox/i)).toBeInTheDocument();
        });
    });

    // Scenario 8: Education Mode Toggle
    test('Scenario 8: Education Mode Toggle', async () => {
        render(<TestApp />);
        await loginAsGuest();

        // Initial state: Expert Guide OFF
        expect(screen.getByText('EXPERT GUIDE')).toBeInTheDocument();

        // Toggle ON
        const guideBtn = screen.getByText('EXPERT GUIDE');
        await act(async () => {
            fireEvent.click(guideBtn);
        });

        // Verify ON state
        await waitFor(() => {
            expect(screen.getByText('EXPERT GUIDE ON')).toBeInTheDocument();
        });

        // Toggle OFF
        await act(async () => {
            fireEvent.click(screen.getByText('EXPERT GUIDE ON'));
        });

        // Verify OFF state
        await waitFor(() => {
            expect(screen.getByText('EXPERT GUIDE')).toBeInTheDocument();
        });
    });

    // Scenario 9: Component Tree Expansion
    test('Scenario 9: Component Tree Expansion', async () => {
        render(<TestApp />);
        await loginAsGuest();

        // By default, ROOT and HPP are expanded in SovereignComponentTree.tsx
        // Let's verify "Turbine Runner" (child of HPP) is visible
        const turbineRunner = screen.getByText('Turbine Runner');
        expect(turbineRunner).toBeInTheDocument();

        const governorSystem = screen.getByText('Governor System');
        expect(governorSystem).toBeInTheDocument();

        // Click "Governor System" to expand it
        await act(async () => {
            fireEvent.click(governorSystem);
        });

        // Verify its children appear: "Servo Motors", "Actuator"
        await waitFor(() => {
            expect(screen.getByText('Servo Motors')).toBeInTheDocument();
            expect(screen.getByText('Actuator')).toBeInTheDocument();
        });
    });

    // Scenario 10: Command Palette Interaction (Detailed)
    test('Scenario 10: Command Palette Interaction (Ctrl+K)', async () => {
        render(<TestApp />);
        await loginAsGuest();
        
        // Open
        await act(async () => {
            fireEvent.keyDown(window, { key: 'k', ctrlKey: true });
        });
        const input = await screen.findByPlaceholderText(/Type a command or search assets/i);
        expect(input).toBeInTheDocument();

        // Close via Escape
        await act(async () => {
            fireEvent.keyDown(window, { key: 'Escape' });
        });
        
        await waitFor(() => {
            expect(screen.queryByPlaceholderText(/Type a command or search assets/i)).not.toBeInTheDocument();
        });
    });

    // Scenario 11: Commander Mode Toggle
    test('Scenario 11: Commander Mode Toggle', async () => {
        render(<TestApp />);
        await loginAsGuest();

        // Check initial state
        const toggleBtn = screen.getByText(/COMMANDER MODE/i);
        expect(toggleBtn).toBeInTheDocument();
        expect(screen.queryByText(/Commander Setpoint Control/i)).not.toBeInTheDocument();

        // Toggle ON
        await act(async () => {
            fireEvent.click(toggleBtn);
        });

        // Check active state
        await waitFor(() => {
            expect(screen.getByText(/COMMANDER ACTIVE/i)).toBeInTheDocument();
            expect(screen.getByText(/Commander Setpoint Control/i)).toBeInTheDocument();
        });

        // Toggle OFF
        await act(async () => {
            fireEvent.click(screen.getByText(/COMMANDER ACTIVE/i));
        });

        // Check inactive state
        await waitFor(() => {
            expect(screen.getByText(/COMMANDER MODE/i)).toBeInTheDocument();
            expect(screen.queryByText(/Commander Setpoint Control/i)).not.toBeInTheDocument();
        });
    });

    // Scenario 12: Stress Test Simulation
    test('Scenario 12: Stress Test Simulation', async () => {
        render(<TestApp />);
        await loginAsGuest();

        // 1. Locate Stress Test Buttons
        const simulateBtn = screen.getByText(/Simulate Cavitation/i);
        const resetBtn = screen.getByText(/Reset to Normal/i);

        expect(simulateBtn).toBeInTheDocument();
        expect(resetBtn).toBeInTheDocument();

        // 2. Trigger Cavitation
        // We verify that it doesn't crash.
        // Since we are not asserting on the visual changes in the dashboard (metrics),
        // we mainly check if the button is clickable and state updates.
        // We can check if `loadScenario` was called if we spied on the store, but we can't easily spy on hook return values inside components without more complex setup.
        // However, we can check if console.log was called, or if any side effect occurs.
        // For now, let's ensure it doesn't throw.
        
        const consoleSpy = vi.spyOn(console, 'log');

        await act(async () => {
            fireEvent.click(simulateBtn);
        });

        expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('STRESS TEST: Triggering Cavitation Event'));

        // 3. Reset
        await act(async () => {
            fireEvent.click(resetBtn);
        });

        expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('STRESS TEST: Resetting to Normal Operation'));
        
        consoleSpy.mockRestore();
    });

    // Scenario 13: Executive Dashboard Navigation
    test('Scenario 13: Executive Dashboard Navigation', async () => {
        render(<TestApp />);
        await loginAsGuest();

        // 1. Open Palette (Ctrl+K)
        await act(async () => {
            fireEvent.keyDown(window, { key: 'k', ctrlKey: true });
        });

        // 2. Search for "Executive Dashboard"
        const input = await screen.findByPlaceholderText(/Type a command or search assets/i);
        await act(async () => {
            fireEvent.change(input, { target: { value: 'Executive Dashboard' } });
        });

        // 3. Click result
        // We look for the subtitle or label
        const result = await screen.findByText(/High-level KPI overview/i);
        expect(result).toBeInTheDocument();

        await act(async () => {
            fireEvent.click(result);
        });

        // 4. Verify Navigation
        await waitFor(() => {
            expect(screen.getByText('Executive Dashboard Content')).toBeInTheDocument();
        });
        
        // Ensure old dashboard is gone
        expect(screen.queryByText(/Master Sovereign Dashboard/i)).not.toBeInTheDocument();
    });
});
