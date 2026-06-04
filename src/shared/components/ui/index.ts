/**
 * Master Component Library — Unified UI Exports
 *
 * Import all shared components from this single entry point:
 * import { EngineeringCard, StatusIndicator, GlassCard } from '@/shared/components/ui';
 */

// === CORE CARDS ===
export { GlassCard } from './GlassCard';
export { EngineeringCard } from './EngineeringCard';

// === STATUS & FEEDBACK ===
export { StatusIndicator } from './StatusIndicator';
export { StatusBadge } from './StatusBadge';
export { Spinner } from './Spinner';

// === INPUTS ===
export { ModernButton } from './ModernButton';
export { ModernInput } from './ModernInput';
export { ToggleSwitch } from './ToggleSwitch';
export { ProgressBar } from './ProgressBar';
export { FileUpload } from './FileUpload';
export { DatePicker } from './DatePicker';

// === LAYOUT & NAVIGATION ===
export { Skeleton } from './Skeleton';
export { LoadingShimmer } from './LoadingShimmer';
export { Tooltip } from './Tooltip';
export { Breadcrumbs } from './Breadcrumbs';
export { Modal } from './Modal';
export { Tabs, TabsList, TabsTrigger, TabsContent } from './Tabs';
export { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from './Accordion';
export {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from './DropdownMenu';

// === DISPLAY ===
export { Avatar } from './Avatar';

// === DESIGN TOKENS ===
export * from '../../design-tokens';
