import React from 'react';
import { Layout } from 'lucide-react';
import { useDashboardStore } from '../../stores/useDashboardStore';
import { WIDGET_REGISTRY } from './widgets/WidgetRegistry';

export const CustomizableDashboard: React.FC = () => {
  const { widgets, isEditMode, addWidget, removeWidget, toggleEditMode, resetLayout } = useDashboardStore();

  return (
    <div className="space-y-6">
      {/* Dashboard Toolbar */}
      <div className="flex items-center justify-between p-4 bg-slate-800/50 border border-slate-700 rounded-xl">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-cyan-500/10 rounded-lg">
            <Layout className="w-5 h-5 text-cyan-400" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">Customizable Dashboard</h2>
            <p className="text-xs text-slate-400">Drag, resize, and customize your view</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={toggleEditMode}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
              isEditMode
                ? 'bg-amber-500/20 text-amber-400 border border-amber-500/50'
                : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
            }`}
          >
            {isEditMode ? 'Save Layout' : 'Edit Layout'}
          </button>
          <button
            onClick={resetLayout}
            className="px-3 py-2 rounded-lg text-xs text-slate-400 hover:text-slate-200 hover:bg-slate-700 transition-all"
          >
            Reset
          </button>
        </div>
      </div>

      {/* Add Widget Panel (only visible in edit mode) */}
      {isEditMode && (
        <div className="p-4 bg-slate-800/30 border border-slate-700 rounded-xl">
          <h3 className="text-sm font-semibold text-slate-200 mb-3">Add Widget</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {Object.values(WIDGET_REGISTRY).map((widget) => (
              <button
                key={widget.id}
                onClick={() => addWidget(widget.id)}
                className="p-3 bg-slate-900/50 border border-slate-700 rounded-lg hover:border-cyan-500/50 hover:bg-cyan-500/10 transition-all text-left"
              >
                <div className="text-xl mb-2">{widget.icon}</div>
                <div className="text-sm font-medium text-white">{widget.name}</div>
                <div className="text-xs text-slate-400">{widget.description}</div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Widget Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {widgets.filter(w => w.visible).map((widget) => {
          const WidgetComponent = WIDGET_REGISTRY[widget.type]?.component;
          if (!WidgetComponent) return null;

          return (
            <div
              key={widget.id}
              className={`col-span-${widget.layout.w} row-span-${widget.layout.h} bg-slate-900/60 border border-slate-700 rounded-xl p-4 relative`}
            >
              {/* Widget Header with Remove Button (edit mode only) */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <span className="text-lg">{WIDGET_REGISTRY[widget.type]?.icon}</span>
                  <h3 className="font-semibold text-white">{WIDGET_REGISTRY[widget.type]?.name}</h3>
                </div>
                {isEditMode && (
                  <button
                    onClick={() => removeWidget(widget.id)}
                    className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all"
                  >
                    ✕
                  </button>
                )}
              </div>
              {/* Widget Content */}
              <div className="h-[calc(100%-48px)]">
                <WidgetComponent />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
