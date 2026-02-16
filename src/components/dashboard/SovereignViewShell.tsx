import React from 'react';
import type { LucideIcon } from 'lucide-react';

export type SovereignViewShellPanel = {
  key: string;
  title: string;
  icon?: LucideIcon;
  iconClassName?: string;
  className?: string;
  colSpan?: 1 | 2 | 3;
  content: React.ReactNode;
};

export type SovereignViewShellConfig = {
  sector: string;
  subtitle: string;
  unitId?: string;
  icon: LucideIcon;
  iconWrapClassName: string;
  iconClassName: string;
  headerRight?: React.ReactNode;
  panels: SovereignViewShellPanel[];
};

export const SovereignViewShell: React.FC<{ config: SovereignViewShellConfig } & { children?: React.ReactNode }> = ({ config, children }) => {
  const HeaderIcon = config.icon;

  return (
    <div className="w-full bg-scada-bg p-6 text-scada-text border border-scada-border rounded-sm">
      <div className="flex items-center justify-between mb-6 border-b border-scada-border pb-4">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-sm ${config.iconWrapClassName}`}>
            <HeaderIcon className={`w-6 h-6 ${config.iconClassName}`} />
          </div>
          <div>
            <h2 className="text-xl font-bold uppercase tracking-wide font-header">{config.sector}</h2>
            <p className="text-xs text-scada-muted font-mono uppercase">
              {config.subtitle}
              {config.unitId ? ` • ${config.unitId}` : ''}
            </p>
          </div>
        </div>

        {config.headerRight}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {config.panels.map((p) => {
          const PanelIcon = p.icon;
          const colSpan = p.colSpan ?? 1;
          const colSpanClass = colSpan === 3 ? 'lg:col-span-3' : colSpan === 2 ? 'lg:col-span-2' : 'lg:col-span-1';

          return (
            <div key={p.key} className={`${colSpanClass} ${p.className ?? ''}`.trim()}>
              <h3 className="text-sm font-bold text-scada-text mb-2 flex items-center gap-2 uppercase tracking-wider font-header">
                {PanelIcon ? (
                  <PanelIcon className={`w-4 h-4 ${p.iconClassName ?? ''}`.trim()} />
                ) : null}
                {p.title}
              </h3>
              {p.content}
            </div>
          );
        })}
      </div>
      {children && (
        <div className="mt-6">
          {children}
        </div>
      )}
    </div>
  );
};
