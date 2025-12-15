import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext.tsx';
import { useToast } from '../contexts/ToastContext.tsx';
import { useTranslation } from 'react-i18next'; // <--- IMPORT
import { LanguageSelector } from './LanguageSelector.tsx'; // <--- SELEKTOR JEZIKA

export const Login: React.FC = () => {
    const { signIn } = useAuth();
    const { showToast } = useToast();
    const { t } = useTranslation(); // <--- HOOK

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const { error } = await signIn(email, password);
            if (error) throw error;
        } catch (error: any) {
            showToast(error.message || t('login.error'), 'error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-900 p-4 relative overflow-hidden">
            {/* Background Effects */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-cyan-500/10 rounded-full blur-[100px] animate-pulse"></div>
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-600/10 rounded-full blur-[100px] animate-pulse" style={{ animationDelay: '2s' }}></div>
            </div>

            {/* Language Selector (Top Right) */}
            <div className="absolute top-6 right-6 z-20">
                <LanguageSelector />
            </div>

            <div className="max-w-md w-full bg-slate-800/80 backdrop-blur-xl rounded-2xl p-8 border border-slate-700 shadow-2xl relative z-10 animate-fade-in-up">
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500 mb-2">
                        AnoHUB
                    </h1>
                    <h2 className="text-xl font-bold text-white">{t('login.title')}</h2>
                    <p className="text-slate-400 text-sm">{t('login.subtitle')}</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-sm font-bold text-slate-300 mb-2 uppercase tracking-wider">{t('login.emailLabel')}</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full bg-slate-900/50 border border-slate-600 rounded-lg p-3 text-white focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 outline-none transition-all"
                            placeholder="engineer@anohubs.com"
                            required
                        />
                    </div>
                    
                    <div>
                        <label className="block text-sm font-bold text-slate-300 mb-2 uppercase tracking-wider">{t('login.passwordLabel')}</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full bg-slate-900/50 border border-slate-600 rounded-lg p-3 text-white focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 outline-none transition-all"
                            placeholder="••••••••"
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className={`
                            w-full bg-gradient-to-r from-cyan-600 to-blue-600 text-white font-bold py-3 rounded-lg shadow-lg 
                            hover:shadow-cyan-500/25 transform hover:-translate-y-0.5 transition-all
                            ${loading ? 'opacity-70 cursor-not-allowed' : ''}
                        `}
                    >
                        {loading ? (
                            <span className="flex items-center justify-center gap-2">
                                <span className="animate-spin">⚙️</span> {t('login.loading')}
                            </span>
                        ) : (
                            t('login.signInButton')
                        )}
                    </button>
                </form>

                <div className="mt-6 text-center">
                     <p className="text-xs text-slate-500 mt-4 border-t border-slate-700 pt-4">
                        {t('login.footer')}
                    </p>
                </div>
            </div>
        </div>
    );
};