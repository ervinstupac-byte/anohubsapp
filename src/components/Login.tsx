import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext'; // Pazi da putanja odgovara tvojoj strukturi
import { useToast } from '../stores/useAppStore';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { LanguageSelector } from './LanguageSelector';
import { GlassCard } from '../shared/components/ui/GlassCard';
import { TYPOGRAPHY } from '../shared/design-tokens';
import { ModernInput } from '../shared/components/ui/ModernInput';
import { ModernButton } from '../shared/components/ui/ModernButton';

type AuthMode = 'login' | 'signup' | 'reset';

export const Login: React.FC = () => {
    const { signIn, signUp, resetPassword, signInAsGuest } = useAuth();
    const { showToast } = useToast();
    const { t } = useTranslation();
    const navigate = useNavigate();

    const [mode, setMode] = useState<AuthMode>('login');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            if (mode === 'login') {
                const { error } = await signIn(email, password);
                if (error) throw error;
            } else if (mode === 'signup') {
                if (password !== confirmPassword) {
                    throw new Error('Passwords do not match');
                }
                const { error } = await signUp(email, password);
                if (error) throw error;
                showToast(t('login.signupSuccess', 'Check your email for verification!'), 'success');
            } else if (mode === 'reset') {
                const { error } = await resetPassword(email);
                if (error) throw error;
                showToast(t('login.resetSuccess', 'Password reset email sent!'), 'success');
            }
        } catch (error: any) {
            showToast(error.message || t('login.error'), 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleGuestLogin = async () => {
        try {
            await signInAsGuest();
            showToast(t('login.guestWelcome', "Welcome, Guest Engineer!"), "success");
            navigate('/'); // Navigate to dashboard/hub
        } catch (error) {
            console.error("Auth Transition Failure:", error);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#020617] p-4 relative overflow-hidden">
            {/* Background Effects */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-cyan-500/10 rounded-full blur-[120px] animate-pulse-glow"></div>
                <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] bg-blue-600/10 rounded-full blur-[120px] animate-pulse-glow" style={{ animationDelay: '2s' }}></div>
            </div>

            {/* Language Selector - Top Right */}
            <div className="absolute top-6 right-6 z-20">
                <LanguageSelector />
            </div>

            <div className="w-full max-w-md relative z-10 animate-fade-in-up">

                <div className="text-center mb-8">
                    <h1 aria-hidden="true" className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500 mb-2 tracking-tighter drop-shadow-sm">
                        AnoHUB
                    </h1>
                    <span className="sr-only">AnoHUB</span>
                    <p className={`${TYPOGRAPHY.bodySm} font-medium tracking-wide`}>
                        {t('login.subtitle', 'Global Operating System for Hydropower Excellence.')}
                    </p>
                </div>

                <GlassCard className="shadow-2xl shadow-cyan-900/20">
                    <div className="flex gap-1 mb-6 bg-slate-900/50 p-1 rounded-lg">
                        <button
                            onClick={() => setMode('login')}
                            className={`flex-1 py-2 text-xs font-bold tracking-wider rounded-md transition-all ${mode === 'login' ? 'bg-cyan-600 text-white shadow-md shadow-cyan-500/30' : 'text-slate-400 hover:text-slate-200'}`}
                        >
                            Login
                        </button>
                        <button
                            onClick={() => setMode('signup')}
                            className={`flex-1 py-2 text-xs font-bold tracking-wider rounded-md transition-all ${mode === 'signup' ? 'bg-cyan-600 text-white shadow-md shadow-cyan-500/30' : 'text-slate-400 hover:text-s-slate-200'}`}
                        >
                            Sign Up
                        </button>
                        <button
                            onClick={() => setMode('reset')}
                            className={`flex-1 py-2 text-xs font-bold tracking-wider rounded-md transition-all ${mode === 'reset' ? 'bg-cyan-600 text-white shadow-md shadow-cyan-500/30' : 'text-slate-400 hover:text-s-slate-200'}`}
                        >
                            Reset
                        </button>
                    </div>

                    <div className="mb-6 text-center">
                        <h2 className="text-xl font-bold text-white tracking-tight">
                            {mode === 'login' ? t('login.title', 'Secure Access') :
                                mode === 'signup' ? t('login.signupTitle', 'Create Account') :
                                    t('login.resetTitle', 'Reset Password')}
                        </h2>
                        <p className={`${TYPOGRAPHY.bodyXs} mt-1`}>
                            {mode === 'login' ? t('login.instructions', 'Please verify your credentials.') :
                                mode === 'signup' ? t('login.signupInstructions', 'Join the AnoHUB community.') :
                                    t('login.resetInstructions', 'Enter your email to reset your password.')}
                        </p>
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

                        {mode !== 'reset' && (
                            <ModernInput
                                label={t('login.passwordLabel', 'Password')}
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="••••••••"
                                icon={<span className="text-lg">🔒</span>}
                                required
                            />
                        )}

                        {mode === 'signup' && (
                            <ModernInput
                                label={t('login.confirmPasswordLabel', 'Confirm Password')}
                                type="password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                placeholder="••••••••"
                                icon={<span className="text-lg">🔑</span>}
                                required
                            />
                        )}

                        <div className="pt-2 space-y-3">
                            <ModernButton
                                type="submit"
                                fullWidth
                                variant="primary"
                                isLoading={loading}
                                className="shadow-lg shadow-cyan-500/20"
                            >
                                {mode === 'login' ? t('login.signInButton', 'Authenticate') :
                                    mode === 'signup' ? t('login.signUpButton', 'Create Account') :
                                        t('login.resetButton', 'Send Reset Email')}
                            </ModernButton>

                            {/* GUEST BUTTON */}
                            {mode === 'login' && (
                                <>
                                    <div className="relative flex py-2 items-center">
                                        <div className="flex-grow border-t border-slate-700"></div>
                                        <span className={`flex-shrink-0 mx-4 ${TYPOGRAPHY.bodyXs} uppercase`}>
                                            {t('login.or', 'Or')}
                                        </span>
                                        <div className="flex-grow border-t border-slate-700"></div>
                                    </div>

                                    <ModernButton
                                        type="button"
                                        onClick={handleGuestLogin}
                                        fullWidth
                                        variant="secondary"
                                        icon={<span>👤</span>}
                                    >
                                        {t('login.guestButton', 'Continue as Guest')}
                                    </ModernButton>
                                </>
                            )}
                        </div>
                    </form>

                    <div className="mt-6 pt-6 border-t border-white/5 text-center">
                        <p className={`${TYPOGRAPHY.bodyXs} uppercase tracking-widest font-semibold`}>
                            {t('login.footer', 'Secured by Blockchain Identity')}
                        </p>
                    </div>
                </GlassCard>
            </div>
        </div>
    );
};
