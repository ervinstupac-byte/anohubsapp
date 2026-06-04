import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronRight,
  ChevronDown,
  Hexagon,
  Circle,
  Zap,
  Anchor,
  Camera,
  Sparkles,
  Activity,
  FileCheck,
  Droplet,
  Settings,
  AlertTriangle,
} from 'lucide-react';
import { GlassCard } from '../../shared/components/ui/GlassCard';
import { useTelemetryStore } from '../../features/telemetry/store/useTelemetryStore';
import { SovereignViewShell } from './SovereignViewShell';
import { AssetPassportModal } from './AssetPassportModal';

interface TreeNodeProps {
  id: string;
  label: string;
  icon: string;
  children?: TreeNodeProps[];
  hasAlert?: boolean;
}

interface ComponentTreeProps {
  selectedId: string;
  onSelect: (id: string) => void;
}

// Component tree data structure
const componentTreeData: TreeNodeProps[] = [
  {
    id: 'ROOT',
    label: 'Hydro Power Plant',
    icon: 'Hexagon',
    children: [
      {
        id: 'HPP',
        label: 'Turbine System',
        icon: 'Zap',
        hasAlert: false,
        children: [
          {
            id: 'TURBINE',
            label: 'Turbine Runner',
            icon: 'Circle',
            hasAlert: false,
            children: [
              { id: 'RUNNER_BLADES', label: 'Runner Blades', icon: 'Activity' },
              { id: 'RUNNER_HUB', label: 'Runner Hub', icon: 'Circle' },
            ],
          },
          {
            id: 'GOVERNOR',
            label: 'Governor System',
            icon: 'Settings',
            hasAlert: false,
            children: [
              { id: 'SERVO', label: 'Servo Motors', icon: 'Settings' },
              { id: 'ACTUATOR', label: 'Actuator', icon: 'Settings' },
            ],
          },
          {
            id: 'BEARINGS',
            label: 'Bearings',
            icon: 'Circle',
            hasAlert: false,
            children: [
              { id: 'GUIDE_BEARING', label: 'Guide Bearing', icon: 'Circle' },
              { id: 'THRUST_BEARING', label: 'Thrust Bearing', icon: 'Circle' },
              { id: 'GENERATOR_BEARING', label: 'Generator Bearing', icon: 'Circle' },
            ],
          },
        ],
      },
      {
        id: 'HYDRAULIC',
        label: 'Hydraulic System',
        icon: 'Droplet',
        hasAlert: false,
        children: [
          { id: 'PENSTOCK', label: 'Penstock', icon: 'Droplet' },
          { id: 'SPIRAL_CASE', label: 'Spiral Case', icon: 'Droplet' },
          { id: 'DRAFT_TUBE', label: 'Draft Tube', icon: 'Droplet' },
        ],
      },
      {
        id: 'ELECTRICAL',
        label: 'Electrical System',
        icon: 'Zap',
        hasAlert: false,
        children: [
          { id: 'GENERATOR', label: 'Generator', icon: 'Zap' },
          { id: 'EXCITER', label: 'Exciter', icon: 'Zap' },
          { id: 'TRANSFORMER', label: 'Transformer', icon: 'Zap' },
        ],
      },
    ],
  },
];

const iconMap: Record<string, React.ComponentType<any>> = {
  Hexagon,
  Circle,
  Zap,
  Anchor,
  Camera,
  Sparkles,
  Activity,
  FileCheck,
  Droplet,
  Settings,
  AlertTriangle,
};

export const SovereignComponentTree: React.FC = () => {
  const { mechanical, hydraulic, diagnosis } = useTelemetryStore();
  const [selectedId, setSelectedId] = useState<string>('ROOT');
  const [expandedNodes, setExpandedNodes] = useState<Record<string, boolean>>({
    ROOT: true,
    HPP: true,
  });

  // Asset Passport Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedComponent, setSelectedComponent] = useState<{
    id: string;
    name: string;
    type: string;
  } | null>(null);

  // Handle component double-click to open Asset Passport
  const handleComponentDoubleClick = (node: TreeNodeProps) => {
    setSelectedComponent({
      id: node.id,
      name: node.label,
      type: node.icon,
    });
    setModalOpen(true);
  };

  // Determine health status based on telemetry
  const getHealthStatus = (componentId: string): 'healthy' | 'warning' | 'critical' => {
    if (!mechanical || !hydraulic) return 'healthy';

    // Simple health logic based on vibration and temperature
    const vibration = mechanical.vibrationX || 0;
    const temperature = mechanical.bearingTemp || 0;

    if (vibration > 5 || temperature > 80) return 'critical';
    if (vibration > 3 || temperature > 65) return 'warning';
    return 'healthy';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'critical':
        return 'text-red-400';
      case 'warning':
        return 'text-yellow-400';
      default:
        return 'text-green-400';
    }
  };

  const getStatusBg = (status: string) => {
    switch (status) {
      case 'critical':
        return 'bg-red-500/10 border-red-500/20';
      case 'warning':
        return 'bg-yellow-500/10 border-yellow-500/20';
      default:
        return 'bg-green-500/10 border-green-500/20';
    }
  };

  // Recursive Tree Node Component
  const TreeNode = ({ node, level = 0 }: { node: TreeNodeProps; level?: number }) => {
    const isExpanded = expandedNodes[node.id] || false;
    const hasChildren = node.children && node.children.length > 0;
    const isSelected = selectedId === node.id;
    const health = getHealthStatus(node.id);
    const IconComponent = iconMap[node.icon] || Circle;

    const toggleExpand = () => {
      if (hasChildren) {
        setExpandedNodes(prev => ({ ...prev, [node.id]: !isExpanded }));
      }
      setSelectedId(node.id);
    };

    return (
      <div className="select-none">
        <div
          className={`flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer transition-all duration-200 hover:bg-slate-700/50 ${
            isSelected ? 'bg-slate-700/70' : ''
          }`}
          style={{ paddingLeft: `${level * 20 + 12}px` }}
          onClick={toggleExpand}
          onDoubleClick={() => handleComponentDoubleClick(node)}
          title="Double-click to view Asset Passport"
        >
          {hasChildren && (
            <motion.div animate={{ rotate: isExpanded ? 90 : 0 }} transition={{ duration: 0.2 }}>
              <ChevronRight className="w-4 h-4 text-slate-400" />
            </motion.div>
          )}
          <IconComponent className={`w-4 h-4 ${getStatusColor(health)}`} />
          <span className="text-sm text-slate-200 flex-1">{node.label}</span>
          {health !== 'healthy' && (
            <div
              className={`px-2 py-0.5 rounded-full text-xs font-medium ${getStatusBg(health)} ${getStatusColor(health)}`}
            >
              {health.toUpperCase()}
            </div>
          )}
        </div>

        <AnimatePresence>
          {isExpanded && hasChildren && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              {node.children?.map(child => (
                <TreeNode key={child.id} node={child} level={level + 1} />
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  };

  const findNodeById = (nodes: TreeNodeProps[], id: string): TreeNodeProps | undefined => {
    for (const node of nodes) {
      if (node.id === id) return node;
      if (node.children) {
        const found = findNodeById(node.children, id);
        if (found) return found;
      }
    }
    return undefined;
  };

  const renderTelemetryForComponent = (id: string) => {
    const vibration = mechanical?.vibrationX ?? 0.0;
    const vibrationY = mechanical?.vibrationY ?? 0.0;
    const temp = mechanical?.bearingTemp ?? 0;
    const flow = hydraulic?.flow ?? 0;
    const head = hydraulic?.head ?? 0;
    const efficiency = hydraulic?.efficiency ?? 0;
    const power = useTelemetryStore.getState().physics?.powerMW ?? 0;
    const gridFreq = useTelemetryStore.getState().gridFrequency ?? 50.0;

    const isMechanicalSub = ['ROOT', 'HPP', 'TURBINE', 'RUNNER_BLADES', 'RUNNER_HUB'].includes(id);
    const isBearingSub = [
      'BEARINGS',
      'GUIDE_BEARING',
      'THRUST_BEARING',
      'GENERATOR_BEARING',
    ].includes(id);
    const isHydraulicSub = ['HYDRAULIC', 'PENSTOCK', 'SPIRAL_CASE', 'DRAFT_TUBE'].includes(id);
    const isElectricalSub = ['ELECTRICAL', 'GENERATOR', 'EXCITER', 'TRANSFORMER'].includes(id);
    const isGovernorSub = ['GOVERNOR', 'SERVO', 'ACTUATOR'].includes(id);

    if (isMechanicalSub) {
      return (
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-slate-900/50 p-3 rounded-lg border border-slate-800">
            <div className="text-[10px] font-mono text-slate-500 uppercase">Radial Vibration X</div>
            <div className="text-2xl font-bold font-mono text-white mt-1">
              {vibration.toFixed(2)} <span className="text-xs text-slate-500">mm/s</span>
            </div>
            <div className="w-full bg-slate-800 rounded-full h-1.5 mt-2">
              <div
                className="h-full rounded-full bg-green-500"
                style={{ width: `${Math.min(100, (vibration / 5) * 100)}%` }}
              />
            </div>
          </div>
          <div className="bg-slate-900/50 p-3 rounded-lg border border-slate-800">
            <div className="text-[10px] font-mono text-slate-500 uppercase">Radial Vibration Y</div>
            <div className="text-2xl font-bold font-mono text-white mt-1">
              {vibrationY.toFixed(2)} <span className="text-xs text-slate-500">mm/s</span>
            </div>
            <div className="w-full bg-slate-800 rounded-full h-1.5 mt-2">
              <div
                className="h-full rounded-full bg-green-500"
                style={{ width: `${Math.min(100, (vibrationY / 5) * 100)}%` }}
              />
            </div>
          </div>
          <div className="bg-slate-900/50 p-3 rounded-lg border border-slate-800 col-span-2 flex items-center justify-between">
            <span className="text-xs font-mono text-slate-400 uppercase">
              Kinetic Orbit Balance
            </span>
            <span className="text-xs font-mono font-bold text-green-400">OPTIMAL</span>
          </div>
        </div>
      );
    }

    if (isBearingSub) {
      return (
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-slate-900/50 p-3 rounded-lg border border-slate-800 col-span-2">
            <div className="text-[10px] font-mono text-slate-500 uppercase">
              Babbitt Temperature
            </div>
            <div className="text-2xl font-bold font-mono text-white mt-1">
              {temp.toFixed(1)} <span className="text-xs text-slate-500">°C</span>
            </div>
            <div className="w-full bg-slate-800 rounded-full h-1.5 mt-2">
              <div
                className="h-full rounded-full bg-yellow-500"
                style={{ width: `${Math.min(100, (temp / 100) * 100)}%` }}
              />
            </div>
          </div>
          <div className="bg-slate-900/50 p-3 rounded-lg border border-slate-800">
            <div className="text-[10px] font-mono text-slate-500 uppercase">
              Lube Film Thickness
            </div>
            <div className="text-sm font-bold font-mono text-white mt-1">42.2 µm</div>
          </div>
          <div className="bg-slate-900/50 p-3 rounded-lg border border-slate-800">
            <div className="text-[10px] font-mono text-slate-500 uppercase">Oil Pressure</div>
            <div className="text-sm font-bold font-mono text-white mt-1">4.2 bar</div>
          </div>
        </div>
      );
    }

    if (isHydraulicSub) {
      return (
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-slate-900/50 p-3 rounded-lg border border-slate-800">
            <div className="text-[10px] font-mono text-slate-500 uppercase">Water Flow Rate</div>
            <div className="text-2xl font-bold font-mono text-white mt-1">
              {flow.toFixed(1)} <span className="text-xs text-slate-500">m³/s</span>
            </div>
          </div>
          <div className="bg-slate-900/50 p-3 rounded-lg border border-slate-800">
            <div className="text-[10px] font-mono text-slate-500 uppercase">Net Head Pressure</div>
            <div className="text-2xl font-bold font-mono text-white mt-1">
              {head.toFixed(1)} <span className="text-xs text-slate-500">m</span>
            </div>
          </div>
          <div className="bg-slate-900/50 p-3 rounded-lg border border-slate-800 col-span-2">
            <div className="text-[10px] font-mono text-slate-500 uppercase">
              Runner Hydraulic Efficiency
            </div>
            <div className="text-2xl font-bold font-mono text-green-400 mt-1">
              {efficiency.toFixed(1)}%
            </div>
          </div>
        </div>
      );
    }

    if (isElectricalSub) {
      return (
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-slate-900/50 p-3 rounded-lg border border-slate-800 col-span-2">
            <div className="text-[10px] font-mono text-slate-500 uppercase">
              Active Electrical Output
            </div>
            <div className="text-2xl font-bold font-mono text-white mt-1">
              {power.toFixed(1)} <span className="text-xs text-slate-500">MW</span>
            </div>
          </div>
          <div className="bg-slate-900/50 p-3 rounded-lg border border-slate-800">
            <div className="text-[10px] font-mono text-slate-500 uppercase">Grid Frequency</div>
            <div className="text-sm font-bold font-mono text-white mt-1">
              {gridFreq.toFixed(2)} Hz
            </div>
          </div>
          <div className="bg-slate-900/50 p-3 rounded-lg border border-slate-800">
            <div className="text-[10px] font-mono text-slate-500 uppercase">
              Power Factor (cos φ)
            </div>
            <div className="text-sm font-bold font-mono text-white mt-1">0.98</div>
          </div>
        </div>
      );
    }

    if (isGovernorSub) {
      return (
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-slate-900/50 p-3 rounded-lg border border-slate-800 col-span-2">
            <div className="text-[10px] font-mono text-slate-500 uppercase">
              Governor Output Stroke
            </div>
            <div className="text-2xl font-bold font-mono text-white mt-1">62.5%</div>
            <div className="w-full bg-slate-800 rounded-full h-1.5 mt-2">
              <div className="h-full rounded-full bg-cyan-500" style={{ width: '62.5%' }} />
            </div>
          </div>
          <div className="bg-slate-900/50 p-3 rounded-lg border border-slate-800">
            <div className="text-[10px] font-mono text-slate-500 uppercase">Pilot Valve Signal</div>
            <div className="text-sm font-bold font-mono text-white mt-1">Nominal</div>
          </div>
          <div className="bg-slate-900/50 p-3 rounded-lg border border-slate-800">
            <div className="text-[10px] font-mono text-slate-500 uppercase">Response Time</div>
            <div className="text-sm font-bold font-mono text-white mt-1">240 ms</div>
          </div>
        </div>
      );
    }

    return (
      <div className="text-center text-slate-500 py-6 font-mono text-xs">
        Select a turbine or electrical subsystem to view real-time parameters.
      </div>
    );
  };

  const getAdvisory = (id: string, health: 'healthy' | 'warning' | 'critical') => {
    if (health === 'critical') {
      return {
        status: 'CRITICAL ALERT',
        color: 'text-red-400 border-red-500/30 bg-red-500/10',
        message:
          '🚨 Immediate maintenance intervention required. Subsystem parameters are exceeding safety interlocks.',
      };
    }
    if (health === 'warning') {
      return {
        status: 'WARNING REPORT',
        color: 'text-yellow-400 border-yellow-500/30 bg-yellow-500/10',
        message:
          '⚠ Operations deviation detected. Schedule inspection and review alignment calibration runout.',
      };
    }
    return {
      status: 'NOMINAL OPERATION',
      color: 'text-green-400 border-green-500/30 bg-green-500/10',
      message: '✓ System is running within optimal operating limits. Continuous monitoring active.',
    };
  };

  const renderComponentDetails = () => {
    const pathMap: Record<string, string> = {
      ROOT: 'Hydro Power Plant',
      HPP: 'Hydro Power Plant > Turbine System',
      TURBINE: 'Hydro Power Plant > Turbine System > Turbine Runner',
      RUNNER_BLADES: 'Hydro Power Plant > Turbine System > Turbine Runner > Runner Blades',
      RUNNER_HUB: 'Hydro Power Plant > Turbine System > Turbine Runner > Runner Hub',
      GOVERNOR: 'Hydro Power Plant > Turbine System > Governor System',
      SERVO: 'Hydro Power Plant > Turbine System > Governor System > Servo Motors',
      ACTUATOR: 'Hydro Power Plant > Turbine System > Governor System > Actuator',
      BEARINGS: 'Hydro Power Plant > Turbine System > Bearings',
      GUIDE_BEARING: 'Hydro Power Plant > Turbine System > Bearings > Guide Bearing',
      THRUST_BEARING: 'Hydro Power Plant > Turbine System > Bearings > Thrust Bearing',
      GENERATOR_BEARING: 'Hydro Power Plant > Turbine System > Bearings > Generator Bearing',
      HYDRAULIC: 'Hydro Power Plant > Hydraulic System',
      PENSTOCK: 'Hydro Power Plant > Hydraulic System > Penstock',
      SPIRAL_CASE: 'Hydro Power Plant > Hydraulic System > Spiral Case',
      DRAFT_TUBE: 'Hydro Power Plant > Hydraulic System > Draft Tube',
      ELECTRICAL: 'Hydro Power Plant > Electrical System',
      GENERATOR: 'Hydro Power Plant > Electrical System > Generator',
      EXCITER: 'Hydro Power Plant > Electrical System > Exciter',
      TRANSFORMER: 'Hydro Power Plant > Electrical System > Transformer',
    };

    const nameMap: Record<string, string> = {
      ROOT: 'Hydro Power Plant (HPP)',
      HPP: 'Turbine System',
      TURBINE: 'Turbine Runner',
      RUNNER_BLADES: 'Runner Blades',
      RUNNER_HUB: 'Runner Hub',
      GOVERNOR: 'Governor System',
      SERVO: 'Servo Motors',
      ACTUATOR: 'Actuator',
      BEARINGS: 'Bearings Subsystem',
      GUIDE_BEARING: 'Guide Bearing',
      THRUST_BEARING: 'Thrust Bearing',
      GENERATOR_BEARING: 'Generator Bearing',
      HYDRAULIC: 'Hydraulic System',
      PENSTOCK: 'Penstock Inlet',
      SPIRAL_CASE: 'Spiral Case',
      DRAFT_TUBE: 'Draft Tube Discharge',
      ELECTRICAL: 'Electrical System',
      GENERATOR: 'Main Generator',
      EXCITER: 'Exciter Unit',
      TRANSFORMER: 'Step-up Transformer',
    };

    const currentName = nameMap[selectedId] || selectedId;
    const currentPath = pathMap[selectedId] || 'System Subsystem';
    const health = getHealthStatus(selectedId);
    const advisory = getAdvisory(selectedId, health);

    return (
      <div className="flex flex-col h-full justify-between gap-4">
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">
              {currentPath}
            </span>
            <div
              className={`px-2 py-0.5 rounded-full text-xs font-bold ${getStatusBg(health)} ${getStatusColor(health)}`}
            >
              {health.toUpperCase()}
            </div>
          </div>
          <h4 className="text-xl font-bold text-white tracking-tight">{currentName}</h4>
        </div>

        <div className="flex-grow flex flex-col justify-center py-2">
          {renderTelemetryForComponent(selectedId)}
        </div>

        <div className={`p-3 border rounded-lg ${advisory.color} text-xs font-mono mb-4`}>
          <div className="font-bold mb-1">{advisory.status}</div>
          <div>{advisory.message}</div>
        </div>

        <div className="flex items-center gap-3 border-t border-slate-800 pt-4">
          <button
            onClick={() => {
              const node = findNodeById(componentTreeData, selectedId);
              if (node) handleComponentDoubleClick(node);
            }}
            className="px-4 py-2 bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 hover:border-cyan-500/50 rounded text-xs font-bold text-cyan-400 uppercase tracking-wider transition-all"
          >
            Inspect Passport
          </button>
          <button
            onClick={() => {
              console.log(`[Diagnostics] Testing telemetry link for ${selectedId}`);
            }}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 hover:border-slate-600 rounded text-xs font-bold text-slate-300 uppercase tracking-wider transition-all"
          >
            Test Connectivity
          </button>
        </div>
      </div>
    );
  };

  return (
    <>
      <SovereignViewShell
        config={{
          sector: 'Component Health Tree',
          subtitle: 'Real-time component health monitoring with interactive navigation',
          icon: Sparkles,
          iconWrapClassName: 'bg-green-500/20 border border-green-500/30',
          iconClassName: 'text-green-400',
          headerRight: (
            <div className="px-3 py-1 bg-green-500/20 border border-green-500/30 rounded-full">
              <span className="text-xs text-green-400 font-medium">LIVE</span>
            </div>
          ),
          panels: [
            {
              key: 'component-tree',
              title: 'Component Tree',
              icon: Activity,
              colSpan: 1,
              content: (
                <GlassCard className="p-4 bg-gradient-to-br from-slate-900/95 to-slate-800/95 backdrop-blur-xl border border-slate-700/50 h-[480px] overflow-y-auto custom-scrollbar">
                  <div className="space-y-1">
                    {componentTreeData.map(node => (
                      <TreeNode key={node.id} node={node} />
                    ))}
                  </div>

                  {/* Status Legend */}
                  <div className="mt-6 pt-4 border-t border-slate-700/50">
                    <div className="flex flex-col gap-2">
                      <div className="flex items-center gap-4 flex-wrap">
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                          <span className="text-xs text-slate-400">Healthy</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                          <span className="text-xs text-slate-400">Warning</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                          <span className="text-xs text-slate-400">Critical</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </GlassCard>
              ),
            },
            {
              key: 'component-details',
              title: 'Subsystem Diagnostics',
              icon: Sparkles,
              colSpan: 2,
              content: (
                <GlassCard className="p-6 bg-gradient-to-br from-slate-900/95 to-slate-800/95 backdrop-blur-xl border border-slate-700/50 h-[480px] flex flex-col justify-between">
                  {renderComponentDetails()}
                </GlassCard>
              ),
            },
          ],
        }}
      />

      {/* Asset Passport Modal */}
      <AssetPassportModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        componentId={selectedComponent?.id || ''}
        componentName={selectedComponent?.name || ''}
        componentType={selectedComponent?.type || ''}
      />
    </>
  );
};
