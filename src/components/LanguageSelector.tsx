import React from 'react';
import { useTranslation } from 'react-i18next';

export const LanguageSelector: React.FC = () => {
    const { i18n } = useTranslation();

    const changeLanguage = (lng: string) => {
        i18n.changeLanguage(lng);
    };

    const btnClass = (lng: string) => `
        px-3 py-1 text-[10px] font-bold rounded-full transition-all duration-300 uppercase cursor-pointer
        ${i18n.language === lng 
            ? 'bg-cyan-500 text-white shadow-[0_0_10px_rgba(6,182,212,0.5)]' 
            : 'text-slate-500 hover:text-slate-300 hover:bg-white/5'}
    `;

    return (
        <div className="flex gap-1 items-center bg-slate-900/80 backdrop-blur-md p-1 rounded-full border border-slate-700/50">
            <button onClick={() => changeLanguage('en')} className={btnClass('en')}>EN</button>
            <button onClick={() => changeLanguage('de')} className={btnClass('de')}>DE</button>
            <button onClick={() => changeLanguage('bs')} className={btnClass('bs')}>BS</button>
        </div>
    );
};