import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface ModuleStatus {
  name: string;
  status: 'pending' | 'loading' | 'ready' | 'error';
}

const BOOT_MODULES: ModuleStatus[] = [
  { name: 'Physics Engine', status: 'pending' },
  { name: 'Telemetry Core', status: 'pending' },
  { name: 'SCADA Bus', status: 'pending' },
  { name: 'Asset Registry', status: 'pending' },
  { name: 'Knowledge Base', status: 'pending' },
  { name: 'Safety Interlock', status: 'pending' },
];

const BOOT_MESSAGES = [
  'NEURAL CORE INITIALIZATION...',
  'LOADING ISO 10816-5 VIBRATION TABLES...',
  'ESTABLISHING HIVE CONSENSUS...',
  'CALIBRATING THOMA σ ENGINE...',
  'MOUNTING FORENSIC LEDGER...',
  'VERIFYING ASSET INTEGRITY...',
  'LOADING FLUID INTELLIGENCE...',
  'SECURITY PROTOCOLS ACTIVE.',
  'SAFETY INTERLOCK ENGAGED.',
  'ALL SYSTEMS NOMINAL.',
];

/**
 * SystemBootScreen — NC-BOOT v2.0
 * Premium industrial OS boot experience with:
 * - Radar sweep animation
 * - Module-by-module status reveals
 * - Flickering technical messages
 * - Cinematic exit blur
 */
export const SystemBootScreen: React.FC<{ onComplete?: () => void }> = ({ onComplete }) => {
  const [progress, setProgress] = useState(0);
  const [messageIndex, setMessageIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(true);
  const [modules, setModules] = useState<ModuleStatus[]>(BOOT_MODULES.map(m => ({ ...m })));
  const [currentModuleIdx, setCurrentModuleIdx] = useState(0);
  const completedRef = useRef(false);

  useEffect(() => {
    const totalDuration = 2800;
    const tickMs = 25;
    const totalTicks = totalDuration / tickMs;
    let tick = 0;

    const progressTimer = setInterval(() => {
      tick++;
      const rawProgress = tick / totalTicks;
      // Ease: fast start, slow near end
      const eased = rawProgress < 0.8 ? rawProgress * 1.2 : 0.96 + (rawProgress - 0.8) * 0.2;
      const pct = Math.min(100, eased * 100);
      setProgress(pct);

      if (pct >= 100 && !completedRef.current) {
        completedRef.current = true;
        clearInterval(progressTimer);
        setTimeout(() => {
          setIsVisible(false);
          if (onComplete) onComplete();
        }, 600);
      }
    }, tickMs);

    // Message flicker
    const msgTimer = setInterval(() => {
      setMessageIndex(prev => (prev + 1) % BOOT_MESSAGES.length);
    }, 280);

    // Module status reveals — staggered
    const moduleTimers: ReturnType<typeof setTimeout>[] = [];
    BOOT_MODULES.forEach((_, idx) => {
      const delay = 300 + idx * 380;
      moduleTimers.push(
        setTimeout(() => {
          setModules(prev => prev.map((m, i) => (i === idx ? { ...m, status: 'loading' } : m)));
          setCurrentModuleIdx(idx);
          setTimeout(() => {
            setModules(prev => prev.map((m, i) => (i === idx ? { ...m, status: 'ready' } : m)));
          }, 300);
        }, delay)
      );
    });

    return () => {
      clearInterval(progressTimer);
      clearInterval(msgTimer);
      moduleTimers.forEach(clearTimeout);
    };
  }, [onComplete]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 1.06, filter: 'blur(20px)' }}
          transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
          className={`fixed inset-0 z-[9999] bg-[#020617] flex flex-col items-center justify-center overflow-hidden ${progress >= 100 ? 'pointer-events-none' : ''}`}
        >
          {/* ── Background layers ── */}
          <div className="absolute inset-0 surface-grid opacity-20 pointer-events-none" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(6,182,212,0.06)_0%,transparent_65%)] pointer-events-none" />

          {/* Scan line */}
          <motion.div
            animate={{ top: ['-5%', '105%'] }}
            transition={{ repeat: Infinity, duration: 3, ease: 'linear' }}
            className="absolute left-0 right-0 h-16 bg-gradient-to-b from-transparent via-cyan-500/4 to-transparent pointer-events-none"
          />

          {/* ── Radar SVG ── */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-15">
            <svg width="600" height="600" viewBox="0 0 600 600">
              {/* Concentric rings */}
              {[80, 140, 200, 260, 300].map((r, i) => (
                <circle
                  key={r}
                  cx="300"
                  cy="300"
                  r={r}
                  fill="none"
                  stroke="rgba(6,182,212,0.4)"
                  strokeWidth="0.5"
                  opacity={1 - i * 0.15}
                />
              ))}
              {/* Cross hairs */}
              <line
                x1="300"
                y1="0"
                x2="300"
                y2="600"
                stroke="rgba(6,182,212,0.2)"
                strokeWidth="0.5"
              />
              <line
                x1="0"
                y1="300"
                x2="600"
                y2="300"
                stroke="rgba(6,182,212,0.2)"
                strokeWidth="0.5"
              />
              {/* Rotating sweep */}
              <motion.g
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 4, ease: 'linear' }}
                style={{ transformOrigin: '300px 300px' }}
              >
                {/* Sweep line */}
                <line
                  x1="300"
                  y1="300"
                  x2="300"
                  y2="0"
                  stroke="rgba(6,182,212,0.8)"
                  strokeWidth="1.5"
                />
                {/* Fade arc */}
                <path
                  d="M 300 300 L 300 0 A 300 300 0 0 0 0 300 Z"
                  fill="url(#radarGrad)"
                  opacity="0.15"
                />
                <defs>
                  <radialGradient id="radarGrad" cx="50%" cy="50%" r="50%">
                    <stop offset="0%" stopColor="rgba(6,182,212,0)" />
                    <stop offset="100%" stopColor="rgba(6,182,212,0.3)" />
                  </radialGradient>
                </defs>
              </motion.g>
              {/* Center dot */}
              <circle cx="300" cy="300" r="4" fill="#06b6d4" opacity="0.8" />
            </svg>
          </div>

          {/* ── Main content ── */}
          <div className="relative z-10 w-full max-w-lg px-8">
            {/* Brand */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="flex flex-col items-center mb-10"
            >
              {/* Turbine spinner */}
              <div className="relative mb-4">
                <motion.svg
                  viewBox="0 0 60 60"
                  width="60"
                  height="60"
                  animate={{ rotate: 360 }}
                  transition={{ repeat: Infinity, duration: 6, ease: 'linear' }}
                  style={{ transformOrigin: '30px 30px' }}
                >
                  <circle cx="30" cy="30" r="4" fill="#06b6d4" />
                  <ellipse cx="30" cy="14" rx="4" ry="12" fill="#06b6d4" opacity="0.85" />
                  <ellipse
                    cx="30"
                    cy="14"
                    rx="4"
                    ry="12"
                    fill="#06b6d4"
                    opacity="0.85"
                    transform="rotate(120 30 30)"
                  />
                  <ellipse
                    cx="30"
                    cy="14"
                    rx="4"
                    ry="12"
                    fill="#06b6d4"
                    opacity="0.85"
                    transform="rotate(240 30 30)"
                  />
                </motion.svg>
                {/* Outer ring */}
                <motion.div
                  animate={{ rotate: -360 }}
                  transition={{ repeat: Infinity, duration: 12, ease: 'linear' }}
                  className="absolute inset-0 rounded-full border border-cyan-500/20 border-dashed scale-[1.8]"
                />
              </div>

              <div className="text-cyan-400 font-black tracking-[0.4em] text-sm mb-1">ANOHUB</div>
              <div className="text-slate-600 font-mono text-[9px] uppercase tracking-[0.3em]">
                Sovereign HPP Operating System
              </div>
              <div className="h-px w-16 bg-cyan-500/30 mt-2" />
            </motion.div>

            {/* Progress bar */}
            <div className="space-y-3 mb-8">
              <div className="flex justify-between items-end text-[10px] font-mono tracking-wider">
                <motion.span
                  key={messageIndex}
                  initial={{ opacity: 0.4, y: 3 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-cyan-400/80 uppercase"
                >
                  {BOOT_MESSAGES[messageIndex]}
                </motion.span>
                <span className="text-slate-500 tabular-nums">{Math.round(progress)}%</span>
              </div>

              <div className="h-0.5 w-full bg-slate-900 rounded-full overflow-hidden border border-white/5">
                <motion.div
                  className="h-full bg-gradient-to-r from-cyan-600 to-cyan-400 rounded-full"
                  style={{ width: `${progress}%` }}
                  transition={{ ease: 'linear' }}
                />
              </div>

              {/* Neon glow below bar */}
              <div
                className="h-px bg-gradient-to-r from-transparent via-cyan-500/40 to-transparent"
                style={{ opacity: progress / 100 }}
              />
            </div>

            {/* Module status grid */}
            <div className="grid grid-cols-2 gap-2">
              {modules.map((mod, idx) => (
                <motion.div
                  key={mod.name}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: mod.status === 'pending' ? 0.3 : 1, x: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg border transition-all ${
                    mod.status === 'ready'
                      ? 'border-emerald-500/20 bg-emerald-500/5'
                      : mod.status === 'loading'
                        ? 'border-cyan-500/30 bg-cyan-500/5'
                        : 'border-white/5 bg-transparent'
                  }`}
                >
                  {/* Status icon */}
                  <div className="shrink-0">
                    {mod.status === 'ready' ? (
                      <div className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_6px_rgba(16,185,129,0.6)]" />
                    ) : mod.status === 'loading' ? (
                      <div className="w-2 h-2 rounded-full border border-cyan-400 border-t-transparent animate-spin" />
                    ) : (
                      <div className="w-2 h-2 rounded-full bg-slate-700" />
                    )}
                  </div>
                  <span
                    className={`text-[9px] font-mono uppercase tracking-wider ${
                      mod.status === 'ready'
                        ? 'text-emerald-400'
                        : mod.status === 'loading'
                          ? 'text-cyan-400'
                          : 'text-slate-600'
                    }`}
                  >
                    {mod.name}
                  </span>
                </motion.div>
              ))}
            </div>

            {/* Footer */}
            <div className="mt-8 flex flex-col items-center gap-3">
              <motion.div
                animate={{ opacity: [0.3, 0.6, 0.3] }}
                transition={{ repeat: Infinity, duration: 2 }}
                className="text-[8px] text-slate-600 font-mono uppercase tracking-[0.25em]"
              >
                NC-14400 • ISO 10816-5 • Production Pure
              </motion.div>

              {/* Emergency bypass (appears after 3s) */}
              <motion.button
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 3 }}
                onClick={() => {
                  console.warn('[SystemBoot] User initiated manual bypass.');
                  if (onComplete) onComplete();
                }}
                className="text-[9px] text-red-500/40 hover:text-red-400 border border-red-900/20 hover:border-red-500/40 px-3 py-1 bg-transparent hover:bg-red-900/10 rounded cursor-pointer transition-all uppercase tracking-widest font-mono"
              >
                Emergency Bypass
              </motion.button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
