import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Wrench, BarChart3, Settings, ArrowRight, ArrowLeft, ArrowUp, ArrowDown, Activity } from 'lucide-react';
import { useTranslation } from 'react-i18next';

/**
 * EcosystemMap - Visualizes the "Golden Thread" of the Seamless Workflow.
 * Shows how Data, Design, and Operations are interconnected.
 */
export const EcosystemMap: React.FC = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();

    const nodes = [
        {
            id: 'design',
            label: 'Design Studio',
            icon: <Settings className="w-5 h-5 text-purple-400" />,
            path: '/hpp-builder',
            description: 'Asset Configuration & Specs',
            color: 'border-purple-500/30 bg-purple-500/5',
            x: '20%',
            y: '20%'
        },
        {
            id: 'operations',
            label: 'Toolbox (Field)',
            icon: <Wrench className="w-5 h-5 text-cyan-400" />,
            path: '/',
            description: 'Maintenance & Logs',
            color: 'border-cyan-500/30 bg-cyan-500/5',
            x: '50%',
            y: '50%' // Center Hub
        },
        {
            id: 'analytics',
            label: 'Executive Command',
            icon: <BarChart3 className="w-5 h-5 text-amber-400" />,
            path: '/executive',
            description: 'Trends & Financials',
            color: 'border-amber-500/30 bg-amber-500/5',
            x: '80%',
            y: '20%'
        },
        {
            id: 'digital_twin',
            label: 'Digital Twin',
            icon: <Activity className="w-5 h-5 text-emerald-400" />,
            path: '/diagnostic-twin',
            description: 'Live Telemetry & Diagnostics',
            color: 'border-emerald-500/30 bg-emerald-500/5',
            x: '50%',
            y: '80%'
        }
    ];

    return (
        <div className="w-full h-[400px] relative bg-slate-900/50 rounded-xl border border-white/5 overflow-hidden backdrop-blur-sm p-4">
            <h3 className="text-sm font-mono text-slate-400 uppercase tracking-widest mb-4 absolute top-4 left-4 z-10">
                Seamless Workflow Ecosystem
            </h3>

            {/* Connecting Lines (The Golden Thread) */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-30">
                <defs>
                    <marker id="arrow" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto" markerUnits="strokeWidth">
                        <path d="M0,0 L0,6 L9,3 z" fill="#475569" />
                    </marker>
                </defs>
                {/* Design -> Operations */}
                <path d="M 25% 25% Q 35% 35% 45% 45%" stroke="white" strokeWidth="2" strokeDasharray="5,5" markerEnd="url(#arrow)" />
                {/* Operations -> Design */}
                <path d="M 45% 55% Q 35% 65% 25% 75%" stroke="transparent" /> {/* Hidden return path logic visual only */}

                {/* Operations -> Analytics */}
                <path d="M 55% 45% Q 65% 35% 75% 25%" stroke="white" strokeWidth="2" strokeDasharray="5,5" markerEnd="url(#arrow)" />

                {/* Analytics -> Design (Updates) */}
                <path d="M 75% 25% Q 50% 10% 25% 25%" stroke="purple" strokeWidth="1" strokeDasharray="2,2" />

                {/* Operations <-> Twin */}
                <path d="M 50% 55% L 50% 75%" stroke="cyan" strokeWidth="1" />
            </svg>

            {/* Nodes */}
            {nodes.map(node => (
                <motion.button
                    key={node.id}
                    className={`
                        absolute transform -translate-x-1/2 -translate-y-1/2
                        w-48 p-4 rounded-xl border backdrop-blur-md
                        flex flex-col gap-2 items-center text-center
                        hover:scale-105 transition-all shadow-lg
                        ${node.color}
                    `}
                    style={{ left: node.x, top: node.y }}
                    onClick={() => navigate(node.path)}
                    whileHover={{ y: -5 }}
                >
                    <div className="p-2 rounded-full bg-slate-950/50 border border-white/10">
                        {node.icon}
                    </div>
                    <div>
                        <div className="font-bold text-slate-200 text-sm">{node.label}</div>
                        <div className="text-[10px] text-slate-400 leading-tight mt-1">{node.description}</div>
                    </div>

                    {/* Action Hint */}
                    <div className="mt-2 text-[9px] font-mono text-cyan-400 opacity-0 group-hover:opacity-100 transition-opacity">
                        Click to Navigate
                    </div>
                </motion.button>
            ))}

            {/* Deep Link Annotations */}
            <div className="absolute top-[35%] left-[30%] text-[10px] text-slate-500 -rotate-45">
                "Go to Operations"
            </div>
            <div className="absolute top-[35%] right-[30%] text-[10px] text-slate-500 rotate-45">
                "Analyze Trend"
            </div>
            <div className="absolute bottom-[35%] left-[50%] -translate-x-1/2 text-[10px] text-slate-500 rotate-90">
                "Live Telemetry"
            </div>
        </div>
    );
};
