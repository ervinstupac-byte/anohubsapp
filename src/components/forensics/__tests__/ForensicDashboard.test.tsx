import { vi } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import { ForensicDashboard } from '../ForensicDashboard';
import { useForensics } from '../../../hooks/useForensics';

// Simulated dependencies
vi.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: (key: string) => key,
        i18n: { changeLanguage: vi.fn() }
    }),
    initReactI18next: { type: '3rdParty', init: vi.fn() }
}));

vi.mock('../../../hooks/useForensics');

// Test Doubles for components that we don't need to test deeply here
vi.mock('../VisionAnalyzer', () => ({ VisionAnalyzer: () => <div data-testid="vision-analyzer" /> }));
vi.mock('../AudioSpectrogram', () => ({ AudioSpectrogram: () => <div data-testid="audio-spectrogram" /> }));
vi.mock('../PostMortemMonitor', () => ({ PostMortemMonitor: () => <div data-testid="post-mortem" /> }));
vi.mock('../KillSwitch', () => ({ KillSwitch: () => <div data-testid="kill-switch" /> }));

describe('ForensicDashboard (War Game)', () => {

    it('renders in IDLE state', () => {
        (useForensics as any).mockReturnValue({
            status: 'IDLE',
            trafficHistory: [],
            securityEvents: [],
            triggerSimulatedAttack: vi.fn(),
            executeKillSwitch: vi.fn(),
            currentLatency: 45
        });

        render(<ForensicDashboard />);

        // The simulated returns the key.
        expect(screen.getByText('forensics.title')).toBeInTheDocument();
        expect(screen.queryByText(/forensics.critical_alert/)).not.toBeInTheDocument();
    });

    it('shows CRITICAL ALERT during ATTACK_IN_PROGRESS', () => {
        (useForensics as any).mockReturnValue({
            status: 'ATTACK_IN_PROGRESS', // Force attack status
            trafficHistory: [{ inbound: 50, outbound: 900 }], // Simulated spike
            securityEvents: ['Alert detected'],
            triggerSimulatedAttack: vi.fn(),
            executeKillSwitch: vi.fn(),
            currentLatency: 2000
        });

        render(<ForensicDashboard />);

        // The simulated returns the key.
        // Also note that the component might render children or other structure, but getByText should find the text node.
        expect(screen.getByText(/forensics.critical_alert/)).toBeInTheDocument();
        expect(screen.getByText(/2000/)).toBeInTheDocument(); // Latency check - "2000 ms" might be split
    });

});
