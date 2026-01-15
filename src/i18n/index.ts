import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

// Importuj JSON fajlove
import en from './en.json';
import bs from './bs.json';
import de from './de.json';
import tr from './tr.json';
import ms from './ms.json';
import si from './si.json';
import docs from './locales/docs.json'; // New Engineering Docs

// Provjeri da li postoji sačuvani jezik u memoriji preglednika
const savedLanguage = localStorage.getItem('appLanguage') || 'en';

i18n.use(initReactI18next).init({
  resources: {
    en: {
      common: en, // Temporary: keep as en if not restructured yet, or move to nested
      francis: (en as any).francis || {},
      system: (en as any).system || {},
      docs: docs // NEW
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
  interpolation: { escapeValue: false }
});

export default i18n;