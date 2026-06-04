import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Construction, ArrowLeft, Zap, Shield, Activity, BookOpen } from 'lucide-react';

interface UnderConstructionProps {
  title?: string;
  description?: string;
  returnPath?: string;
  returnLabel?: string;
  featurePreview?: string[];
}

const DEFAULT_FEATURES = [
  'Advanced telemetry visualization',
  'Physics-based fault prediction',
  'Historical trend analysis',
  'Integration with SCADA network',
];

const RELATED_SECTIONS = [
  { label: 'Fleet Overview', path: '/fleet', icon: <Activity className="w-4 h-4" />, color: 'text-cyan-400' },
  { label: 'Maintenance', path: '/maintenance/dashboard', icon: <Zap className="w-4 h-4" />, color: 'text-amber-400' },
  { label: 'Forensics Lab', path: '/forensics', icon: <Shield className="w-4 h-4" />, color: 'text-emerald-400' },
  { label: 'Knowledge Bank', path: '/knowledge/capture', icon: <BookOpen className="w-4 h-4" />, color: 'text-blue-400' },
];

/**
 * UnderConstruction — NC-PLACEHOLDER v2.0
 * Rich feature preview placeholder instead of a dead end.
 */
export const UnderConstruction: React.FC<UnderConstructionProps> = ({
  title = 'Coming Soon',
  description = 'This module is currently under active development. Check back soon.',
  returnPath,
  returnLabel = 'Go Back',
  featurePreview = DEFAULT_FEATURES,
}) => {
  const navigate = useNavigate();

  return (
    <div className="min-h-[60vh] flex items-center justify-center p-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="max-w-2xl w-full"
      >
        {/* Header */}
        <div className="text-center mb-10">
          {/* Animated construction icon */}
          <motion.div
            animate={{ rotate: [0, 5, -5, 0] }}
            transition={{ repeat: Infinity, duration: 3, ease: 'easeInOut' }}
            className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-amber-500/10 border border-amber-500/20 mb-6 relative"
          >
            <Construction className="w-10 h-10 text-amber-400" />
            {/* Pulsing ring */}
            <div className="absolute inset-0 rounded-2xl border border-amber-400/30 animate-ping" />
          </motion.div>

          <h1 className="text-3xl font-black text-white tracking-tight mb-3">{title}</h1>
          <p className="text-slate-400 text-sm leading-relaxed max-w-md mx-auto">{description}</p>

          {/* Progress bar (decorative) */}
          <div className="mt-6 max-w-xs mx-auto">
            <div className="flex justify-between text-[9px] font-mono text-slate-600 uppercase tracking-wider mb-1.5">
              <span>Development Progress</span>
              <span>~65%</span>
            </div>
            <div className="h-1 bg-slate-900 rounded-full overflow-hidden border border-white/5">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: '65%' }}
                transition={{ delay: 0.4, duration: 1, ease: 'easeOut' }}
                className="h-full bg-gradient-to-r from-amber-600 to-amber-400 rounded-full"
              />
            </div>
          </div>
        </div>

        {/* Feature preview grid */}
        <div className="mb-8">
          <div className="text-[10px] font-mono text-slate-600 uppercase tracking-widest text-center mb-4">
            Planned Features
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {featurePreview.map((feat, i) => (
              <motion.div
                key={feat}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 + i * 0.08 }}
                className="flex items-center gap-3 px-4 py-3 bg-slate-900/60 border border-white/5 rounded-xl"
              >
                <div className="w-1.5 h-1.5 rounded-full bg-amber-400/60 shrink-0" />
                <span className="text-xs text-slate-400">{feat}</span>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Related working sections */}
        <div className="mb-8">
          <div className="text-[10px] font-mono text-slate-600 uppercase tracking-widest text-center mb-4">
            Explore Available Modules
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {RELATED_SECTIONS.map((section, i) => (
              <motion.button
                key={section.label}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 + i * 0.08 }}
                onClick={() => navigate(section.path)}
                className="flex flex-col items-center gap-2 p-4 bg-slate-900/60 hover:bg-slate-800/60 border border-white/5 hover:border-white/10 rounded-xl transition-all group card-3d"
              >
                <span className={`${section.color} group-hover:scale-110 transition-transform`}>
                  {section.icon}
                </span>
                <span className="text-[10px] font-mono text-slate-500 group-hover:text-slate-300 transition-colors text-center">
                  {section.label}
                </span>
              </motion.button>
            ))}
          </div>
        </div>

        {/* Back button */}
        <div className="flex justify-center">
          <button
            onClick={() => returnPath ? navigate(returnPath) : navigate(-1)}
            className="flex items-center gap-2 px-6 py-3 bg-slate-800/50 hover:bg-slate-700/50 border border-white/8 hover:border-white/15 rounded-xl text-sm text-slate-400 hover:text-white transition-all group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            {returnLabel}
          </button>
        </div>
      </motion.div>
    </div>
  );
};
