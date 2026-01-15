/**
 * AnoHUB Design Tokens — Single Source of Truth
 * 
 * All color semantics, spacing, and typography constants.
 * Import this file to ensure visual consistency across components.
 */

// === STATUS COLOR SYSTEM ===
// Used for alerts, badges, borders, and indicators
export const STATUS_COLORS = {
    nominal: {
        border: 'border-cyan-500/40',
        borderHover: 'border-cyan-500/60',
        bg: 'bg-cyan-500/5',
        bgHover: 'bg-cyan-500/10',
        text: 'text-cyan-400',
        glow: 'shadow-[0_0_30px_rgba(34,211,238,0.1)]',
        dot: 'bg-cyan-500',
        hex: '#22d3ee'
    },
    warning: {
        border: 'border-amber-500/40',
        borderHover: 'border-amber-500/60',
        bg: 'bg-amber-500/5',
        bgHover: 'bg-amber-500/10',
        text: 'text-amber-400',
        glow: 'shadow-[0_0_30px_rgba(245,158,11,0.1)]',
        dot: 'bg-amber-500',
        hex: '#f59e0b'
    },
    critical: {
        border: 'border-red-500/40',
        borderHover: 'border-red-500/60',
        bg: 'bg-red-500/5',
        bgHover: 'bg-red-500/10',
        text: 'text-red-400',
        glow: 'shadow-[0_0_30px_rgba(239,68,68,0.15)]',
        dot: 'bg-red-500',
        hex: '#ef4444'
    },
    offline: {
        border: 'border-slate-500/30',
        borderHover: 'border-slate-500/50',
        bg: 'bg-slate-500/5',
        bgHover: 'bg-slate-500/10',
        text: 'text-slate-500',
        glow: '',
        dot: 'bg-slate-500',
        hex: '#64748b'
    },
    syncing: {
        border: 'border-purple-500/40',
        borderHover: 'border-purple-500/60',
        bg: 'bg-purple-500/5',
        bgHover: 'bg-purple-500/10',
        text: 'text-purple-400',
        glow: 'shadow-[0_0_30px_rgba(168,85,247,0.1)]',
        dot: 'bg-purple-500',
        hex: '#a855f7'
    }
} as const;

export type StatusType = keyof typeof STATUS_COLORS;

// === TYPOGRAPHY SCALE ===
export const TYPOGRAPHY = {
    // Labels (uppercase, tracking)
    labelXs: 'text-[8px] font-mono font-black uppercase tracking-[0.2em]',
    labelSm: 'text-[9px] font-mono font-black uppercase tracking-widest',
    labelMd: 'text-[10px] font-mono font-black uppercase tracking-widest',

    // Values (monospace, tabular)
    valueXl: 'text-4xl md:text-5xl font-black font-mono tracking-tight',
    valueLg: 'text-3xl font-black font-mono tracking-tighter tabular-nums',
    valueMd: 'text-xl font-mono font-black',
    valueSm: 'text-sm font-mono font-bold',

    // Body
    bodyXs: 'text-[9px] text-slate-500 font-mono',
    bodySm: 'text-xs text-slate-400',
    bodyMd: 'text-sm text-slate-300'
} as const;

export const TYPOGRAPHY_COMPACT = {
    ...TYPOGRAPHY,
    labelMd: 'text-[9px] font-mono font-black uppercase tracking-widest', // Downscale
    valueXl: 'text-3xl font-black font-mono tracking-tight',
    valueLg: 'text-2xl font-black font-mono tracking-tighter tabular-nums',
    valueMd: 'text-lg font-mono font-black',
    cardPadding: 'p-3'
} as const;

// === SPACING SCALE ===
export const SPACING = {
    cardPadding: 'p-4 md:p-5',
    sectionGap: 'gap-5 md:gap-6',
    cardGap: 'gap-3 md:gap-4'
} as const;

export const SPACING_COMPACT = {
    cardPadding: 'p-3',
    sectionGap: 'gap-3',
    cardGap: 'gap-2'
} as const;

// === BORDER RADIUS ===
export const RADIUS = {
    card: 'rounded-lg',
    cardLg: 'rounded-xl',
    badge: 'rounded',
    button: 'rounded-lg',
    full: 'rounded-full'
} as const;

// === GLASSMORPHISM EFFECTS ===
export const GLASS = {
    base: 'bg-slate-900/50 backdrop-blur-sm border border-white/5',
    deep: 'bg-slate-950/80 backdrop-blur-md border border-white/5',
    commander: 'bg-slate-950/90 backdrop-blur-md border border-cyan-500/20 shadow-[0_0_40px_rgba(6,182,212,0.1)]'
} as const;

// === HELPER: Get status classes ===
export const getStatusClasses = (status: StatusType) => STATUS_COLORS[status] || STATUS_COLORS.nominal;

// === Z-INDEX LAYER MAP (Enterprise Standard) ===
// Strict layering to prevent UI overlap conflicts
export const Z_INDEX = {
    background: 'z-0',
    content: 'z-10',
    sidebar: 'z-20',
    telemetryBar: 'z-30',
    modal: 'z-40',
    toast: 'z-50',
    bootOverlay: 'z-[9999]', // System boot is exceptional
} as const;

// === SECTOR GLOW EFFECTS (Semantic) ===
// Used for module categorization hover effects
export const SECTOR_GLOW = {
    critical: 'shadow-[0_0_30px_rgba(239,68,68,0.3)]',     // Red
    mechanical: 'shadow-[0_0_30px_rgba(6,182,212,0.3)]',  // Cyan
    knowledge: 'shadow-[0_0_30px_rgba(59,130,246,0.3)]',  // Blue
    electrical: 'shadow-[0_0_30px_rgba(168,85,247,0.3)]', // Purple
    financial: 'shadow-[0_0_30px_rgba(34,197,94,0.3)]',   // Green
} as const;

export type SectorType = keyof typeof SECTOR_GLOW;
