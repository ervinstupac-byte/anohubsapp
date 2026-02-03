import React, { useState } from 'react';
import { useAssetContext } from '../../contexts/AssetContext';
import { useAuth } from '../../contexts/AuthContext';
import { Settings, CheckCircle, AlertTriangle, Activity } from 'lucide-react';
import { TurbineType } from '../../types/assetIdentity';

// Pre-defined "Born Perfect" constants for each type
const TURBINE_CONSTANTS = {
    PELTON: {
        type: 'PELTON',
        specs: {
            ratedHeadM: 450,
            ratedFlowM3S: 4.5,
            ratedSpeedRPM: 600,
            numberOfNozzles: 6
        }
    },
    FRANCIS: {
        type: 'FRANCIS',
        specs: {
            ratedHeadM: 85,
            ratedFlowM3S: 16.5,
            ratedSpeedRPM: 375,
            numberOfGuidVanes: 20
        }
    },
    KAPLAN: {
        type: 'KAPLAN',
        specs: {
            ratedHeadM: 25,
            ratedFlowM3S: 45.0,
            ratedSpeedRPM: 125,
            numberOfBlades: 5
        }
    }
};

export const AssetTypeSelector: React.FC = () => {
    const { selectedAsset, addAsset, selectAsset } = useAssetContext();
    const { user } = useAuth();
    const [isOpen, setIsOpen] = useState(false);
    const [isSwitching, setIsSwitching] = useState(false);

    // Only authorized engineers/admins can switch core types
    // But for demo, we allow anyone

    const currentType = selectedAsset?.turbine_type || selectedAsset?.type || 'FRANCIS';

    const handleSwitch = async (type: TurbineType) => {
        if (isSwitching) return;
        setIsSwitching(true);

        try {
            console.log(`[AssetTypeSelector] Switching to ${type}...`);

            // In a real app, we would patch the existing asset.
            // For this rigorous demo, we prefer creating a fresh 'Perfect' asset of that type
            // to ensure the DNA is clean.

            const config = TURBINE_CONSTANTS[type as keyof typeof TURBINE_CONSTANTS];

            // Event Feed Integration (Task 3)
            // Log high-authority kernel messages
            // We use a custom event that SystemAuditLog might listen to, OR direct audit log
            // Assuming generic logAction for now, but formatted as requested.

            // Dispatch legacy event for UI components that might listen
            window.dispatchEvent(new CustomEvent('SYSTEM_KERNEL_LOG', {
                detail: {
                    level: 'CRITICAL',
                    source: 'KERNEL',
                    message: `Switched to ${type} Logic Gates`
                }
            }));
            window.dispatchEvent(new CustomEvent('SYSTEM_KERNEL_LOG', {
                detail: {
                    level: 'INFO',
                    source: 'PHYSICS',
                    message: `Adjusting Efficiency Constants for ${type} Config`
                }
            }));

            await addAsset({
                name: `${type.charAt(0) + type.slice(1).toLowerCase()} Demo Unit`,
                type: 'HPP',
                location: 'Virtual Test Bench',
                coordinates: [44.0, 15.0],
                capacity: type === 'PELTON' ? 8.5 : type === 'KAPLAN' ? 15.0 : 12.5,
                status: 'Operational',
                turbine_type: type,
                specs: {
                    turbineProfile: {
                        type: type,
                        ...config.specs
                    }
                }
            });

            // The addAsset function handles selection and logging

        } catch (error) {
            console.error('Failed to switch turbine type:', error);
        } finally {
            setTimeout(() => {
                setIsSwitching(false);
                setIsOpen(false);
            }, 800);
        }
    };

    return (
        <div className="fixed left-0 top-1/2 -translate-y-1/2 z-50">
            {/* Trigger Tab */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`flex items-center gap-2 pl-1 pr-3 py-3 bg-slate-900/90 border-y border-r border-cyan-500/50 rounded-r-xl shadow-xl backdrop-blur-md transition-all duration-300 hover:pl-2 ${isOpen ? 'translate-x-0' : '-translate-x-[calc(100%-10px)] hover:translate-x-[calc(100%-15px)]'}`}
            >
                <div className="h-24 w-1 bg-cyan-500 rounded-full" />
                <div className="vertical-text flex flex-col items-center gap-4 py-2">
                    <Settings className={`w-5 h-5 text-cyan-400 ${isOpen ? 'rotate-90' : ''} transition-transform duration-500`} />
                    {isOpen && (
                        <div className="flex flex-col gap-3 animate-fade-in">
                            {(Object.keys(TURBINE_CONSTANTS) as TurbineType[]).map((type) => {
                                const isActive = currentType.toUpperCase() === type;
                                return (
                                    <div
                                        key={type}
                                        onClick={(e) => { e.stopPropagation(); handleSwitch(type); }}
                                        className={`group relative w-10 h-10 flex items-center justify-center rounded-lg border transition-all cursor-pointer
                                            ${isActive
                                                ? 'bg-cyan-500/20 border-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.3)]'
                                                : 'bg-slate-800/50 border-slate-700 hover:border-cyan-500/50 hover:bg-slate-700'
                                            }
                                            ${isSwitching ? 'opacity-50 cursor-wait' : ''}
                                        `}
                                        title={`Switch to ${type}`}
                                    >
                                        <span className={`text-[10px] font-black uppercase tracking-wider ${isActive ? 'text-cyan-300' : 'text-slate-400'}`}>
                                            {type.slice(0, 1)}
                                        </span>

                                        {/* Tooltip */}
                                        <div className="absolute left-full ml-3 px-2 py-1 bg-black/90 border border-slate-700 rounded text-[10px] text-white whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
                                            Switch to {type}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </button>

            {/* Status Indicator */}
            {isSwitching && (
                <div className="absolute left-16 top-1/2 -translate-y-1/2 bg-black/80 text-cyan-400 text-xs px-3 py-1 rounded-full border border-cyan-500/30 flex items-center gap-2 animate-pulse whitespace-nowrap">
                    <Activity className="w-3 h-3 animate-spin" />
                    Reconfiguring DNA...
                </div>
            )}
        </div>
    );
};
