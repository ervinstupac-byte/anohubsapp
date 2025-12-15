import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

// Importuj JSON fajlove
import en from './en.json';
import bs from './bs.json'; // <--- NOVO
import de from './de.json'; // <--- NOVO

i18n.use(initReactI18next).init({
  resources: {
    en: {
      translation: en
    },
    bs: { // <--- NOVO
      translation: bs
    },
    de: { // <--- NOVO
      translation: de
    }
  },
  lng: 'en', // Defaultni jezik
  fallbackLng: 'en', // Ako prevod fali, koristi engleski
  interpolation: { escapeValue: false }
});

export default i18n;