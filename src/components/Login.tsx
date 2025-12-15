import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext.tsx';
import { useToast } from '../contexts/ToastContext.tsx';
import { useTranslation } from 'react-i18next';
import { LanguageSelector } from './LanguageSelector.tsx';
import { GlassCard } from './ui/GlassCard.tsx';
import { ModernInput } from './ui/ModernInput.tsx';
import { ModernButton } from './ui/ModernButton.tsx';

// OVO JE JEDINA DEKLARACIJA I EKSPORT
export const Login: React.FC = () => {
    const { signIn, signInAsGuest } = useAuth(); // <--- Uzimamo i signInAsGuest
    const { showToast } = useToast();
    const { t } = useTranslation();

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

    const handleGuestLogin = () => {
        signInAsGuest();
        showToast("Welcome, Guest Engineer!", "success");
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#020617] p-4 relative overflow-hidden">
            {/* Background Effects */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-cyan-500/10 rounded-full blur-[120px] animate-pulse-glow"></div>
                <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] bg-blue-600/10 rounded-full blur-[120px] animate-pulse-glow" style={{ animationDelay: '2s' }}></div>
            </div>

            <div className="absolute top-6 right-6 z-20">
                <LanguageSelector />
            </div>

            <div className="w-full max-w-md relative z-10 animate-fade-in-up">
                
                <div className="text-center mb-8">
                    <h1 className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500 mb-2 tracking-tighter drop-shadow-sm">
                        AnoHUB
                    </h1>
                    <p className="text-slate-400 text-sm font-medium tracking-wide">
                        {t('login.subtitle', 'Global Operating System for Hydropower Excellence.')}
                    </p>
                </div>

                <GlassCard className="shadow-2xl shadow-cyan-900/20">
                    <div className="mb-6 text-center">
                        <h2 className="text-xl font-bold text-white tracking-tight">{t('login.title', 'Secure Access')}</h2>
                        <p className="text-xs text-slate-500 mt-1">{t('login.instructions', 'Please verify your credentials.')}</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-5">
                        <ModernInput
                            label={t('login.emailLabel', 'Email Address')}
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="engineer@anohub.com"
                            icon={<span className="text-lg">📧</span>}
                            required
                        />
                        
                        <ModernInput
                            label={t('login.passwordLabel', 'Password')}
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="••••••••"
                            icon={<span className="text-lg">🔒</span>}
                            required
                        />

                        <div className="pt-2 space-y-3">
                            <ModernButton 
                                type="submit" 
                                fullWidth 
                                variant="primary" 
                                isLoading={loading}
                                className="shadow-lg shadow-cyan-500/20"
                            >
                                {t('login.signInButton', 'Authenticate')}
                            </ModernButton>

                            {/* GUEST BUTTON */}
                            <div className="relative flex py-2 items-center">
                                <div className="flex-grow border-t border-slate-700"></div>
                                <span className="flex-shrink-0 mx-4 text-slate-500 text-[10px] uppercase">Or</span>
                                <div className="flex-grow border-t border-slate-700"></div>
                            </div>

                            <ModernButton 
                                type="button"
                                onClick={handleGuestLogin}
                                fullWidth 
                                variant="secondary" 
                                icon={<span>👤</span>}
                            >
                                Continue as Guest
                            </ModernButton>
                        </div>
                    </form>

                    <div className="mt-6 pt-6 border-t border-white/5 text-center">
                        <p className="text-[10px] text-slate-500 uppercase tracking-widest font-semibold">
                            {t('login.footer', 'Secured by Blockchain Identity')}
                        </p>
                    </div>
                </GlassCard>
            </div>
        </div>
    );
};
// Uklonjen dupli eksport na dnu fajla.