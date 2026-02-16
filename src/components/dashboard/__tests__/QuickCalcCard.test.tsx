import React from 'react';
import '@testing-library/jest-dom';
import { render, fireEvent, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { QuickCalcCard } from '../QuickCalcCard';
import { useAssetContext } from '../../../contexts/AssetContext';
import { useTelemetryStore } from '../../../features/telemetry/store/useTelemetryStore';
import { vi, describe, it, expect, beforeEach } from 'vitest';

// --- Test Doubles ---
const simulatedNavigate = vi.fn();

vi.mock('react-router-dom', async (importOriginal) => {
    const actual = await importOriginal<any>();
    return {
        ...actual,
        useNavigate: () => simulatedNavigate,
    };
});

vi.mock('react-i18next', () => {
    const useTranslation = () => ({ t: (key: string) => key, i18n: { changeLanguage: vi.fn() } });
    const initReactI18next = { type: '3rdParty', init: vi.fn() };
    return {
        useTranslation,
        initReactI18next,
        default: { useTranslation, initReactI18next }
    };
});

vi.mock('lucide-react', () => ({
    Calculator: () => <div data-testid="icon-calculator" />,
    Wrench: () => <div data-testid="icon-wrench" />,
    AlertTriangle: () => <div data-testid="icon-alert" />,
    ArrowRight: () => <div data-testid="icon-arrow" />,
    Target: () => <div data-testid="icon-target" />,
    Ruler: () => <div data-testid="icon-ruler" />,
    Activity: () => <div data-testid="icon-activity" />
}));

vi.mock('../../../contexts/AssetContext');
vi.mock('../../../features/telemetry/store/useTelemetryStore');
vi.mock('../../../shared/components/ui/GlassCard', () => ({
    GlassCard: ({ children, className }: any) => <div className={className}>{children}</div>
}));

describe('QuickCalcCard Component', () => {
    beforeEach(() => {
        vi.clearAllMocks();

        // Default nominal telemetry
        (useTelemetryStore as any).mockReturnValue({
            mechanical: {
                radialClearance: 0.2, // mm
                bladeGap: 2.5, // mm
                vibration: 1.0, // mm/s
                boltSpecs: { diameter: 36, grade: '10.9' } // Fallback
            },
            physics: {}
        });
    });

    it('renders Francis-specific targets correctly (Runner Torque & Labyrinth)', () => {
        (useAssetContext as any).mockReturnValue({
            selectedAsset: {
                id: 'francis-1',
                name: 'Francis Unit',
                turbine_type: 'FRANCIS',
                specs: {
                    boltSpecs: { diameter: 36, grade: '10.9' }, // M36 10.9
                    maxLabyrinthClearance: 0.5,
                    vibrationLimit: 3.5
                }
            }
        });

        const { getByText } = render(
            <MemoryRouter>
                <QuickCalcCard />
            </MemoryRouter>
        );

        // 1. Check Torque Calculation
        expect(getByText('Runner Coupling Torque')).toBeInTheDocument();
        expect(getByText('Nm')).toBeInTheDocument();

        // 2. Check Labyrinth Clearance Target
        expect(getByText('Max Labyrinth Gap')).toBeInTheDocument();
        expect(getByText('0.50')).toBeInTheDocument(); // Target
    });

    it('renders Kaplan-specific targets correctly (Blade Bolts & Gap)', () => {
        (useAssetContext as any).mockReturnValue({
            selectedAsset: {
                id: 'kaplan-1',
                name: 'Kaplan Unit',
                turbine_type: 'KAPLAN',
                specs: {
                    boltSpecs: { diameter: 42, grade: '12.9' },
                    minBladeGap: 2.0,
                    vibrationLimit: 4.5
                }
            }
        });

        const { getByText } = render(
            <MemoryRouter>
                <QuickCalcCard />
            </MemoryRouter>
        );

        // 1. Check Blade Bolt Label
        expect(getByText('Blade Bolt Torque')).toBeInTheDocument();

        // 2. Check Blade Gap Label
        expect(getByText('Min Blade Tip Gap')).toBeInTheDocument();
        expect(getByText('2.0')).toBeInTheDocument(); // Target
    });

    it('triggers navigation on card click', () => {
        (useAssetContext as any).mockReturnValue({
            selectedAsset: {
                id: 'francis-1',
                name: 'Francis Unit',
                specs: { boltSpecs: { diameter: 36, grade: '10.9' } }
            }
        });

        const { getByText } = render(
            <MemoryRouter>
                <QuickCalcCard />
            </MemoryRouter>
        );

        // Click Torque Card
        const torqueLabel = getByText('Runner Coupling Torque');
        // Find the button ancestor
        const button = torqueLabel.closest('button');
        expect(button).toBeInTheDocument();
        fireEvent.click(button!);

        expect(simulatedNavigate).toHaveBeenCalledWith('/maintenance/bolt-torque');
    });

    it('shows critical alerts when limits exceeded', () => {
        (useAssetContext as any).mockReturnValue({
            selectedAsset: {
                id: 'francis-1',
                name: 'Francis Unit',
                turbine_type: 'FRANCIS',
                specs: {
                    maxLabyrinthClearance: 0.5,
                    vibrationLimit: 3.5
                }
            }
        });

        (useTelemetryStore as any).mockReturnValue({
            mechanical: {
                radialClearance: 0.8, // Breach (>0.5)
                vibration: 6.0,       // Breach (>3.5 * 1.5) -> Critical
            },
            physics: {}
        });

        const { getByText, container } = render(
            <MemoryRouter>
                <QuickCalcCard />
            </MemoryRouter>
        );

        // Check for Limits Exceeded visual indicator (Amber border)
        // The simulated GlassCard renders the className, so we check for the warning class
        const title = getByText('dashboard.quickCalc.title');
        // The title is deep inside, so simpler to check if the specific warning class exists in the document
        // Component logic: border-l-amber-500 is applied when hasWarnings is true (which is true for warnings AND criticals in this implementation seems to imply warning color for border, or maybe logic is more complex. 
        // Logic says: hasWarnings ? 'border-l-amber-500' : ...
        // and hasWarnings = specCards.some(c => c.status !== 'nominal')
        // Here we have Critical and Warning, so hasWarnings is true.
        const card = container.querySelector('.border-l-amber-500');
        expect(card).toBeInTheDocument();

        // Check actual current values are rendered
        // 0.80 might appear multiple times (value + drilldown/ref if any), verify at least one visible
        const labClearance = screen.getAllByText(/0\.80/);
        expect(labClearance.length).toBeGreaterThan(0);
        expect(labClearance[0]).toBeInTheDocument();

        // 6.00 might appear multiple times
        const vibration = screen.getAllByText(/6\.00/);
        expect(vibration.length).toBeGreaterThan(0);
        expect(vibration[0]).toBeInTheDocument();
    });
});
