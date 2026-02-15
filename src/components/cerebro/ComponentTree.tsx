import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, ChevronDown, Hexagon, Circle, Zap, Anchor, Camera, Sparkles, Activity, FileCheck, Droplet, Settings, AlertTriangle } from 'lucide-react';
import { useTelemetryStore } from '../../features/telemetry/store/useTelemetryStore';
import { GlassCard } from '../../shared/components/ui/GlassCard';
import { InspectionImage } from '../../services/StrategicPlanningService';
import { useTranslation } from 'react-i18next';

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

export const ComponentTree: React.FC<ComponentTreeProps> = ({ selectedId, onSelect }) => {
    const { t } = useTranslation();

    // Recursive Tree Node Component
    const TreeNode = ({ node, level = 0 }: { node: TreeNodeProps, level?: number }) => {
        const [expanded, setExpanded] = useState<Record<string, boolean>>({ 'ROOT': true, 'HPP': true });
        
        // Use TelemetryStore to store inspection images
        const { addInspectionImage } = useTelemetryStore();

        // Local toggle for specific node if needed, or use global state
        const [isExpanded, setIsExpanded] = useState(true);

        const hasChildren = node.children && node.children.length > 0;
        const isSelected = selectedId === node.id;

        // Upload Logic
        const handleImageUpload = (nodeId: string, e: React.ChangeEvent<HTMLInputElement>) => {
            if (!e.target.files?.length) return;
            const file = e.target.files[0];
            const reader = new FileReader();

            reader.onload = (ev) => {
                const src = ev.target?.result as string;

                // SIMULATE AI ANALYSIS (Gemini Vision Mock)
                // In real app, we'd send 'src' to API. Here we mock specific tags for 'Radno kolo'.
                let caption = "Standardinspektion.";
                let tags = ['General'];

                if (nodeId === 'TURBINE') {
                    caption = "KI-ANALYSE: Materialabtrag an der Eintrittskante. Diagnose: Kavitationsfraß (mittel). Empfehlung: Schleifen.";
                    tags = ['Kavitation', 'Materialabtrag'];
                }

                const newImg: any = {
                    src: src,
                    tag: tags[0], // Use first tag as primary
                    timestamp: new Date().toISOString(),
                    notes: caption
                };

                if (addInspectionImage) {
                    addInspectionImage(1, nodeId, newImg);
                    alert(t('common.success', 'Image uploaded successfully'));
                } else {
                    console.warn('addInspectionImage not available in context');
                }
            };

            reader.readAsDataURL(file);
        };

        const toggle = () => setIsExpanded(!isExpanded);

        return (
            <div className="select-none">
                {/* Content Line */}
                <div
                    className={`flex items-center gap-2 py-2 px-3 cursor-pointer transition-colors ${isSelected
                        ? 'bg-[#2dd4bf]/10 text-[#2dd4bf] border-r-2 border-[#2dd4bf]'
                        : 'text-slate-400 hover:text-white hover:bg-white/5'
                        }`}
                    style={{ paddingLeft: `${level * 16 + 12}px` }}
                    onClick={() => {
                        onSelect(node.id);
                        if (hasChildren) toggle();
                    }}
                >
                    {hasChildren && (
                        <div className="text-slate-600">
                            {isExpanded ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
                        </div>
                    )}

                    {!hasChildren && <div className="w-3" />}

                    {node.icon === 'droplet' && <Droplet className="w-3 h-3" />}
                    {node.icon === 'zap' && <Zap className="w-3 h-3" />}
                    {node.icon === 'anchor' && <Anchor className="w-3 h-3" />}
                    {node.icon === 'settings' && <Settings className="w-3 h-3" />}

                    <span className="text-xs font-bold uppercase tracking-wider flex-1">
                        {t(`hpp.${node.id.toLowerCase()}`, node.label)}
                    </span>

                    {/* CAMERA UPLOAD (Only for Leaves or Specific Nodes like Turbine) */}
                    {(node.id === 'TURBINE' || node.id === 'PENSTOCK' || node.id === 'MECHANICAL') && (
                        <label className="p-1 hover:bg-white/10 rounded-full cursor-pointer group relative" onClick={(e) => e.stopPropagation()}>
                            <Camera className="w-4 h-4 text-slate-500 group-hover:text-amber-400 transition-colors" />
                            <input
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={(e) => handleImageUpload(node.id, e)}
                            />
                            <div className="absolute -top-1 -right-1 w-2 h-2 bg-amber-500 rounded-full opacity-0 group-hover:opacity-100 animate-ping" />
                        </label>
                    )}

                    {node.hasAlert && (
                        <motion.div
                            initial={{ scale: 0 }} animate={{ scale: 1 }}
                            className="bg-red-500/20 p-1 rounded-full animate-pulse"
                        >
                            <AlertTriangle className="w-3 h-3 text-red-500" />
                        </motion.div>
                    )}
                </div>

                <AnimatePresence>
                    {isExpanded && hasChildren && (
                        <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="overflow-hidden"
                        >
                            {node.children!.map((child) => (
                                <TreeNode key={child.id} node={child} level={level + 1} />
                            ))}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        );
    };

    const TREE_DATA: TreeNodeProps[] = [
        {
            id: 'HYDRAULICS', label: 'Hydraulics', icon: 'droplet', children: [
                { id: 'PENSTOCK', label: 'Penstock', icon: 'droplet' },
                { id: 'VALVES', label: 'Valves', icon: 'droplet' }
            ]
        },
        {
            id: 'MECHANICAL', label: 'Mechanical', icon: 'anchor', children: [
                { id: 'TURBINE', label: 'Turbine', icon: 'anchor' },
                { id: 'BOLTS', label: 'Bolts & Flanges', icon: 'anchor' },
                { id: 'SHAFT', label: 'Shaft Line', icon: 'anchor' }
            ]
        },
        {
            id: 'ELECTRO', label: 'Electro', icon: 'zap', children: [
                { id: 'GENERATOR', label: 'Generator', icon: 'zap' },
                { id: 'SCADA', label: 'SCADA', icon: 'zap' }
            ]
        }
    ];

    return (
        <div className="w-64 bg-[#0a0a0a] border-r border-white/10 flex flex-col">
            <div className="p-4 border-b border-white/5">
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{t('common.navigation', 'Components')}</span>
            </div>
            <div className="flex-1 overflow-y-auto py-2">
                {TREE_DATA.map((node) => (
                    <TreeNode key={node.id} node={node} />
                ))}
            </div>
        </div>
    );
};
