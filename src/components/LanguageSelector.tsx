import React from 'react';
import { useTranslation } from 'react-i18next';

export const LanguageSelector: React.FC = () => {
    const { i18n } = useTranslation();

    const changeLanguage = (lng: string) => {
        i18n.changeLanguage(lng);
    };

    // Stilovi za aktivni vs neaktivni gumb
    const btnClass = (lng: string) => `
        px-2 py-1 text-xs font-bold rounded transition-colors uppercase cursor-pointer
        ${i18n.language === lng 
            ? 'bg-cyan-600 text-white shadow-[0_0_10px_rgba(8,145,178,0.5)] border border-cyan-400' 
            : 'bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 border border-transparent'}
    `;

    return (
        <div className="flex gap-2 items-center bg-slate-900/50 p-1 rounded-lg border border-slate-700">
            <button onClick={() => changeLanguage('en')} className={btnClass('en')}>EN</button>
            <button onClick={() => changeLanguage('de')} className={btnClass('de')}>DE</button>
            <button onClick={() => changeLanguage('bs')} className={btnClass('bs')}>BS</button>
        </div>
    );
};