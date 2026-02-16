import React from 'react';
import '@testing-library/jest-dom';
import { render, fireEvent, waitFor, act } from '@testing-library/react';
import { HeritageSearchWidget } from '../HeritageSearchWidget';
import { useAssetContext } from '../../../contexts/AssetContext';
import { LegacyKnowledgeService } from '../../../services/LegacyKnowledgeService';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';

// --- Simulated ---
const { simulatedNavigate } = vi.hoisted(() => ({ simulatedNavigate: vi.fn() }));

vi.mock('react-router-dom', () => ({
    useNavigate: () => simulatedNavigate,
}));

vi.mock('react-i18next', () => ({
    useTranslation: () => ({ t: (key: string, opts?: any) => key }),
}));

vi.mock('lucide-react', () => ({
    Search: () => <div data-testid="icon-search" />,
    AlertCircle: () => <div data-testid="icon-alert-circle" />,
    BookOpen: () => <div data-testid="icon-book-open" />,
    ChevronRight: () => <div data-testid="icon-chevron-right" />,
    X: () => <div data-testid="icon-close" />,
    AlertTriangle: () => <div data-testid="icon-alert-triangle" />
}));

vi.mock('date-fns', () => ({
    formatDistanceToNow: () => '5 years ago'
}));

vi.mock('../../../contexts/AssetContext', () => ({
    useAssetContext: vi.fn()
}));

vi.mock('../../../services/LegacyKnowledgeService', () => ({
    LegacyKnowledgeService: {
        semanticSearch: vi.fn(),
        getCasesBySeverity: vi.fn()
    }
}));

vi.mock('../../../shared/components/ui/GlassCard', () => ({
    GlassCard: ({ children, className }: any) => <div className={className}>{children}</div>
}));

describe('HeritageSearchWidget Component', () => {
    beforeEach(() => {
        vi.useFakeTimers();
    });

    afterEach(() => {
        vi.clearAllTimers();
        vi.useRealTimers();
    });
    beforeEach(() => {
        vi.clearAllMocks();
        vi.useFakeTimers();

        // Default Asset Context
        (useAssetContext as any).mockReturnValue({
            selectedAsset: {
                id: 'francis-1',
                turbine_type: 'FRANCIS'
            }
        });

        // Default Legacy Service Test Doubles
        (LegacyKnowledgeService.semanticSearch as any).mockReturnValue([]);
        (LegacyKnowledgeService.getCasesBySeverity as any).mockReturnValue([]);
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    it('renders closed state initially', () => {
        const { getByText, queryByPlaceholderText } = render(<HeritageSearchWidget />);

        expect(getByText('dashboard.heritageSearch.title')).toBeInTheDocument();
        expect(queryByPlaceholderText('dashboard.heritageSearch.placeholder')).not.toBeInTheDocument();
    });

    it('expands and shows search input on click', () => {
        const { getByText, getByPlaceholderText } = render(<HeritageSearchWidget />);

        // Click header to expand
        fireEvent.click(getByText('dashboard.heritageSearch.title'));

        expect(getByPlaceholderText('dashboard.heritageSearch.placeholder')).toBeInTheDocument();
    });

    it('shows recommended critical cases when query is empty', () => {
        const simulatedCases = [
            { id: 'c1', symptom: 'Vibration Low Load', severity: 'CRITICAL', turbineFamily: 'FRANCIS', dateOccurred: Date.now() },
            { id: 'c2', symptom: 'Blade Crack', severity: 'CRITICAL', turbineFamily: 'FRANCIS', dateOccurred: Date.now() }
        ];
        (LegacyKnowledgeService.getCasesBySeverity as any).mockReturnValue(simulatedCases);

        const { getByText } = render(<HeritageSearchWidget />);
        fireEvent.click(getByText('dashboard.heritageSearch.title'));

        expect(getByText('Vibration Low Load')).toBeInTheDocument();
        expect(getByText('Blade Crack')).toBeInTheDocument();
    });

    it('debounces search and filters results', async () => {
        const mockResults = [
            { id: 'r1', symptom: 'Found Match', severity: 'HIGH', turbineFamily: 'FRANCIS', realCause: 'Loose Bolt', dateOccurred: Date.now() }
        ];
        (LegacyKnowledgeService.semanticSearch as any).mockReturnValue(mockResults);

        const { getByPlaceholderText, getByText, queryByText } = render(<HeritageSearchWidget />);
        fireEvent.click(getByText('dashboard.heritageSearch.title'));

        const input = getByPlaceholderText('dashboard.heritageSearch.placeholder');

        // Type query
        fireEvent.change(input, { target: { value: 'vib' } });

        // Should not search yet (debounce)
        expect(queryByText('Found Match')).not.toBeInTheDocument();

        // Fast forward timer
        act(() => {
            vi.advanceTimersByTime(500);
        });

        // Search called?
        expect(LegacyKnowledgeService.semanticSearch).toHaveBeenCalledWith('vib', 'FRANCIS');

        // Results rendered
        expect(getByText('Found Match')).toBeInTheDocument();
    });

    it('shows no results state when search yields nothing', async () => {
        (LegacyKnowledgeService.semanticSearch as any).mockReturnValue([]);

        const { getByPlaceholderText, getByText } = render(<HeritageSearchWidget />);
        fireEvent.click(getByText('dashboard.heritageSearch.title'));

        const input = getByPlaceholderText('dashboard.heritageSearch.placeholder');
        fireEvent.change(input, { target: { value: 'alien invasion' } });

        await act(async () => {
            vi.advanceTimersByTime(500);
        });

        expect(getByText('dashboard.heritageSearch.noResults')).toBeInTheDocument();
    });

    it('navigates to legacy hub on result click', async () => {
        const mockResults = [
            { id: 'r1', symptom: 'Click Me', severity: 'low', turbineFamily: 'FRANCIS', realCause: 'None', dateOccurred: Date.now() }
        ];
        (LegacyKnowledgeService.semanticSearch as any).mockReturnValue(mockResults);

        const { getByPlaceholderText, getByText } = render(<HeritageSearchWidget />);
        fireEvent.click(getByText('dashboard.heritageSearch.title'));

        const input = getByPlaceholderText('dashboard.heritageSearch.placeholder');
        fireEvent.change(input, { target: { value: 'click' } });

        act(() => {
            vi.advanceTimersByTime(500);
        });

        expect(getByText('Click Me')).toBeInTheDocument();

        fireEvent.click(getByText('Click Me').closest('button')!);
        expect(simulatedNavigate).toHaveBeenCalledWith('/legacy-hub?case=r1');
    });
});
