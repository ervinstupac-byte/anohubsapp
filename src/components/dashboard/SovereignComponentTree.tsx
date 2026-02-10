import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, ChevronDown, Hexagon, Circle, Zap, Anchor, Camera, Sparkles, Activity, FileCheck, Droplet, Settings, AlertTriangle } from 'lucide-react';
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
                            { id: 'RUNNER_HUB', label: 'Runner Hub', icon: 'Circle' }
                        ]
                    },
                    {
                        id: 'GOVERNOR',
                        label: 'Governor System',
                        icon: 'Settings',
                        hasAlert: false,
                        children: [
                            { id: 'SERVO', label: 'Servo Motors', icon: 'Settings' },
                            { id: 'ACTUATOR', label: 'Actuator', icon: 'Settings' }
                        ]
                    },
                    {
                        id: 'BEARINGS',
                        label: 'Bearings',
                        icon: 'Circle',
                        hasAlert: false,
                        children: [
                            { id: 'GUIDE_BEARING', label: 'Guide Bearing', icon: 'Circle' },
                            { id: 'THRUST_BEARING', label: 'Thrust Bearing', icon: 'Circle' },
                            { id: 'GENERATOR_BEARING', label: 'Generator Bearing', icon: 'Circle' }
                        ]
                    }
                ]
            },
            {
                id: 'HYDRAULIC',
                label: 'Hydraulic System',
                icon: 'Droplet',
                hasAlert: false,
                children: [
                    { id: 'PENSTOCK', label: 'Penstock', icon: 'Droplet' },
                    { id: 'SPIRAL_CASE', label: 'Spiral Case', icon: 'Droplet' },
                    { id: 'DRAFT_TUBE', label: 'Draft Tube', icon: 'Droplet' }
                ]
            },
            {
                id: 'ELECTRICAL',
                label: 'Electrical System',
                icon: 'Zap',
                hasAlert: false,
                children: [
                    { id: 'GENERATOR', label: 'Generator', icon: 'Zap' },
                    { id: 'EXCITER', label: 'Exciter', icon: 'Zap' },
                    { id: 'TRANSFORMER', label: 'Transformer', icon: 'Zap' }
                ]
            }
        ]
    }
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
    AlertTriangle
};

export const SovereignComponentTree: React.FC = () => {
    const { mechanical, hydraulic, diagnosis } = useTelemetryStore();
    const [selectedId, setSelectedId] = useState<string>('ROOT');
    const [expandedNodes, setExpandedNodes] = useState<Record<string, boolean>>({ 'ROOT': true, 'HPP': true });
    
    // Asset Passport Modal State
    const [modalOpen, setModalOpen] = useState(false);
    const [selectedComponent, setSelectedComponent] = useState<{id: string, name: string, type: string} | null>(null);

    // Handle component double-click to open Asset Passport
    const handleComponentDoubleClick = (node: TreeNodeProps) => {
        setSelectedComponent({
            id: node.id,
            name: node.label,
            type: node.icon
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
            case 'critical': return 'text-red-400';
            case 'warning': return 'text-yellow-400';
            default: return 'text-green-400';
        }
    };

    const getStatusBg = (status: string) => {
        switch (status) {
            case 'critical': return 'bg-red-500/10 border-red-500/20';
            case 'warning': return 'bg-yellow-500/10 border-yellow-500/20';
            default: return 'bg-green-500/10 border-green-500/20';
        }
    };

    // Recursive Tree Node Component
    const TreeNode = ({ node, level = 0 }: { node: TreeNodeProps, level?: number }) => {
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
                        <motion.div
                            animate={{ rotate: isExpanded ? 90 : 0 }}
                            transition={{ duration: 0.2 }}
                        >
                            <ChevronRight className="w-4 h-4 text-slate-400" />
                        </motion.div>
                    )}
                    <IconComponent className={`w-4 h-4 ${getStatusColor(health)}`} />
                    <span className="text-sm text-slate-200 flex-1">{node.label}</span>
                    {health !== 'healthy' && (
                        <div className={`px-2 py-0.5 rounded-full text-xs font-medium ${getStatusBg(health)} ${getStatusColor(health)}`}>
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
                        colSpan: 3,
                        content: (
                            <GlassCard className="p-4 bg-gradient-to-br from-slate-900/95 to-slate-800/95 backdrop-blur-xl border border-slate-700/50">
                                <div className="space-y-1">
                                    {componentTreeData.map(node => (
                                        <TreeNode key={node.id} node={node} />
                                    ))}
                                </div>
                                
                                {/* Status Legend */}
                                <div className="mt-6 pt-4 border-t border-slate-700/50">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-4">
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
                                        <div className="text-xs text-slate-400">
                                            Vibration: {mechanical?.vibrationX?.toFixed(1) || '0.0'} mm/s | 
                                            Temp: {mechanical?.bearingTemp || 0}°C
                                        </div>
                                    </div>
                                </div>
                            </GlassCard>
                        )
                    }
                ]
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
