import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ModernButton } from '../shared/components/ui/ModernButton';
import { Shield, Zap, Activity, Wind, Database } from 'lucide-react';
import { ROUTES } from '../routes/paths';

const SandboxPage: React.FC = () => {
    const navigate = useNavigate();

    const DEMOS = [
        { id: 'chaos', label: 'Chaos Gauntlet', path: '/chaos', icon: <Shield className="w-4 h-4" />, desc: 'Stress test system resilience' },
        { id: 'vibration', label: 'Vibration Audit', path: '/forensics/audio', icon: <Activity className="w-4 h-4" />, desc: 'Frequency spectrum analysis' },
        { id: 'francis', label: 'Francis Hub', path: '/francis/hub', icon: <Zap className="w-4 h-4" />, desc: '3D Digital Twin Interaction' },
        { id: 'turbine', label: 'Turbine Runner', path: '/francis/mechanism-detail', icon: <Wind className="w-4 h-4" />, desc: 'Detailed component view' },
        { id: 'db', label: 'Database Admin', path: '/admin/health', icon: <Database className="w-4 h-4" />, desc: 'System Internals' },
        { id: 'alignment', label: 'Alignment Wizard', path: '/francis/sop-shaft-alignment', icon: <Activity className="w-4 h-4" />, desc: 'Shaft Alignment Tool' },
    ];

    return (
        <div className="min-h-screen bg-slate-950 text-white p-8 font-mono">
            <header className="mb-12 border-b border-slate-800 pb-4">
                <h1 className="text-3xl font-black text-emerald-400 mb-2">SANDBOX // EXPERIMENTAL</h1>
                <p className="text-slate-500 text-sm">Restricted Area. Authorized Personnel Only.</p>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {DEMOS.map(demo => (
                    <div key={demo.id} className="p-6 bg-slate-900 border border-slate-800 rounded-xl hover:border-emerald-500/50 transition-all group">
                        <div className="flex items-center gap-3 mb-4 text-emerald-400">
                            {demo.icon}
                            <span className="font-bold uppercase tracking-wider text-sm">{demo.label}</span>
                        </div>
                        <p className="text-slate-400 text-xs mb-6 h-10">{demo.desc}</p>
                        <ModernButton
                            variant="primary"
                            onClick={() => navigate(demo.path)}
                            className="w-full"
                        >
                            LAUNCH MODULE
                        </ModernButton>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default SandboxPage;
