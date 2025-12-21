import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Settings, Zap, Droplets, ChevronRight, ChevronDown, AlertTriangle } from 'lucide-react';
import { useProjectEngine } from '../../contexts/ProjectContext';

interface TreeNodeProps {
    id: string;
    label: string;
    icon: React.ElementType;
    children?: TreeNodeProps[];
    hasAlert?: boolean;
}

const TREE_DATA: TreeNodeProps[] = [
    {
        id: 'HYDRAULICS',
        label: 'Hydraulics',
        icon: Droplets,
        children: [
            { id: 'PENSTOCK', label: 'Penstock', icon: Droplets, hasAlert: false }, // Dynamic check needed
            { id: 'INTAKE', label: 'Intake', icon: Droplets, hasAlert: false }
        ]
    },
    {
        id: 'MECHANICAL',
        label: 'Mechanical',
        icon: Settings,
        children: [
            { id: 'BOLTS', label: 'Flanges & Bolts', icon: Settings, hasAlert: false },
            { id: 'TURBINE_SHAFT', label: 'Turbine Shaft', icon: Settings, hasAlert: false }
        ]
    },
    {
        id: 'ELECTRO',
        label: 'Electro',
        icon: Zap,
        children: [
            { id: 'GENERATOR', label: 'Generator', icon: Zap, hasAlert: false }
        ]
    }
];

interface ComponentTreeProps {
    onSelect: (nodeId: string) => void;
    selectedId: string;
}

export const ComponentTree: React.FC<ComponentTreeProps> = ({ onSelect, selectedId }) => {
    const { technicalState } = useProjectEngine();

    // Check for alerts to propagate up the tree
    const hasBoltAlert = technicalState.physics.criticalAlerts.some(a => a.includes('BOLT'));
    const hasPipeAlert = technicalState.physics.criticalAlerts.some(a => a.includes('Pipe'));

    return (
        <div className="w-64 bg-[#0a0a0a] border-r border-white/10 h-full flex flex-col p-4">
            <div className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-6 px-2">
                System Hierarchy
            </div>

            <div className="space-y-1">
                {TREE_DATA.map(node => (
                    <TreeNode
                        key={node.id}
                        node={node}
                        selectedId={selectedId}
                        onSelect={onSelect}
                        boltAlert={hasBoltAlert} // Propagate specific alerts
                        pipeAlert={hasPipeAlert}
                    />
                ))}
            </div>
        </div>
    );
};

const TreeNode: React.FC<{ node: TreeNodeProps, selectedId: string, onSelect: (id: string) => void, boltAlert: boolean, pipeAlert: boolean }> = ({ node, selectedId, onSelect, boltAlert, pipeAlert }) => {
    const [isOpen, setIsOpen] = useState(true);
    const hasChildren = node.children && node.children.length > 0;

    // Determine Alert State for this Node
    let isCritical = false;
    if (node.id === 'MECHANICAL' && boltAlert) isCritical = true;
    if (node.id === 'BOLTS' && boltAlert) isCritical = true;
    if (node.id === 'HYDRAULICS' && pipeAlert) isCritical = true;

    const isSelected = selectedId === node.id || node.children?.some(c => c.id === selectedId);

    return (
        <div className="ml-2">
            <button
                onClick={() => hasChildren ? setIsOpen(!isOpen) : onSelect(node.id)}
                className={`flex items-center gap-2 w-full p-2 rounded-md transition-colors text-sm ${selectedId === node.id
                        ? 'bg-[#2dd4bf]/10 text-[#2dd4bf] font-bold'
                        : 'text-slate-400 hover:bg-white/5 hover:text-white'
                    }`}
            >
                {hasChildren && (
                    <span className="opacity-50">
                        {isOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                    </span>
                )}
                <node.icon size={16} className={isCritical ? 'text-red-500 animate-pulse' : ''} />
                <span className="flex-grow text-left">{node.label}</span>

                {isCritical && <AlertTriangle size={14} className="text-red-500" />}
            </button>

            <AnimatePresence>
                {isOpen && hasChildren && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden border-l border-white/5 ml-3"
                    >
                        {node.children!.map(child => (
                            <TreeNode
                                key={child.id}
                                node={child}
                                selectedId={selectedId}
                                onSelect={onSelect}
                                boltAlert={boltAlert}
                                pipeAlert={pipeAlert}
                            />
                        ))}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};
