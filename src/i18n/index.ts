import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

// Importuj JSON fajlove
import en from './en.json';
import bs from './bs.json';
import de from './de.json';

// Provjeri da li postoji sačuvani jezik u memoriji preglednika
const savedLanguage = localStorage.getItem('appLanguage') || 'en';

i18n.use(initReactI18next).init({
  resources: {
    en: { translation: en },
    bs: { translation: bs },
    de: { translation: de }
  },
  lng: savedLanguage, // Koristi sačuvani jezik ili default (en)
  fallbackLng: 'en',
  interpolation: { escapeValue: false }
});

export default i18n;