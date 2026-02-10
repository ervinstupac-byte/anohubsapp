export type StatusType = 'nominal' | 'warning' | 'critical' | 'syncing' | 'offline';

export const STATUS_COLORS: Record<
  StatusType,
  { dot: string; bg: string; border: string; text: string; glow: string; hex: string }
> = {
  nominal: {
    dot: 'bg-emerald-400',
    bg: 'bg-emerald-500/10',
    border: 'border-emerald-500/20',
    text: 'text-emerald-300',
    glow: 'shadow-[0_0_20px_rgba(16,185,129,0.12)]',
    hex: '#34d399'
  },
  warning: {
    dot: 'bg-amber-400',
    bg: 'bg-amber-500/10',
    border: 'border-amber-500/20',
    text: 'text-amber-300',
    glow: 'shadow-[0_0_20px_rgba(245,158,11,0.12)]',
    hex: '#fbbf24'
  },
  critical: {
    dot: 'bg-red-400',
    bg: 'bg-red-500/10',
    border: 'border-red-500/20',
    text: 'text-red-300',
    glow: 'shadow-[0_0_20px_rgba(248,113,113,0.12)]',
    hex: '#f87171'
  },
  syncing: {
    dot: 'bg-cyan-400 animate-pulse',
    bg: 'bg-cyan-500/10',
    border: 'border-cyan-500/20',
    text: 'text-cyan-300',
    glow: 'shadow-[0_0_20px_rgba(34,211,238,0.12)]',
    hex: '#22d3ee'
  },
  offline: {
    dot: 'bg-slate-500',
    bg: 'bg-slate-500/10',
    border: 'border-slate-500/20',
    text: 'text-slate-300',
    glow: 'shadow-none',
    hex: '#64748b'
  }
};

export const TYPOGRAPHY = {
  labelXs: 'text-[8px] font-mono font-bold uppercase tracking-wider',
  labelSm: 'text-[9px] font-mono font-medium uppercase tracking-wider',
  labelMd: 'text-[10px] font-black uppercase tracking-widest',
  bodyXs: 'text-[10px] text-slate-300',
  bodySm: 'text-xs text-slate-300',
  valueMd: 'text-sm font-black uppercase',
  valueLg: 'text-2xl font-black',
  valueXl: 'text-3xl font-black'
} as const;

export const TYPOGRAPHY_COMPACT = {
  labelXs: 'text-[7px] font-mono font-bold uppercase tracking-wider',
  labelSm: 'text-[8px] font-mono font-medium uppercase tracking-wider',
  labelMd: 'text-[9px] font-black uppercase tracking-widest',
  bodyXs: 'text-[9px] text-slate-300',
  bodySm: 'text-[11px] text-slate-300',
  valueMd: 'text-xs font-black uppercase',
  valueLg: 'text-xl font-black',
  valueXl: 'text-2xl font-black'
} as const;

export const GLASS = {
  base: 'bg-slate-950/40 backdrop-blur-md border border-white/10',
  card: 'bg-slate-950/40 backdrop-blur-md border border-white/10',
  panel: 'bg-slate-950/30 backdrop-blur-md border border-white/5',
  commander: 'bg-slate-950/60 backdrop-blur-md border border-white/10'
} as const;

export const RADIUS = {
  cardLg: 'rounded-2xl',
  card: 'rounded-2xl',
  panel: 'rounded-xl',
  control: 'rounded-lg'
} as const;

export const SPACING = {
  cardPadding: 'p-6',
  headerGap: 'gap-3',
  sectionGap: 'gap-4'
} as const;

export const SPACING_COMPACT = {
  cardPadding: 'p-4',
  headerGap: 'gap-2',
  sectionGap: 'gap-3'
} as const;

export const Z_INDEX = {
  modal: 'z-[60]'
} as const;

export const SECTOR_GLOW = {
  mechanical: 'shadow-[0_0_30px_rgba(34,211,238,0.12)]'
} as const;
