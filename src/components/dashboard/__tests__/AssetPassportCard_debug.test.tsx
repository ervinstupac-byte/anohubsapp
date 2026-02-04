
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

vi.mock('../../../contexts/AssetContext');
vi.mock('../../../features/telemetry/store/useTelemetryStore');
vi.mock('../../../contexts/DocumentContext');
vi.mock('../../../contexts/NotificationContext');

vi.mock('../../../shared/components/ui/GlassCard', () => ({
    GlassCard: ({ children, className }: any) => <div className={className}>{children}</div>
}));
vi.mock('../../../shared/components/ui/ModernButton', () => ({
    ModernButton: ({ children, onClick, className }: any) => <button onClick={onClick} className={className}>{children}</button>
}));
vi.mock('../TelemetryDrilldownModal', () => ({
    TelemetryDrilldownModal: () => <div data-testid="drilldown-modal" />
}));

vi.mock('../../../services/ForensicReportService', () => ({
    ForensicReportService: {
        generateAssetPassport: vi.fn(),
        openAndDownloadBlob: vi.fn()
    }
}));

vi.mock('../../../services/PrognosticsEngine', () => ({
    PrognosticsEngine: {
        estimateRUL: vi.fn(() => ({ daysRemaining: 120, confidence: 95, status: 'STABLE' }))
    }
}));

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
    Clock: () => <div data-testid="icon-clock" />,
    Activity: () => <div data-testid="icon-activity" />
}));

describe('AssetPassportCard Debug', () => {
    it('should render component without crashing', () => {
        (useAssetContext as any).mockReturnValue({
            selectedAsset: { id: '1', name: 'Test', specs: {} },
            assetLogs: []
        });
        (useNotifications as any).mockReturnValue({ pushNotification: vi.fn() });
        (useDocumentViewer as any).mockReturnValue({ viewDocument: vi.fn() });
        (useTelemetryStore as any).mockReturnValue({
            mechanical: {}, identity: {}
        });

        render(
            <MemoryRouter>
                <AssetPassportCard />
            </MemoryRouter>
        );
        expect(screen.getByText('dashboard.assetPassport.title')).toBeInTheDocument();
    });
});
