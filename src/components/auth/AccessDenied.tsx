import React from 'react';
import { ShieldAlert, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { ModernButton } from '../../shared/components/ui/ModernButton';

export const AccessDenied: React.FC = () => {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#05070a] p-4">
            <div className="max-w-md w-full bg-slate-900/50 border border-red-500/20 rounded-2xl p-8 text-center shadow-[0_0_50px_rgba(239,68,68,0.1)] relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-red-500"></div>

                <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
                    <ShieldAlert className="w-10 h-10 text-red-500" />
                </div>

                <h1 className="text-2xl font-black text-white uppercase tracking-wider mb-2">Access Denied</h1>
                <p className="text-slate-400 text-sm mb-8 leading-relaxed">
                    Your current persona does not have clearance for this operational zone.
                    Please contact a System Administrator or switch to a verified command profile.
                </p>

                <ModernButton
                    onClick={() => navigate('/')}
                    variant="primary"
                    icon={<ArrowLeft className="w-4 h-4" />}
                    className="w-full justify-center"
                >
                    Return to Mission Hub
                </ModernButton>
            </div>
        </div>
    );
};
