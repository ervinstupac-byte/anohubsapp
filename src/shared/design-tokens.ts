export type StatusType = 'nominal' | 'warning' | 'critical' | 'syncing' | 'offline';

export const STATUS_COLORS: Record<
  StatusType,
  { dot: string; bg: string; border: string; text: string; glow: string; hex: string }
> = {
  nominal: {
    dot: 'bg-emerald-500',
    bg: 'bg-emerald-900/20',
    border: 'border-emerald-700/50',
    text: 'text-emerald-400',
    glow: 'shadow-none',
    hex: '#34d399'
  },
  warning: {
    dot: 'bg-amber-500',
    bg: 'bg-amber-900/20',
    border: 'border-amber-700/50',
    text: 'text-amber-400',
    glow: 'shadow-none',
    hex: '#fbbf24'
  },
  critical: {
    dot: 'bg-red-500',
    bg: 'bg-red-900/20',
    border: 'border-red-700/50',
    text: 'text-red-400',
    glow: 'shadow-none',
    hex: '#f87171'
  },
  syncing: {
    dot: 'bg-cyan-500 animate-pulse',
    bg: 'bg-cyan-900/20',
    border: 'border-cyan-700/50',
    text: 'text-cyan-400',
    glow: 'shadow-none',
    hex: '#22d3ee'
  },
  offline: {
    dot: 'bg-slate-600',
    bg: 'bg-slate-800/50',
    border: 'border-slate-700',
    text: 'text-slate-400',
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
  base: 'bg-slate-900 border border-slate-700',
  card: 'bg-slate-900 border border-slate-700',
  panel: 'bg-slate-950 border border-slate-800',
  commander: 'bg-black border border-cyan-900'
} as const;

export const RADIUS = {
  cardLg: 'rounded-none',
  card: 'rounded-none',
  panel: 'rounded-none',
  control: 'rounded-none'
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
  mechanical: 'shadow-none'
} as const;
