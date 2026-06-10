import React, { Suspense, lazy, useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useQuestionnaire } from '../contexts/QuestionnaireContext.tsx';
import { AlarmBar } from './diagnostics/AlarmBar.tsx';
import { useDiagnostic } from '../contexts/DiagnosticContext.tsx';
import { useAssetContext } from '../contexts/AssetContext';
import { useTelemetry } from '../contexts/TelemetryContext';
import idAdapter from '../utils/idAdapter';
import { ModernButton } from '../shared/components/ui/ModernButton';
import { motion } from 'framer-motion';
import { Target, Settings, Zap, Shield, BookOpen, Activity, AlertTriangle, Map, ChevronRight, Gauge, FileText, Cpu, Wrench, TrendingUp, Clock, Users, Database, Power, Thermometer, AlertCircle, CheckCircle, Calculator } from 'lucide-react';

// --- PERFORMANCE: CODE SPLITTING ---
const GlobalMap = lazy(() => import('./GlobalMap.tsx').then(m => ({ default: m.GlobalMap })));
const NeuralFlowMap = lazy(() => import('./diagnostics/NeuralFlowMap.tsx').then(m => ({ default: m.NeuralFlowMap })));
const IncidentSimulator = lazy(() => import('./IncidentSimulator.tsx').then(m => ({ default: m.IncidentSimulator })));

// --- QUICK ACCESS CARD COMPONENT ---
interface QuickAccessCard {
    id: string;
    title: string;
    description: string;
    icon: React.ReactNode;
    route: string;
    color: string;
    borderColor: string;
    priority: 'critical' | 'high' | 'medium' | 'low';
}

const QuickAccessCard: React.FC<{ card: QuickAccessCard; onClick: () => void }> = ({ card, onClick }) => (
    <motion.button
        onClick={onClick}
        whileHover={{ scale: 1.02, y: -2 }}
        whileTap={{ scale: 0.98 }}
        className={`relative p-6 rounded-xl border-2 ${card.borderColor} ${card.color} bg-slate-900/50 backdrop-blur-sm transition-all duration-300 group hover:shadow-lg`}
        style={{ minHeight: '140px' }}
    >
        <div className="absolute top-3 right-3">
            {card.priority === 'critical' && (
                <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
            )}
        </div>
        <div className="flex flex-col items-center text-center gap-3">
            <div className={`p-3 rounded-lg ${card.color.replace('bg-', 'bg-opacity-20 ')} ${card.color.replace('bg-', 'text-')}`}>
                {card.icon}
            </div>
            <div>
                <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-1">{card.title}</h3>
                <p className="text-xs text-slate-400 leading-tight">{card.description}</p>
            </div>
        </div>
        <ChevronRight className={`absolute bottom-3 right-3 w-4 h-4 text-slate-500 group-hover:text-white transition-colors ${card.color.replace('bg-', 'text-')}`} />
    </motion.button>
);

export const Hub: React.FC = () => {
    const { answers } = useQuestionnaire();
    const location = useLocation();
    const navigate = useNavigate();
    const showMap = location.pathname === '/map';
    const { activeDiagnoses } = useDiagnostic();
    const criticalDiagnosis = activeDiagnoses.find(d => d.diagnosis?.severity === 'CRITICAL');
    const { selectedAsset } = useAssetContext();
    const { telemetry, shutdownExcitation } = useTelemetry();
    const [systemStatus, setSystemStatus] = useState<'operational' | 'warning' | 'critical'>('operational');
    const [activeAlerts, setActiveAlerts] = useState(0);

    // Calculate system status based on telemetry
    useEffect(() => {
        if (!selectedAsset || !telemetry) return;
        
        const storageKey = `asset_${selectedAsset.id}`;
        const assetTelemetry = telemetry[storageKey];
        
        if (assetTelemetry) {
            const alerts = [];
            let status: 'operational' | 'warning' | 'critical' = 'operational';
            
            // Check critical thresholds
            if (assetTelemetry.vibration > 0.05) {
                alerts.push('High vibration');
                status = 'critical';
            }
            if (assetTelemetry.temperature > 75) {
                alerts.push('High temperature');
                status = status === 'critical' ? 'critical' : 'warning';
            }
            if (assetTelemetry.cavitationIntensity > 5) {
                alerts.push('Severe cavitation');
                status = 'critical';
            }
            if (assetTelemetry.bearingGrindIndex > 3) {
                alerts.push('Bearing wear detected');
                status = status === 'critical' ? 'critical' : 'warning';
            }
            
            setSystemStatus(status);
            setActiveAlerts(alerts.length);
        }
    }, [selectedAsset, telemetry]);

    // --- QUICK ACCESS CARDS ---
    const quickAccessCards: QuickAccessCard[] = [
        // CRITICAL PRIORITY
        {
            id: 'diagnostic-twin',
            title: 'Diagnostic Twin',
            description: 'AI-powered analysis',
            icon: <Activity className="w-6 h-6" />,
            route: '/diagnostic-twin',
            color: 'bg-red-500/10',
            borderColor: 'border-red-500/30',
            priority: 'critical'
        },
        {
            id: 'live-monitoring',
            title: 'Live Monitoring',
            description: 'Real-time telemetry',
            icon: <Gauge className="w-6 h-6" />,
            route: '/executive',
            color: 'bg-red-500/10',
            borderColor: 'border-red-500/30',
            priority: 'critical'
        },
        // HIGH PRIORITY
        {
            id: 'francis-hub',
            title: 'Francis Hub',
            description: 'Turbine operations',
            icon: <Gauge className="w-6 h-6" />,
            route: '/turbines/francis',
            color: 'bg-amber-500/10',
            borderColor: 'border-amber-500/30',
            priority: 'high'
        },
        {
            id: 'maintenance',
            title: 'Maintenance Engine',
            description: 'Service scheduling',
            icon: <Wrench className="w-6 h-6" />,
            route: '/maintenance/dashboard',
            color: 'bg-amber-500/10',
            borderColor: 'border-amber-500/30',
            priority: 'high'
        },
        // MEDIUM PRIORITY
        {
            id: 'mechanical',
            title: 'Mechanical Systems',
            description: 'Shaft, bolts, hydraulics',
            icon: <Settings className="w-6 h-6" />,
            route: '/maintenance/hydraulic',
            color: 'bg-cyan-500/10',
            borderColor: 'border-cyan-500/30',
            priority: 'medium'
        },
        {
            id: 'electrical',
            title: 'Electrical Systems',
            description: 'Grid sync, generator',
            icon: <Zap className="w-6 h-6" />,
            route: '/executive',
            color: 'bg-cyan-500/10',
            borderColor: 'border-cyan-500/30',
            priority: 'medium'
        },
        {
            id: 'risk',
            title: 'Risk Assessment',
            description: 'Structural integrity',
            icon: <Shield className="w-6 h-6" />,
            route: '/risk-assessment',
            color: 'bg-purple-500/10',
            borderColor: 'border-purple-500/30',
            priority: 'medium'
        },
        {
            id: 'predictive-intelligence',
            title: 'Predictive Intelligence',
            description: '38 advanced analytics labs',
            icon: <Calculator className="w-6 h-6" />,
            route: '/predictive-intelligence',
            color: 'bg-cyan-500/10',
            borderColor: 'border-cyan-500/30',
            priority: 'medium'
        },
        {
            id: 'forensics',
            title: 'Forensic Analysis',
            description: 'Incident investigation',
            icon: <FileText className="w-6 h-6" />,
            route: '/forensics',
            color: 'bg-purple-500/10',
            borderColor: 'border-purple-500/30',
            priority: 'medium'
        },
        // LOW PRIORITY
        {
            id: 'prediction-lab',
            title: 'Prediction Lab',
            description: 'Theoretical testing',
            icon: <Calculator className="w-6 h-6" />,
            route: '/prediction-lab',
            color: 'bg-slate-500/10',
            borderColor: 'border-slate-500/30',
            priority: 'low'
        },
        {
            id: 'vibration-lab',
            title: 'Vibration Lab',
            description: 'Vibration analysis',
            icon: <Activity className="w-6 h-6" />,
            route: '/vibration-lab',
            color: 'bg-slate-500/10',
            borderColor: 'border-slate-500/30',
            priority: 'low'
        },
        {
            id: 'hpp-builder',
            title: 'HPP Studio',
            description: 'Design & simulation',
            icon: <Cpu className="w-6 h-6" />,
            route: '/francis/designer',
            color: 'bg-slate-500/10',
            borderColor: 'border-slate-500/30',
            priority: 'low'
        },
        {
            id: 'fleet',
            title: 'Fleet Overview',
            description: 'Multi-asset view',
            icon: <Map className="w-6 h-6" />,
            route: '/map',
            color: 'bg-slate-500/10',
            borderColor: 'border-slate-500/30',
            priority: 'low'
        },
        {
            id: 'analytics',
            title: 'Performance Analytics',
            description: 'Trends & insights',
            icon: <TrendingUp className="w-6 h-6" />,
            route: '/executive',
            color: 'bg-slate-500/10',
            borderColor: 'border-slate-500/30',
            priority: 'low'
        }
    ];

    // Sort cards by priority
    const sortedCards = quickAccessCards.sort((a, b) => {
        const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
        return priorityOrder[a.priority] - priorityOrder[b.priority];
    });

    const handleCardClick = (route: string) => {
        navigate(route);
    };

    return (
        <div className="w-full h-full flex flex-col relative overflow-hidden bg-slate-950">
            {/* EMERGENCY SHUTDOWN HUD - High z-index to prevent overlap */}
            {criticalDiagnosis && (
                <div className="absolute top-0 left-0 w-full z-[200] animate-pulse bg-red-600/20 border-b border-red-500/50 backdrop-blur-xl p-4 flex flex-col items-center">
                    <div className="flex items-center gap-4 mb-3">
                        <span className="text-red-500 text-2xl animate-ping">⚠️</span>
                        <h2 className="text-xl font-black text-white uppercase tracking-tighter">CRITICAL RISK DETECTED: {criticalDiagnosis.diagnosis?.diagnosis}</h2>
                    </div>
                    <div className="flex gap-4 flex-wrap justify-center">
                        {[
                            '1. INITIATE EMERGENCY SHUTDOWN',
                            '2. ENGAGE MECHANICAL BRAKES',
                            '3. ISOLATE HYDRAULIC POWER UNIT'
                        ].map((step, i) => (
                            <div key={i} className="px-4 py-2 bg-black/60 border border-red-500/30 rounded-lg text-[10px] font-bold text-red-400 uppercase">
                                {step}
                            </div>
                        ))}
                    </div>
                            <ModernButton
                        variant="primary"
                        className="mt-4 bg-red-600 hover:bg-red-700 h-10 border-none shadow-[0_0_30px_rgba(220,38,38,0.4)]"
                        onClick={() => {
                            // Trigger emergency shutdown via telemetry context
                            if (selectedAsset) {
                                        const numeric = idAdapter.toNumber((selectedAsset as any).id);
                                        if (numeric === null) {
                                            console.warn('[Hub] shutdownExcitation: selectedAsset.id is non-numeric', selectedAsset.id);
                                            return;
                                        }
                                        shutdownExcitation(numeric);
                            }
                        }}
                    >
                        EXECUTE TOTAL SHUTDOWN
                    </ModernButton>
                </div>
            )}

            {/* Simulation Overlay - Lazy Loaded - z-index below emergency HUD */}
            <Suspense fallback={null}>
                <IncidentSimulator />
            </Suspense>

            {/* MAIN CONTENT AREA */}
            <div className="flex-1 flex flex-col overflow-hidden relative z-10">
                {/* TOP SECTION: Quick Access Cards - Proper spacing to prevent overlap */}
                <div className="p-6 pb-4">
                    {/* System Status Banner */}
                    <div className={`mb-4 p-4 rounded-xl border-2 flex items-center justify-between ${
                        systemStatus === 'critical' ? 'bg-red-500/10 border-red-500/30' :
                        systemStatus === 'warning' ? 'bg-amber-500/10 border-amber-500/30' :
                        'bg-emerald-500/10 border-emerald-500/30'
                    }`}>
                        <div className="flex items-center gap-3">
                            {systemStatus === 'critical' ? <AlertCircle className="w-5 h-5 text-red-500" /> :
                             systemStatus === 'warning' ? <AlertTriangle className="w-5 h-5 text-amber-500" /> :
                             <CheckCircle className="w-5 h-5 text-emerald-500" />}
                            <div>
                                <div className={`text-xs font-bold uppercase tracking-wider ${
                                    systemStatus === 'critical' ? 'text-red-500' :
                                    systemStatus === 'warning' ? 'text-amber-500' :
                                    'text-emerald-500'
                                }`}>
                                    System Status: {systemStatus.toUpperCase()}
                                </div>
                                {activeAlerts > 0 && (
                                    <div className="text-[10px] text-slate-400">
                                        {activeAlerts} active alert{activeAlerts > 1 ? 's' : ''}
                                    </div>
                                )}
                            </div>
                        </div>
                        {selectedAsset && (
                            <div className="text-right">
                                <div className="text-[10px] text-slate-500 uppercase tracking-wider">Active Asset</div>
                                <div className="text-sm font-bold text-white">{selectedAsset.name}</div>
                            </div>
                        )}
                    </div>

                    <div className="mb-4">
                        <h1 className="text-2xl font-black text-white uppercase tracking-widest mb-1">Command Center</h1>
                        <p className="text-sm text-slate-400">Quick access to all modules</p>
                    </div>
                    
                    {/* Grid layout with proper gap to prevent overlap */}
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
                        {sortedCards.map((card) => (
                            <QuickAccessCard
                                key={card.id}
                                card={card}
                                onClick={() => handleCardClick(card.route)}
                            />
                        ))}
                    </div>
                </div>

                {/* BOTTOM SECTION: Map/Visualization - Flexible height */}
                <div className="flex-1 min-h-0 p-6 pt-2">
                    <div className="h-full rounded-xl border border-white/10 overflow-hidden bg-slate-900/50 backdrop-blur-sm">
                        <Suspense fallback={
                            <div className="w-full h-full flex items-center justify-center bg-slate-950">
                                <div className="flex flex-col items-center gap-4">
                                    <div className="w-12 h-12 border-4 border-cyan-500/20 border-t-cyan-500 rounded-full animate-spin"></div>
                                    <p className="text-cyan-500 font-mono text-[10px] uppercase tracking-widest animate-pulse">Initializing Neural Link...</p>
                                </div>
                            </div>
                        }>
                            {showMap ? <GlobalMap /> : <NeuralFlowMap />}
                        </Suspense>
                    </div>
                </div>
            </div>

            {/* BOTTOM: Alarm Bar - Fixed at bottom with proper z-index */}
            <div className="relative z-30">
                <AlarmBar answers={answers} />
            </div>
        </div>
    );
};
