import React from 'react';
import '@testing-library/jest-dom';
import { render, fireEvent } from '@testing-library/react';
import { SyncBadge } from '../SyncBadge';
import { useSyncWatcher } from '../../../hooks/useSyncWatcher';
import { vi, describe, it, expect, beforeEach } from 'vitest';

// --- MOCKS ---
vi.mock('react-i18next', () => ({
    useTranslation: () => ({ t: (key: string, opts?: any) => opts?.count ? `${key} count:${opts.count}` : key }),
}));

vi.mock('lucide-react', () => ({
    Cloud: () => <div data-testid="icon-cloud" />,
    CloudOff: () => <div data-testid="icon-cloud-off" />,
    RefreshCw: () => <div data-testid="icon-refresh" />,
    Check: () => <div data-testid="icon-check" />,
    AlertTriangle: () => <div data-testid="icon-alert" />
}));

vi.mock('../../../hooks/useSyncWatcher', () => ({
    useSyncWatcher: vi.fn()
}));

describe('SyncBadge Component', () => {
    const mockTriggerSync = vi.fn();

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('renders OFFLINE state correctly', () => {
        (useSyncWatcher as any).mockReturnValue({
            syncStatus: 'OFFLINE',
            pendingCount: 0,
            isOnline: false,
            triggerSync: mockTriggerSync
        });

        const { getByText, getByTestId } = render(<SyncBadge />);

        expect(getByText('sidebar.offline')).toBeInTheDocument();
        expect(getByTestId('icon-cloud-off')).toBeInTheDocument();

        // Should be disabled
        const button = getByText('sidebar.offline').closest('button');
        expect(button).toBeDisabled();
    });

    it('renders SYNCING state correctly', () => {
        (useSyncWatcher as any).mockReturnValue({
            syncStatus: 'SYNCING',
            pendingCount: 5,
            isOnline: true,
            triggerSync: mockTriggerSync
        });

        const { getByText, getByTestId } = render(<SyncBadge />);

        expect(getByText('dashboard.syncStatus.syncing')).toBeInTheDocument();
        expect(getByTestId('icon-refresh')).toBeInTheDocument();

        // Should be disabled while syncing
        const button = getByText('dashboard.syncStatus.syncing').closest('button');
        expect(button).toBeDisabled();
    });

    it('renders IDLE state (Synced) correctly', () => {
        (useSyncWatcher as any).mockReturnValue({
            syncStatus: 'IDLE',
            pendingCount: 0,
            isOnline: true,
            triggerSync: mockTriggerSync
        });

        const { getByText, getByTestId } = render(<SyncBadge />);

        expect(getByText('dashboard.syncStatus.synced')).toBeInTheDocument();
        expect(getByTestId('icon-check')).toBeInTheDocument();

        // Should be enabled
        const button = getByText('dashboard.syncStatus.synced').closest('button');
        expect(button).toBeEnabled();
    });

    it('renders ERROR state correctly', () => {
        (useSyncWatcher as any).mockReturnValue({
            syncStatus: 'ERROR',
            pendingCount: 3,
            isOnline: true,
            triggerSync: mockTriggerSync
        });

        const { getByTestId } = render(<SyncBadge />);

        expect(getByTestId('icon-alert')).toBeInTheDocument();
    });

    it('renders pending count badge when IDLE but has data', () => {
        (useSyncWatcher as any).mockReturnValue({
            syncStatus: 'IDLE',
            pendingCount: 12,
            isOnline: true,
            triggerSync: mockTriggerSync
        });

        const { getByText } = render(<SyncBadge />);

        // Label check
        expect(getByText('dashboard.syncStatus.syncing')).toBeInTheDocument();

        // Number badge check
        expect(getByText('12')).toBeInTheDocument();
    });

    it('triggers sync on click when enabled', () => {
        (useSyncWatcher as any).mockReturnValue({
            syncStatus: 'IDLE',
            pendingCount: 2,
            isOnline: true,
            triggerSync: mockTriggerSync
        });

        const { getByText } = render(<SyncBadge />);

        const button = getByText('2').closest('button'); // Click the numbered button
        fireEvent.click(button!);

        expect(mockTriggerSync).toHaveBeenCalled();
    });
});
