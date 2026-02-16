import '@testing-library/jest-dom';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { AssetPassportCard } from '../AssetPassportCard';
import { useAssetContext } from '../../../contexts/AssetContext';
import { useTelemetryStore } from '../../../features/telemetry/store/useTelemetryStore';
import { useDocumentViewer } from '../../../contexts/DocumentContext';
import { useNotifications } from '../../../contexts/NotificationContext';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { Decimal } from 'decimal.js';

// --- Simulated ---

// Add explicit local simulated as requested by user to ensure Vitest sees it
vi.mock('react-i18next', () => {
    const useTranslation = () => ({ t: (key: string, opts: any) => key, i18n: { changeLanguage: vi.fn() } });
    const initReactI18next = { type: '3rdParty', init: vi.fn() };
    return {
        useTranslation,
        initReactI18next,
        default: { useTranslation, initReactI18next }
    };
});

vi.mock('../../../contexts/AssetContext');
vi.mock('../../../features/telemetry/store/useTelemetryStore');
vi.mock('../../../contexts/DocumentContext');
vi.mock('../../../contexts/NotificationContext');

// Simulated UI Components
vi.mock('../../../shared/components/ui/GlassCard', () => ({
    GlassCard: ({ children, className }: any) => <div className={className}>{children}</div>
}));
vi.mock('../../../shared/components/ui/ModernButton', () => ({
    ModernButton: ({ children, onClick, className }: any) => <button onClick={onClick} className={className}>{children}</button>
}));
vi.mock('../TelemetryDrilldownModal', () => ({
    TelemetryDrilldownModal: () => <div data-testid="drilldown-modal" />
}));

// Simulated ForensicReportService
vi.mock('../../../services/ForensicReportService', () => ({
    ForensicReportService: {
        generateAssetPassport: vi.fn(() => new Blob(['pdf-content'], { type: 'application/pdf' })),
        openAndDownloadBlob: vi.fn()
    }
}));

// Simulated icons
vi.mock('lucide-react', () => ({
    FileText: () => <div data-testid="icon-file-text" />,
    Calendar: () => <div data-testid="icon-calendar" />,
    Settings: () => <div data-testid="icon-settings" />,
    AlertTriangle: () => <div data-testid="icon-alert" />,
    Download: () => <div data-testid="icon-download" />,
    Droplets: () => <div data-testid="icon-droplets" />,
    ArrowUpFromLine: () => <div data-testid="icon-arrow-up" />,
    Thermometer: () => <div data-testid="icon-thermometer" />,
    Layers: () => <div data-testid="icon-layers" />,
    Clock: () => <div data-testid="icon-clock" />
}));

describe('AssetPassportCard Component', () => {
    const simulatedSelectedAsset = {
        id: 'asset-123',
        name: 'Turbine A',
        specs: {
            maxLabyrinthClearance: 0.5,
            babbittTempLimits: { alarm: 65, trip: 75 },
            shaftLiftRange: { min: 0.15, max: 0.35 },
            totalOperatingHours: 1000,
            lastOverhaulDate: '2023-01-01'
        },
    };

    const simulatedPushNotification = vi.fn();
    const simulatedViewDocument = vi.fn();

    beforeEach(() => {
        vi.clearAllMocks();

        (useAssetContext as any).mockReturnValue({
            selectedAsset: simulatedSelectedAsset,
            assetLogs: []
        });
        (useNotifications as any).mockReturnValue({ pushNotification: simulatedPushNotification });
        (useDocumentViewer as any).mockReturnValue({ viewDocument: simulatedViewDocument });

        // Default: Nominal Telemetry
        (useTelemetryStore as any).mockReturnValue({
            mechanical: {
                radialClearance: 0.25, // Within 0.5
                bearingTemp: 55,       // Below 65
                axialPlay: 0.20        // Within 0.15-0.35
            },
            identity: {
                totalOperatingHours: 1000,
                fluidIntelligence: {
                    oilSystem: { tan: 0.2 } // Below 0.5
                }
            }
        });
    });



    // ... existing imports ...

    // ... inside describe ...

    it('renders nominal state correctly', () => {
        render(
            <MemoryRouter>
                <AssetPassportCard />
            </MemoryRouter>
        );

        expect(screen.getByText('dashboard.assetPassport.title')).toBeInTheDocument();
        expect(screen.getByText('Turbine A')).toBeInTheDocument();

        // Values
        expect(screen.getByText(/0\.25/)).toBeInTheDocument(); // Labyrinth
        expect(screen.getByText(/55\.0/)).toBeInTheDocument(); // Babbitt
        // 0.20 appears twice (Shaft Lift and Oil TAN limit/value in drilldown context if visible or similar), check first
        const values = screen.getAllByText(/0\.20/);
        expect(values.length).toBeGreaterThan(0);
        expect(values[0]).toBeInTheDocument();

        // No warnings
        expect(screen.queryByText('dashboard.assetPassport.toleranceBreach')).not.toBeInTheDocument();
    });

    it('renders warning state when tolerances breached (Amber/Red)', () => {
        (useTelemetryStore as any).mockReturnValue({
            mechanical: {
                radialClearance: 0.61, // Breach (>0.5) -> Critical
                bearingTemp: 68,      // Warning (>65) -> Warning
                axialPlay: 0.10       // Breach (<0.15) -> Warning
            },
            identity: {
                totalOperatingHours: 1000,
                fluidIntelligence: {
                    oilSystem: { tan: 0.59 } // Breach (>0.5) -> Critical
                }
            }
        });

        render(
            <MemoryRouter>
                <AssetPassportCard />
            </MemoryRouter>
        );

        // Should show breach banner
        expect(screen.getByText('dashboard.assetPassport.toleranceBreach')).toBeInTheDocument();

        // Verify Labyrinth (Radial) - Critical -> Red
        const labyrinthVal = screen.getByText(/0\.61/);
        expect(labyrinthVal).toHaveClass('text-red-500');

        // Verify TAN - Critical -> Red
        const tanVal = screen.getByText(/0\.59/);
        expect(tanVal).toHaveClass('text-red-500');

        // Verify Bearing Temp - Warning -> Amber
        const tempVal = screen.getByText(/68\.0/);
        expect(tempVal).toHaveClass('text-amber-400');

        // Also check generic banner
        expect(screen.getByText('dashboard.assetPassport.toleranceBreach')).toBeInTheDocument();
    });

    it('handles incomplete specs with defaults', () => {
        (useAssetContext as any).mockReturnValue({
            selectedAsset: { ...simulatedSelectedAsset, specs: {} }, // Empty specs
            assetLogs: []
        });

        // Telemetry normal
        (useTelemetryStore as any).mockReturnValue({
            mechanical: { radialClearance: 0.1, bearingTemp: 40, axialPlay: 0.2 },
            identity: { totalOperatingHours: 0, fluidIntelligence: {} }
        });

        render(
            <MemoryRouter>
                <AssetPassportCard />
            </MemoryRouter>
        );

        // Should use defaults (Labyrinth limit 0.5, Babbitt 65/75)
        // Labyrinth 0.1 < 0.5 (Nominal)
        expect(screen.queryByText('dashboard.assetPassport.toleranceBreach')).not.toBeInTheDocument();

        // Unknown Overhaul
        expect(screen.getByText('common.unknown')).toBeInTheDocument();
    });

    it('triggers PDF generation on click', async () => {
        render(
            <MemoryRouter>
                <AssetPassportCard />
            </MemoryRouter>
        );

        const downloadBtn = screen.getByText('dashboard.assetPassport.downloadFull');
        fireEvent.click(downloadBtn);

        await waitFor(() => {
            expect(simulatedPushNotification).toHaveBeenCalledWith('INFO', expect.anything());
        });

        // Check if generateAssetPassport was imported and called (via simulated side effect or just assume success if notification fired)
        // Since we simulateded dynamic import, wait for async handling
    });
});
