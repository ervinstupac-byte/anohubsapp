import { webcrypto } from 'node:crypto';
import { vi } from 'vitest';
import '@testing-library/jest-dom';

if (!globalThis.crypto) {
    // @ts-ignore
    globalThis.crypto = webcrypto;
}

// 0. Standard Browser Mocks
if (typeof window !== 'undefined') {
    Object.defineProperty(window, 'matchMedia', {
        writable: true,
        value: vi.fn().mockImplementation(query => ({
            matches: false,
            media: query,
            onchange: null,
            addListener: vi.fn(), // deprecated
            removeListener: vi.fn(), // deprecated
            addEventListener: vi.fn(),
            removeEventListener: vi.fn(),
            dispatchEvent: vi.fn(),
        })),
    });
}

global.ResizeObserver = vi.fn().mockImplementation(() => ({
    observe: vi.fn(),
    unobserve: vi.fn(),
    disconnect: vi.fn(),
}));

global.URL.createObjectURL = vi.fn(() => 'mock-url');
global.URL.revokeObjectURL = vi.fn();

// 1. Popravka za IntersectionObserver (za framer-motion)
const intersectionObserverMock = () => ({
    observe: vi.fn(),
    unobserve: vi.fn(),
    disconnect: vi.fn(),
});

if (typeof window !== 'undefined') {
    window.IntersectionObserver = vi.fn().mockImplementation(intersectionObserverMock);
}
if (typeof global !== 'undefined') {
    global.IntersectionObserver = vi.fn().mockImplementation(intersectionObserverMock);
}

// 2. Robustan mock za react-i18next
vi.mock('react-i18next', () => {
    const useTranslation = () => ({
        t: (key: string) => key,
        i18n: {
            changeLanguage: () => Promise.resolve(),
            language: 'en',
            on: vi.fn(),
            off: vi.fn(),
        },
    });

    const initReactI18next = {
        type: '3rdParty',
        init: vi.fn(),
    };

    return {
        __esModule: true,
        useTranslation,
        initReactI18next,
        default: {
            useTranslation,
            initReactI18next
        },
        Trans: ({ children }: any) => children,
        Translation: ({ children }: any) => children((k: any) => k, { i18n: {} }),
    };
});

// 3. Global Service Mocks (NC-17 Stabilization)
vi.mock('./services/SimulationEngine', () => ({
    SimulationEngine: {
        startNC13StressTest: vi.fn(),
        runGrandTour: vi.fn(),
        stop: vi.fn(),
        // Mock SIMULATION_EVENTS if they are exported as values from the class/file
        SIMULATION_EVENTS: {
            TICK: 'SIMULATION_TICK',
            CRITICAL: 'SIMULATION_CRITICAL',
            ENDED: 'SIMULATION_ENDED',
            GRAND_TOUR_TICK: 'SIMULATION_GRAND_TOUR_TICK',
            NC16_INTERVENTION: 'NC16_INTERVENTION_REQUIRED'
        }
    },
    SIMULATION_EVENTS: {
        TICK: 'SIMULATION_TICK',
        CRITICAL: 'SIMULATION_CRITICAL',
        ENDED: 'SIMULATION_ENDED',
        GRAND_TOUR_TICK: 'SIMULATION_GRAND_TOUR_TICK',
        NC16_INTERVENTION: 'NC16_INTERVENTION_REQUIRED'
    }
}));

vi.mock('./services/PrognosticsEngine', () => ({
    PrognosticsEngine: {
        estimateRUL: vi.fn(() => ({
            daysRemaining: 30,
            confidence: 100,
            status: 'STABLE',
            failureDate: new Date()
        }))
    }
}));
// 4. Session Storage Mock (Robust)
const sessionStorageMock = (() => {
    let store: Record<string, string> = {};
    return {
        getItem: vi.fn((key: string) => store[key] || null),
        setItem: vi.fn((key: string, value: string) => { store[key] = value.toString(); }),
        removeItem: vi.fn((key: string) => { delete store[key]; }),
        clear: vi.fn(() => { store = {}; }),
    };
})();
if (typeof window !== 'undefined') {
    Object.defineProperty(window, 'sessionStorage', { value: sessionStorageMock });
}


// 6. NC-19 & NC-20 Service Mocks
vi.mock('./services/AlertJournal', () => ({
    AlertJournal: {
        logEvent: vi.fn(),
        getHistory: vi.fn(() => []),
        clear: vi.fn(),
    }
}));

vi.mock('./services/ForensicReportService', () => ({
    ForensicReportService: {
        generateDossier: vi.fn(),
        generateSovereignLongevityAudit: vi.fn(() => new Blob([''], { type: 'text/html' })),
        generateServiceAuditReport: vi.fn(() => new Blob([''], { type: 'text/html' })),
        openAndDownloadBlob: vi.fn(),
    }
}));

vi.mock('./services/MqttBridge', () => ({
    MqttBridge: {
        status: 'IDLE',
        subscribeStatus: vi.fn(() => vi.fn()), // Return unsubscribe fn
        connect: vi.fn(),
        disconnect: vi.fn(),
    },
    MqttStatus: {} // Type mock if needed as value, but usually types are erased
}));

// NC-26: Sovereign Ledger Mock (IndexedDB fallback for test environment)
vi.mock('./services/SovereignLedger', () => ({
    SovereignLedger: {
        initialize: vi.fn(() => Promise.resolve()),
        append: vi.fn(() => Promise.resolve({ id: 1, hash: 'mock-hash', timestamp: Date.now() })),
        getAllEntries: vi.fn(() => Promise.resolve([])),
        verifyIntegrity: vi.fn(() => Promise.resolve({
            valid: true,
            totalEntries: 0,
            verifiedEntries: 0,
            rootHash: '0000000000000000000000000000000000000000000000000000000000000000'
        })),
        getRootHash: vi.fn(() => '0000000000000000000000000000000000000000000000000000000000000000'),
        getEntryCount: vi.fn(() => 0),
        clearLedger: vi.fn(() => Promise.resolve()),
        exportForForensics: vi.fn(() => Promise.resolve({
            entries: [],
            rootHash: '0000000000000000000000000000000000000000000000000000000000000000',
            exportTimestamp: Date.now(),
            integrityStatus: { valid: true, totalEntries: 0, verifiedEntries: 0, rootHash: '0' }
        }))
    },
    // Export types as empty objects (erased at runtime but needed for mock shape)
    LedgerEntry: {},
    VerificationResult: {}
}));

// NC-27: Grid Negotiator Mock (for test environment)
vi.mock('./services/GridNegotiator', () => ({
    GridNegotiator: {
        connect: vi.fn(() => Promise.resolve(true)),
        disconnect: vi.fn(() => Promise.resolve()),
        getAvailableOperatingRange: vi.fn(() => ({
            minMW: 6,
            maxMW: 37,
            sweetSpotMW: 31.45,
            sustainabilityScore: 92
        })),
        negotiate: vi.fn(() => Promise.resolve({
            status: 'ACCEPTED',
            approvedMW: 25,
            sustainabilityScore: 88,
            protocolVersion: 'IEC61850-NC27-v1.0',
            signature: '0'.repeat(64)
        })),
        calculateSustainabilityScore: vi.fn((ratio: number) => Math.round(ratio * 100)),
        getHistory: vi.fn(() => [])
    }
}));

// 7. Global Decimal.js Mock
vi.mock('decimal.js', () => {
    class MockDecimal {
        val: number;
        constructor(val: any) { this.val = Number(val); }
        // Instance methods
        gt(other: any) { return this.val > (other.val ?? other); }
        lt(other: any) { return this.val < (other.val ?? other); }
        lte(other: any) { return this.val <= (other.val ?? other); }
        gte(other: any) { return this.val >= (other.val ?? other); }
        mul(f: any) { return new (this.constructor as any)(this.val * (f.val ?? f)); }
        div(f: any) { return new (this.constructor as any)(this.val / (f.val ?? f)); }
        add(f: any) { return new (this.constructor as any)(this.val + (f.val ?? f)); }
        sub(f: any) { return new (this.constructor as any)(this.val - (f.val ?? f)); }
        minus(f: any) { return this.sub(f); } // Alias
        plus(f: any) { return this.add(f); } // Alias
        pow(n: number) { return new (this.constructor as any)(Math.pow(this.val, n)); }
        abs() { return new (this.constructor as any)(Math.abs(this.val)); }
        sqrt() { return new (this.constructor as any)(Math.sqrt(this.val)); }
        squareRoot() { return this.sqrt(); }
        equals(other: any) { return this.val === (other.val ?? other); }
        isZero() { return this.val === 0; }
        toFixed(n: number) { return this.val.toFixed(n); }
        toDecimalPlaces(_n: number) { return this; } // Mock implementation
        round() { return new (this.constructor as any)(Math.round(this.val)); }
        toNumber() { return this.val; }

        // Static methods attached to the class in the return object below? 
        // No, simplest way for default export mock is to attach them to the class here if possible, 
        // or ensure the returned object has them.
        static set(_config: any) { /* no-op */ }
        static max(...args: any[]) {
            return new MockDecimal(Math.max(...args.map(a => a.val ?? a)));
        }
        static min(...args: any[]) {
            return new MockDecimal(Math.min(...args.map(a => a.val ?? a)));
        }
        static log10(x: any) {
            return new MockDecimal(Math.log10(x.val ?? x));
        }
        static acos(x: any) {
            return new MockDecimal(Math.acos(x.val ?? x));
        }
        static sqrt(x: any) {
            return new MockDecimal(Math.sqrt(x.val ?? x));
        }
    }

    return {
        Decimal: MockDecimal,
        default: MockDecimal,
        __esModule: true,
    };
});

// 8. Global Lucide-React Mock
vi.mock('lucide-react', () => ({
    FileText: () => 'icon-file-text',
    Calendar: () => 'icon-calendar',
    Settings: () => 'icon-settings',
    AlertTriangle: () => 'icon-alert',
    Download: () => 'icon-download',
    Droplets: () => 'icon-droplets',
    ArrowUpFromLine: () => 'icon-arrow-up',
    Thermometer: () => 'icon-thermometer',
    Layers: () => 'icon-layers',
    Clock: () => 'icon-clock',
    Activity: () => 'icon-activity',
    Microscope: () => 'icon-microscope',
    ShieldAlert: () => 'icon-shield-alert',
    Check: () => 'icon-check',
    Wifi: () => 'icon-wifi',
    RefreshCw: () => 'icon-refresh-cw',
    CloudOff: () => 'icon-cloud-off',
    Globe: () => 'icon-globe',
    ClipboardCheck: () => 'icon-clipboard-check',
    CheckCircle: () => 'icon-check-circle',
    Lock: () => 'icon-lock',
    // NC-26: ForensicDashboard icons
    Hash: () => 'icon-hash',
    Database: () => 'icon-database',
    ShieldCheck: () => 'icon-shield-check'
}));
