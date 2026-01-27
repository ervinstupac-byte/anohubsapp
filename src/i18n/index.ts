import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

// ============================================================================
// BULLETPROOF i18n INITIALIZATION (NC-76.3)
// ============================================================================
console.log('[i18n] 🔧 Starting bulletproof initialization...');

// Importuj JSON fajlove
import en from './en.json';
import bs from './bs.json';
import de from './de.json';
import tr from './tr.json';
import ms from './ms.json';
import si from './si.json';
import docs from './locales/docs.json';

// ============================================================================
// SAFE LOCALSTORAGE ACCESS
// ============================================================================
// localStorage can throw in:
// - Incognito/Private mode with strict settings
// - Disabled cookies
// - SSR environments
// - Some mobile browsers
let savedLanguage = 'en'; // Safe default

try {
  if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
    const stored = localStorage.getItem('appLanguage');
    if (stored) {
      savedLanguage = stored;
      console.log('[i18n] ✅ Retrieved saved language:', savedLanguage);
    } else {
      console.log('[i18n] ℹ️  No saved language, using default: en');
    }
  } else {
    console.warn('[i18n] ⚠️  localStorage not available (SSR or disabled), defaulting to: en');
  }
} catch (err) {
  console.error('[i18n] ❌ localStorage access failed, using fallback:', err);
  savedLanguage = 'en';
}

// ============================================================================
// i18next INITIALIZATION
// ============================================================================
console.log('[i18n] 🚀 Initializing i18next with language:', savedLanguage);

try {
  i18n.use(initReactI18next).init({
    resources: {
      en: {
        common: en,
        francis: (en as any).francis || {},
        system: (en as any).system || {},
        docs: docs
      },
      bs: {
        common: bs,
        francis: (bs as any).francis || {},
        system: (bs as any).system || {}
      },
      de: { translation: de },
      tr: { translation: tr },
      ms: { translation: ms },
      si: { translation: si }
    },
    lng: savedLanguage,
    fallbackLng: 'en',
    ns: ['common', 'francis', 'system', 'docs'],
    defaultNS: 'common',
    interpolation: { escapeValue: false },
    // Provide friendly fallback when key is missing
    parseMissingKeyHandler: (key: string) => {
      const last = key.split('.').pop() || key;
      return last.replace(/[-_]/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
    }
  });
  console.log('[i18n] ✅✅✅ i18next initialized successfully');
} catch (err) {
  console.error('[i18n] 🚨 CRITICAL: i18next init failed:', err);
  console.error('[i18n] 🔧 Attempting emergency fallback initialization...');

  // Emergency fallback - minimal working i18n
  try {
    i18n.use(initReactI18next).init({
      resources: {
        en: {
          common: {},
          francis: {},
          system: {},
          docs: {}
        }
      },
      lng: 'en',
      fallbackLng: 'en',
      ns: ['common', 'francis', 'system', 'docs'],
      defaultNS: 'common',
      interpolation: { escapeValue: false }
    });
    console.log('[i18n] ⚠️  Emergency fallback i18n active (UI will show keys)');
  } catch (fallbackErr) {
    console.error('[i18n] 💀 CATASTROPHIC: Even emergency fallback failed:', fallbackErr);
    // At this point, i18n is broken but app should still try to mount
  }
}

console.log('[i18n] ✅ Module export ready');
export default i18n;