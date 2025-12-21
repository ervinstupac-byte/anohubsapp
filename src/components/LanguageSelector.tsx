import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Globe } from 'lucide-react';

export const LanguageSelector: React.FC = () => {
    const { i18n } = useTranslation();
    const [isOpen, setIsOpen] = useState(false);

    const toggleLanguage = () => {
        const nextLang = i18n.language === 'en' ? 'de' : i18n.language === 'de' ? 'bs' : 'en';
        i18n.changeLanguage(nextLang);
        localStorage.setItem('appLanguage', nextLang);
        setIsOpen(false);
    };

    const currentLang = i18n.language || 'en';
    const getFlag = (lang: string) => {
        switch (lang) {
            case 'en': return '🇬🇧';
            case 'de': return '🇩🇪';
            case 'bs': return '🇧🇦';
            default: return '🇬🇧';
        }
    };

    return (
        <div className="relative">
            <button
                onClick={toggleLanguage}
                className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-800 hover:bg-slate-700 transition-colors border border-slate-700"
            >
                <span className="text-sm">{getFlag(currentLang)}</span>
                <span className="text-xs font-bold text-slate-300 uppercase">{currentLang}</span>
            </button>
        </div>
    );
};