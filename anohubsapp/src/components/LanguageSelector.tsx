import React, { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { ChevronDown } from 'lucide-react';

export const LanguageSelector: React.FC = () => {
    const { i18n } = useTranslation();
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const languages = [
        { code: 'en', flag: '🇬🇧', label: 'English' },
        { code: 'bs', flag: '🇧🇦', label: 'Bosanski' },
        { code: 'de', flag: '🇩🇪', label: 'Deutsch' },
        { code: 'tr', flag: '🇹🇷', label: 'Türkçe' },
        { code: 'ms', flag: '🇲🇾', label: 'Melayu' },
        { code: 'si', flag: '🇱🇰', label: 'Sinhala' }
    ];

    const currentLang = languages.find(l => l.code === i18n.language) || languages[0];

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-800/50 hover:bg-slate-700/50 border border-slate-700 hover:border-slate-600 transition-all text-slate-200"
            >
                <span className="text-lg leading-none">{currentLang.flag}</span>
                <span className="text-xs font-bold uppercase tracking-wider hidden sm:inline-block">{currentLang.code}</span>
                <ChevronDown className={`w-3 h-3 text-slate-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
            </button>

            {isOpen && (
                <div className="absolute top-full right-0 mt-2 w-48 bg-[#0f172a] border border-slate-700 rounded-xl shadow-2xl overflow-hidden z-[100] animate-fade-in-up origin-top-right">
                    <div className="py-1">
                        {languages.map((lang) => (
                            <button
                                key={lang.code}
                                onClick={() => {
                                    i18n.changeLanguage(lang.code);
                                    localStorage.setItem('appLanguage', lang.code);
                                    setIsOpen(false);
                                }}
                                className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-slate-800/80 transition-colors text-left group ${i18n.language === lang.code ? 'bg-slate-800/40 border-l-2 border-cyan-500' : 'border-l-2 border-transparent'}`}
                            >
                                <span className="text-xl">{lang.flag}</span>
                                <span className={`text-sm font-medium ${i18n.language === lang.code ? 'text-cyan-400' : 'text-slate-400 group-hover:text-slate-200'}`}>
                                    {lang.label}
                                </span>
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};