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
    hex: '#34d399',
  },
  warning: {
    dot: 'bg-amber-500',
    bg: 'bg-amber-900/20',
    border: 'border-amber-700/50',
    text: 'text-amber-400',
    glow: 'shadow-none',
    hex: '#fbbf24',
  },
  critical: {
    dot: 'bg-red-500',
    bg: 'bg-red-900/20',
    border: 'border-red-700/50',
    text: 'text-red-400',
    glow: 'shadow-none',
    hex: '#f87171',
  },
  syncing: {
    dot: 'bg-cyan-500 animate-pulse',
    bg: 'bg-cyan-900/20',
    border: 'border-cyan-700/50',
    text: 'text-cyan-400',
    glow: 'shadow-none',
    hex: '#22d3ee',
  },
  offline: {
    dot: 'bg-slate-600',
    bg: 'bg-slate-800/50',
    border: 'border-slate-700',
    text: 'text-slate-400',
    glow: 'shadow-none',
    hex: '#64748b',
  },
};

export const TYPOGRAPHY = {
  h1: 'text-4xl font-bold tracking-tight',
  h2: 'text-3xl font-bold tracking-tight',
  h3: 'text-2xl font-semibold tracking-tight',
  h4: 'text-xl font-semibold tracking-tight',
  h5: 'text-lg font-semibold tracking-tight',
  h6: 'text-base font-semibold tracking-tight',
  body: 'text-base text-slate-200',
  bodySm: 'text-sm text-slate-300',
  bodyXs: 'text-xs text-slate-400',
  labelXs: 'text-[8px] font-mono font-bold uppercase tracking-wider',
  labelSm: 'text-[9px] font-mono font-medium uppercase tracking-wider',
  labelMd: 'text-[10px] font-black uppercase tracking-widest',
  valueMd: 'text-sm font-black uppercase',
  valueLg: 'text-2xl font-black',
  valueXl: 'text-3xl font-black',
  mono: 'font-mono',
} as const;

export const TYPOGRAPHY_COMPACT = {
  h1: 'text-3xl font-bold tracking-tight',
  h2: 'text-2xl font-bold tracking-tight',
  h3: 'text-xl font-semibold tracking-tight',
  h4: 'text-lg font-semibold tracking-tight',
  h5: 'text-base font-semibold tracking-tight',
  h6: 'text-sm font-semibold tracking-tight',
  body: 'text-sm text-slate-200',
  bodySm: 'text-xs text-slate-300',
  bodyXs: 'text-[11px] text-slate-400',
  labelXs: 'text-[7px] font-mono font-bold uppercase tracking-wider',
  labelSm: 'text-[8px] font-mono font-medium uppercase tracking-wider',
  labelMd: 'text-[9px] font-black uppercase tracking-widest',
  valueMd: 'text-xs font-black uppercase',
  valueLg: 'text-xl font-black',
  valueXl: 'text-2xl font-black',
  mono: 'font-mono',
} as const;

export const GLASS = {
  base: 'bg-slate-900 border border-slate-700',
  card: 'bg-slate-900 border border-slate-700',
  panel: 'bg-slate-950 border border-slate-800',
  commander: 'bg-black border border-cyan-900',
  floating: 'bg-slate-900/90 backdrop-blur-xl border border-slate-700/50',
} as const;

export const RADIUS = {
  none: 'rounded-none',
  sm: 'rounded-sm',
  md: 'rounded-md',
  lg: 'rounded-lg',
  xl: 'rounded-xl',
  '2xl': 'rounded-2xl',
  full: 'rounded-full',
  cardLg: 'rounded-none',
  card: 'rounded-none',
  panel: 'rounded-none',
  control: 'rounded-none',
} as const;

export const SPACING = {
  xs: 'gap-1',
  sm: 'gap-2',
  md: 'gap-3',
  lg: 'gap-4',
  xl: 'gap-6',
  '2xl': 'gap-8',
  cardPadding: 'p-6',
  cardPaddingSm: 'p-4',
  cardPaddingLg: 'p-8',
  headerGap: 'gap-3',
  sectionGap: 'gap-4',
} as const;

export const SPACING_COMPACT = {
  xs: 'gap-1',
  sm: 'gap-1.5',
  md: 'gap-2',
  lg: 'gap-3',
  xl: 'gap-4',
  '2xl': 'gap-6',
  cardPadding: 'p-4',
  cardPaddingSm: 'p-3',
  cardPaddingLg: 'p-6',
  headerGap: 'gap-2',
  sectionGap: 'gap-3',
} as const;

export const SHADOWS = {
  sm: 'shadow-sm',
  md: 'shadow-md',
  lg: 'shadow-lg',
  xl: 'shadow-xl',
  '2xl': 'shadow-2xl',
  inner: 'shadow-inner',
  glowCyan: 'shadow-[0_0_20px_rgba(34,211,238,0.3)]',
  glowGreen: 'shadow-[0_0_20px_rgba(52,211,153,0.3)]',
  glowAmber: 'shadow-[0_0_20px_rgba(251,191,36,0.3)]',
  glowRed: 'shadow-[0_0_20px_rgba(248,113,113,0.3)]',
  card: 'shadow-[0_4px_12px_rgba(0,0,0,0.25)]',
  cardHover: 'shadow-[0_8px_24px_rgba(0,0,0,0.35)]',
} as const;

export const Z_INDEX = {
  dropdown: 'z-40',
  modal: 'z-50',
  tooltip: 'z-60',
  emergency: 'z-[100]',
} as const;

export const TRANSITIONS = {
  fast: 'transition-all duration-150',
  normal: 'transition-all duration-200',
  slow: 'transition-all duration-300',
  bounce: 'transition-all duration-200 ease-out',
} as const;

export const SECTOR_GLOW = {
  mechanical: 'shadow-none',
} as const;
