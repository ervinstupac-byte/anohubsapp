import { vi } from 'vitest';
import '@testing-library/jest-dom';

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
