import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../stores/useAppStore';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { LanguageSelector } from './LanguageSelector';
import { GlassCard } from '../shared/components/ui/GlassCard';
import { TYPOGRAPHY } from '../shared/design-tokens';
import { ModernInput } from '../shared/components/ui/ModernInput';
import { ModernButton } from '../shared/components/ui/ModernButton';
import { Shield, Zap, Globe, Activity, CheckCircle, WifiOff } from 'lucide-react';

type AuthMode = 'login' | 'signup' | 'reset';

/* --- Left panel static stats --- */
const STATS = [
  { value: '247', label: 'Plants Monitored', icon: <Globe className="w-4 h-4" /> },
  { value: '99.7%', label: 'System Uptime', icon: <Activity className="w-4 h-4" /> },
  { value: 'ISO 10816', label: 'Vibration Certified', icon: <Shield className="w-4 h-4" /> },
  { value: '92%', label: 'Efficiency Target', icon: <Zap className="w-4 h-4" /> },
];

const FEATURES = [
  'Real-time SCADA telemetry',
  'Physics-based fault diagnosis',
  'ISO 10816-5 vibration compliance',
  'Forensic engineering reports',
  'Full offline operation',
];

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
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const [animatedStats, setAnimatedStats] = useState([0, 0, 0, 0]);

  /* Detect online/offline */
  useEffect(() => {
    const onOnline = () => setIsOffline(false);
    const onOffline = () => setIsOffline(true);
    window.addEventListener('online', onOnline);
    window.addEventListener('offline', onOffline);
    return () => {
      window.removeEventListener('online', onOnline);
      window.removeEventListener('offline', onOffline);
    };
  }, []);

  /* Animate stat counters on mount */
  useEffect(() => {
    const targets = [247, 99.7, 5, 92];
    const duration = 1200;
    const steps = 40;
    let step = 0;
    const interval = setInterval(() => {
      step++;
      const progress = step / steps;
      const eased = 1 - Math.pow(1 - progress, 3);
      setAnimatedStats(targets.map(t => Math.round(t * eased * 10) / 10));
      if (step >= steps) clearInterval(interval);
    }, duration / steps);
    return () => clearInterval(interval);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (mode === 'login') {
        const { error } = await signIn(email, password);
        if (error) throw error;
      } else if (mode === 'signup') {
        if (password !== confirmPassword) throw new Error('Passwords do not match');
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
      showToast(t('login.guestWelcome', 'Welcome, Guest Engineer!'), 'success');
      navigate('/');
    } catch (error) {
      console.error('Auth Transition Failure:', error);
    }
  };

  return (
    <div className="min-h-screen flex bg-[#020617] relative overflow-hidden">

      {/* ── ANIMATED BACKGROUND ── */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Deep glow orbs */}
        <div className="absolute top-[-20%] left-[-15%] w-[70%] h-[70%] bg-cyan-600/8 rounded-full blur-[100px] animate-pulse-glow" />
        <div className="absolute bottom-[-25%] right-[-15%] w-[60%] h-[60%] bg-blue-700/8 rounded-full blur-[100px] animate-pulse-glow" style={{ animationDelay: '2.5s' }} />
        <div className="absolute top-[40%] left-[30%] w-[40%] h-[40%] bg-indigo-800/5 rounded-full blur-[80px]" />

        {/* Grid overlay */}
        <div className="absolute inset-0 surface-grid opacity-30" />

        {/* Scan line */}
        <motion.div
          animate={{ top: ['-5%', '105%'] }}
          transition={{ repeat: Infinity, duration: 6, ease: 'linear' }}
          className="absolute left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-cyan-500/15 to-transparent pointer-events-none"
        />
      </div>

      {/* ── LEFT PANEL (Desktop) ── */}
      <motion.div
        initial={{ opacity: 0, x: -40 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        className="hidden lg:flex flex-col justify-between w-[42%] p-12 border-r border-white/5 relative z-10"
      >
        {/* Brand */}
        <div>
          <div className="flex items-center gap-3 mb-2">
            {/* Turbine spinner SVG */}
            <div className="relative w-10 h-10">
              <svg viewBox="0 0 40 40" className="w-10 h-10">
                <motion.g
                  animate={{ rotate: 360 }}
                  transition={{ repeat: Infinity, duration: 8, ease: 'linear' }}
                  style={{ transformOrigin: '20px 20px' }}
                >
                  <circle cx="20" cy="20" r="3" fill="#06b6d4" />
                  <ellipse cx="20" cy="10" rx="3" ry="8" fill="#06b6d4" opacity="0.8" />
                  <ellipse cx="20" cy="10" rx="3" ry="8" fill="#06b6d4" opacity="0.8" transform="rotate(120 20 20)" />
                  <ellipse cx="20" cy="10" rx="3" ry="8" fill="#06b6d4" opacity="0.8" transform="rotate(240 20 20)" />
                </motion.g>
                <circle cx="20" cy="20" r="18" fill="none" stroke="rgba(6,182,212,0.2)" strokeWidth="1" />
                <circle cx="20" cy="20" r="12" fill="none" stroke="rgba(6,182,212,0.1)" strokeWidth="1" />
              </svg>
              {/* Outer ring */}
              <motion.div
                animate={{ rotate: -360 }}
                transition={{ repeat: Infinity, duration: 16, ease: 'linear' }}
                className="absolute inset-0 rounded-full border border-cyan-500/20 border-dashed"
              />
            </div>
            <div>
              <div className="text-2xl font-black text-white tracking-tighter">AnoHUB</div>
              <div className="text-[10px] font-mono text-cyan-500/70 uppercase tracking-[0.3em]">Sovereign HPP OS</div>
            </div>
          </div>
        </div>

        {/* Tagline */}
        <div className="mt-12">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="text-4xl font-black text-white leading-tight tracking-tighter mb-4"
          >
            Engineering<br />
            <span className="text-gradient-cyan">Intelligence</span><br />
            at Scale.
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.6 }}
            className="text-slate-400 text-sm leading-relaxed max-w-xs"
          >
            The world's most advanced hydroelectric power plant monitoring and diagnostic platform.
            Built on real physics. Designed for field engineers.
          </motion.p>
        </div>

        {/* Stats Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.6 }}
          className="grid grid-cols-2 gap-4 my-10"
        >
          {STATS.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.7 + i * 0.1 }}
              className="p-4 bg-white/3 border border-white/5 rounded-xl backdrop-blur-sm hover:border-cyan-500/20 transition-colors group"
            >
              <div className="text-cyan-400/60 mb-2 group-hover:text-cyan-400 transition-colors">
                {stat.icon}
              </div>
              <div className="text-2xl font-black text-white font-mono tabular-nums">
                {i === 0 ? animatedStats[0] :
                  i === 1 ? `${animatedStats[1]}%` :
                  i === 2 ? stat.value :
                  `${animatedStats[3]}%`}
              </div>
              <div className="text-[10px] text-slate-500 uppercase tracking-wider font-mono mt-1">
                {stat.label}
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Feature list */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 0.5 }}
          className="space-y-2"
        >
          {FEATURES.map((feat, i) => (
            <motion.div
              key={feat}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 1.1 + i * 0.08 }}
              className="flex items-center gap-2"
            >
              <CheckCircle className="w-3.5 h-3.5 text-cyan-500/70 shrink-0" />
              <span className="text-xs text-slate-400">{feat}</span>
            </motion.div>
          ))}
        </motion.div>

        {/* Footer */}
        <div className="mt-8 pt-6 border-t border-white/5">
          <p className="text-[9px] font-mono text-slate-600 uppercase tracking-widest">
            PROTOCOL NC-14400 • ISO 10816-5 • PRODUCTION PURE
          </p>
        </div>
      </motion.div>

      {/* ── RIGHT PANEL: Auth Form ── */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 relative z-10">
        {/* Language selector */}
        <div className="absolute top-6 right-6">
          <LanguageSelector />
        </div>

        {/* Offline indicator */}
        <AnimatePresence>
          {isOffline && (
            <motion.div
              initial={{ opacity: 0, y: -10, height: 0 }}
              animate={{ opacity: 1, y: 0, height: 'auto' }}
              exit={{ opacity: 0, y: -10, height: 0 }}
              className="w-full max-w-md mb-4 flex items-center gap-2 px-4 py-2.5 bg-amber-950/50 border border-amber-500/30 rounded-xl"
            >
              <WifiOff className="w-4 h-4 text-amber-400 shrink-0" />
              <span className="text-xs font-mono text-amber-300">
                <strong>LOCAL MODE —</strong> Guest access available offline.
              </span>
            </motion.div>
          )}
        </AnimatePresence>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="w-full max-w-md"
        >
          {/* Mobile logo */}
          <div className="lg:hidden text-center mb-8">
            <h1 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500 tracking-tighter">
              AnoHUB
            </h1>
            <p className="text-xs font-mono text-slate-500 mt-1 uppercase tracking-widest">
              {t('login.subtitle', 'Sovereign HPP Operating System')}
            </p>
          </div>

          <GlassCard className="shadow-2xl shadow-black/40 border border-white/6">
            {/* Mode tabs */}
            <div className="flex gap-1 mb-6 bg-slate-950/60 p-1 rounded-lg border border-white/5">
              {(['login', 'signup', 'reset'] as AuthMode[]).map(m => (
                <button
                  key={m}
                  onClick={() => setMode(m)}
                  className={`flex-1 py-2 text-xs font-bold tracking-wider rounded-md transition-all capitalize ${
                    mode === m
                      ? 'bg-cyan-600 text-white shadow-md shadow-cyan-500/30'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
                  }`}
                >
                  {m === 'login' ? 'Login' : m === 'signup' ? 'Sign Up' : 'Reset'}
                </button>
              ))}
            </div>

            {/* Heading */}
            <AnimatePresence mode="wait">
              <motion.div
                key={mode}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.2 }}
                className="mb-6 text-center"
              >
                <h2 className="text-xl font-bold text-white tracking-tight">
                  {mode === 'login'
                    ? t('login.title', 'Secure Access')
                    : mode === 'signup'
                    ? t('login.signupTitle', 'Create Account')
                    : t('login.resetTitle', 'Reset Password')}
                </h2>
                <p className={`${TYPOGRAPHY.bodyXs} mt-1`}>
                  {mode === 'login'
                    ? t('login.instructions', 'Please verify your credentials.')
                    : mode === 'signup'
                    ? t('login.signupInstructions', 'Join the AnoHUB engineering community.')
                    : t('login.resetInstructions', 'Enter your email to reset your password.')}
                </p>
              </motion.div>
            </AnimatePresence>

            <form onSubmit={handleSubmit} className="space-y-5">
              <ModernInput
                label={t('login.emailLabel', 'Email Address')}
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="engineer@anohub.com"
                icon={<span className="text-lg">📧</span>}
                required
              />

              {mode !== 'reset' && (
                <ModernInput
                  label={t('login.passwordLabel', 'Password')}
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
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
                  onChange={e => setConfirmPassword(e.target.value)}
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
                  {mode === 'login'
                    ? t('login.signInButton', 'Authenticate')
                    : mode === 'signup'
                    ? t('login.signUpButton', 'Create Account')
                    : t('login.resetButton', 'Send Reset Email')}
                </ModernButton>

                {mode === 'login' && (
                  <>
                    <div className="relative flex py-2 items-center">
                      <div className="flex-grow border-t border-white/8" />
                      <span className={`flex-shrink-0 mx-4 ${TYPOGRAPHY.bodyXs} uppercase text-slate-600`}>
                        {t('login.or', 'Or')}
                      </span>
                      <div className="flex-grow border-t border-white/8" />
                    </div>

                    {/* Guest button — glowing when offline */}
                    <motion.div
                      animate={isOffline ? { boxShadow: ['0 0 0 0 rgba(245,158,11,0.3)', '0 0 16px 4px rgba(245,158,11,0.1)', '0 0 0 0 rgba(245,158,11,0.3)'] } : {}}
                      transition={{ repeat: Infinity, duration: 2 }}
                      className="rounded-xl"
                    >
                      <ModernButton
                        type="button"
                        onClick={handleGuestLogin}
                        fullWidth
                        variant="secondary"
                        icon={<span>👤</span>}
                      >
                        {isOffline
                          ? t('login.guestButtonOffline', 'Enter as Guest (Offline Mode)')
                          : t('login.guestButton', 'Continue as Guest')}
                      </ModernButton>
                    </motion.div>
                  </>
                )}
              </div>
            </form>

            <div className="mt-6 pt-5 border-t border-white/5 text-center">
              <p className={`${TYPOGRAPHY.bodyXs} uppercase tracking-widest font-semibold text-slate-600`}>
                {t('login.footer', 'Secured by Blockchain Identity')}
              </p>
            </div>
          </GlassCard>

          {/* Version watermark */}
          <p className="text-center text-[9px] font-mono text-slate-700 mt-4 uppercase tracking-widest">
            NC-14400 PRODUCTION PURE • {new Date().getFullYear()}
          </p>
        </motion.div>
      </div>
    </div>
  );
};
