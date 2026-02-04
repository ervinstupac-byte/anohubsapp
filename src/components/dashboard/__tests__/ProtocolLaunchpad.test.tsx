import '@testing-library/jest-dom';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ProtocolLaunchpad } from '../ProtocolLaunchpad';
import { useAssetContext } from '../../../contexts/AssetContext';
import { useTelemetryStore } from '../../../features/telemetry/store/useTelemetryStore';
import { useSyncWatcher } from '../../../hooks/useSyncWatcher';
import { useDocumentViewer } from '../../../contexts/DocumentContext';
import { useNotifications } from '../../../contexts/NotificationContext';
import { LocalLedger } from '../../../services/LocalLedger';
import { vi } from 'vitest';

// --- MOCKS ---

vi.mock('react-i18next', () => ({
    useTranslation: () => ({ t: (key: string) => key, i18n: { changeLanguage: vi.fn() } }),
    initReactI18next: { type: '3rdParty', init: vi.fn() }
}));

vi.mock('../../../contexts/AssetContext');
vi.mock('../../../features/telemetry/store/useTelemetryStore');
vi.mock('../../../hooks/useSyncWatcher');
vi.mock('../../../contexts/DocumentContext');
vi.mock('../../../contexts/NotificationContext');
vi.mock('../../../services/LocalLedger');

// Mock ForensicReportService
vi.mock('../../../services/ForensicReportService', () => ({
    ForensicReportService: {
        generateAuditReport: vi.fn(() => new Blob(['pdf-content'], { type: 'application/pdf' })),
        generateDiagnosticDossier: vi.fn(() => new Blob(['pdf-content'], { type: 'application/pdf' })),
        generateFieldAuditReport: vi.fn(() => new Blob(['pdf-content'], { type: 'application/pdf' })),
        openAndDownloadBlob: vi.fn()
    }
}));

describe('ProtocolLaunchpad Component', () => {
    const mockSelectedAsset = {
        id: 123,
        name: 'Turbine A',
        specs: { rpm: 100 },
    };

    const mockPushNotification = vi.fn();
    const mockViewDocument = vi.fn();

    beforeEach(() => {
        vi.clearAllMocks();

        (useAssetContext as any).mockReturnValue({ selectedAsset: mockSelectedAsset });
        (useNotifications as any).mockReturnValue({ pushNotification: mockPushNotification });
        (useDocumentViewer as any).mockReturnValue({ viewDocument: mockViewDocument });

        // Default: Online, Synced, Data available
        (useSyncWatcher as any).mockReturnValue({
            hasPendingData: false,
            pendingCount: 0,
            syncStatus: 'IDLE',
            isOnline: true
        });

        (useTelemetryStore as any).mockReturnValue({
            mechanical: {
                alignment: { status: 'ok' },
                boltSpecs: { tension: 120 },
                vibration: { iso: 1.2 }
            },
            diagnosis: { summary: 'All good' }
        });

        (LocalLedger.createEntry as any).mockReturnValue({ uuid: 'ledger-uuid-123' });
    });

    it('renders nothing if no asset selected', () => {
        (useAssetContext as any).mockReturnValue({ selectedAsset: null });
        const { container } = render(<ProtocolLaunchpad />);
        expect(container).toBeEmptyDOMElement();
    });

    it('renders all protocols when data is available', () => {
        render(<ProtocolLaunchpad />);
        expect(screen.getByText('Shaft Alignment')).toBeInTheDocument();
        expect(screen.getByText('Bolt Torque')).toBeInTheDocument();
        expect(screen.getByText('Vibration Check')).toBeInTheDocument();
    });

    it('disables "Generate" button if sync is pending (Offline Integrity Lock)', () => {
        (useSyncWatcher as any).mockReturnValue({
            hasPendingData: true,
            pendingCount: 2,
            syncStatus: 'OFFLINE',
            isOnline: false
        });

        render(<ProtocolLaunchpad />);

        // Should show warning banner
        expect(screen.getByText('Syncing Data...')).toBeInTheDocument();
        expect(screen.getByText(/items pending upload/)).toBeInTheDocument();

        // Buttons should be disabled or showing Lock icon

        const buttons = screen.getAllByRole('button');
        // Filter for the generate buttons AND TYPE THEM
        const generateButtons = buttons.filter((btn: HTMLElement) => btn.textContent?.includes('dashboard.protocolLaunchpad.generatePdf'));

        generateButtons.forEach((btn: HTMLElement) => {
            expect(btn).toBeDisabled();
        });
    });

    it('generates report and creates Ledger entry when clicked', async () => {
        render(<ProtocolLaunchpad />);

        // Use getAllByRole with name matcher to handle text split by icons
        const buttons = screen.getAllByRole('button', { name: /dashboard.protocolLaunchpad.generatePdf/ });
        fireEvent.click(buttons[0]); // Shaft Alignment

        await waitFor(() => {
            expect(LocalLedger.createEntry).toHaveBeenCalledWith(expect.objectContaining({
                type: 'REPORT_GENERATED',
                protocol: 'shaft-alignment',
                assetId: 123
            }), 'PROTOCOL');
        });

        expect(mockViewDocument).toHaveBeenCalled();
        expect(mockPushNotification).toHaveBeenCalledWith('INFO', expect.stringContaining('generated successfully'));
    });

    it('shows "Start Session" status for protocols with missing data', () => {
        (useTelemetryStore as any).mockReturnValue({
            mechanical: {}, // No data
            diagnosis: null
        });

        render(<ProtocolLaunchpad />);
        expect(screen.getAllByText('dashboard.protocolLaunchpad.startSession')).toHaveLength(3); // All 3 protocols
    });
});
