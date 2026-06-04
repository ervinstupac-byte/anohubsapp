import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { WIDGET_REGISTRY } from '../components/dashboard/widgets/WidgetRegistry';

export interface WidgetInstance {
  id: string;
  type: string;
  layout: { x: number; y: number; w: number; h: number };
  visible: boolean;
}

interface DashboardState {
  widgets: WidgetInstance[];
  isEditMode: boolean;
  addWidget: (type: string) => void;
  removeWidget: (id: string) => void;
  updateWidgetLayout: (id: string, layout: Partial<WidgetInstance['layout']>) => void;
  toggleEditMode: () => void;
  resetLayout: () => void;
}

const DEFAULT_LAYOUT: WidgetInstance[] = [
  {
    id: 'financialHealth-1',
    type: 'financialHealth',
    layout: { x: 0, y: 0, w: 2, h: 2 },
    visible: true,
  },
  {
    id: 'componentHealth-1',
    type: 'componentHealth',
    layout: { x: 2, y: 0, w: 4, h: 3 },
    visible: true,
  },
];

export const useDashboardStore = create<DashboardState>()(
  persist(
    (set, get) => ({
      widgets: DEFAULT_LAYOUT,
      isEditMode: false,
      addWidget: (type: string) => {
        const widgetDef = WIDGET_REGISTRY[type];
        if (!widgetDef) return;
        const newId = `${type}-${Date.now()}`;
        const newWidget: WidgetInstance = {
          id: newId,
          type,
          layout: { x: 0, y: 0, ...widgetDef.defaultSize },
          visible: true,
        };
        set(state => ({
          widgets: [...state.widgets, newWidget],
        }));
      },
      removeWidget: (id: string) => {
        set(state => ({
          widgets: state.widgets.filter(w => w.id !== id),
        }));
      },
      updateWidgetLayout: (id: string, layout: Partial<WidgetInstance['layout']>) => {
        set(state => ({
          widgets: state.widgets.map(w =>
            w.id === id ? { ...w, layout: { ...w.layout, ...layout } } : w
          ),
        }));
      },
      toggleEditMode: () => {
        set(state => ({ isEditMode: !state.isEditMode }));
      },
      resetLayout: () => {
        set({ widgets: DEFAULT_LAYOUT, isEditMode: false });
      },
    }),
    {
      name: 'sovereign-dashboard-state',
      storage: createJSONStorage(() => localStorage),
    }
  )
);
