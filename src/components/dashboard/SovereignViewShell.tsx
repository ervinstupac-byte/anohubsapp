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

export const SovereignViewShell: React.FC<{ config: SovereignViewShellConfig }> = ({ config }) => {
  const HeaderIcon = config.icon;

  return (
    <div className="w-full bg-slate-950 p-6 text-white border-2 border-slate-800 rounded-xl">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className={`p-3 rounded-full ${config.iconWrapClassName}`}>
            <HeaderIcon className={`w-6 h-6 ${config.iconClassName}`} />
          </div>
          <div>
            <h2 className="text-xl font-bold">{config.sector}</h2>
            <p className="text-xs text-slate-400">
              {config.subtitle}
              {config.unitId ? ` • ${config.unitId}` : ''}
            </p>
          </div>
        </div>

        {config.headerRight}
      </div>

      <div className="grid grid-cols-3 gap-6">
        {config.panels.map((p) => {
          const PanelIcon = p.icon;
          const colSpan = p.colSpan ?? 1;
          const colSpanClass = colSpan === 3 ? 'col-span-3' : colSpan === 2 ? 'col-span-2' : 'col-span-1';

          return (
            <div key={p.key} className={`${colSpanClass} ${p.className ?? ''}`.trim()}>
              <h3 className="text-sm font-bold text-slate-300 mb-4 flex items-center gap-2">
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
    </div>
  );
};
