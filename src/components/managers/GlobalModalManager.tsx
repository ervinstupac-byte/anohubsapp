import React, { useState, useEffect, Suspense } from 'react';
import { EVENTS, AssetPassportPayload } from '../../lib/events';
import { SystemOverviewModal } from '../modals/SystemOverviewModal';
import { AssetPassportModal } from '../dashboard/AssetPassportModal';
import { useCerebro } from '../../contexts/ProjectContext';
import { AssetOnboardingWizard } from '../digital-twin/AssetOnboardingWizard';

// Lazy load heavy print modal
const PrintPreviewModal = React.lazy(() => import('../modals/PrintPreviewModal').then(m => ({ default: m.PrintPreviewModal })));

export const GlobalModalManager: React.FC = () => {
    const { state: technicalState } = useCerebro();

    // Modal States
    const [isSystemOverviewOpen, setIsSystemOverviewOpen] = useState(false);
    const [isPreviewOpen, setIsPreviewOpen] = useState(false);
    const [isPassportOpen, setIsPassportOpen] = useState(false);
    const [isWizardOpen, setIsWizardOpen] = useState(false);
    const [passportTarget, setPassportTarget] = useState<AssetPassportPayload | null>(null);
    
    // Reconstruction State (Ghost Protocol)
    const [reconstructing, setReconstructing] = useState(false);
    const [reconstructProgress, setReconstructProgress] = useState<number | null>(null);

    useEffect(() => {
        // Event Handlers
        const handleOpenSystemOverview = () => setIsSystemOverviewOpen(true);
        const handleOpenPreview = () => setIsPreviewOpen(true);
        const handleOpenWizard = () => setIsWizardOpen(true);
        
        const handleOpenPassport = (e: Event) => {
            const customEvent = e as CustomEvent<AssetPassportPayload>;
            if (customEvent.detail) {
                setPassportTarget(customEvent.detail);
            }
            setIsPassportOpen(true);
        };

        const onStart = () => { setReconstructing(true); setReconstructProgress(0); };
        const onProgress = (e: Event) => { 
            const customEvent = e as CustomEvent<{ processed: number }>;
            setReconstructProgress(customEvent.detail?.processed || null); 
        };
        const onComplete = () => { setReconstructing(false); setReconstructProgress(null); };

        // Listeners
        window.addEventListener(EVENTS.OPEN_SYSTEM_OVERVIEW, handleOpenSystemOverview);
        window.addEventListener(EVENTS.TRIGGER_FORENSIC_EXPORT, handleOpenPreview);
        window.addEventListener(EVENTS.OPEN_ASSET_PASSPORT, handleOpenPassport);
        window.addEventListener(EVENTS.OPEN_ASSET_WIZARD, handleOpenWizard);
        
        // Reconstruction Events (Legacy string literals for now, can be typed later)
        window.addEventListener(EVENTS.RECONSTRUCTION_START, onStart as EventListener);
        window.addEventListener(EVENTS.RECONSTRUCTION_PROGRESS, onProgress as EventListener);
        window.addEventListener(EVENTS.RECONSTRUCTION_COMPLETE, onComplete as EventListener);

        return () => {
            window.removeEventListener(EVENTS.OPEN_SYSTEM_OVERVIEW, handleOpenSystemOverview);
            window.removeEventListener(EVENTS.TRIGGER_FORENSIC_EXPORT, handleOpenPreview);
            window.removeEventListener(EVENTS.OPEN_ASSET_PASSPORT, handleOpenPassport);
            window.removeEventListener(EVENTS.OPEN_ASSET_WIZARD, handleOpenWizard);
            window.removeEventListener(EVENTS.RECONSTRUCTION_START, onStart as EventListener);
            window.removeEventListener(EVENTS.RECONSTRUCTION_PROGRESS, onProgress as EventListener);
            window.removeEventListener(EVENTS.RECONSTRUCTION_COMPLETE, onComplete as EventListener);
        };
    }, []);

    return (
        <>
            {/* System Topology */}
            <SystemOverviewModal 
                isOpen={isSystemOverviewOpen} 
                onClose={() => setIsSystemOverviewOpen(false)} 
            />

            {/* Print Preview */}
            <Suspense fallback={<div />}>
                <PrintPreviewModal
                    isOpen={isPreviewOpen}
                    onClose={() => setIsPreviewOpen(false)}
                    state={technicalState}
                />
            </Suspense>

            {/* Asset Passport */}
            {passportTarget && (
                <AssetPassportModal
                    isOpen={isPassportOpen}
                    onClose={() => setIsPassportOpen(false)}
                    componentId={passportTarget.id}
                    componentName={passportTarget.name}
                    componentType={passportTarget.type}
                />
            )}

            {/* Asset Onboarding Wizard */}
            <AssetOnboardingWizard 
                isOpen={isWizardOpen} 
                onClose={() => setIsWizardOpen(false)} 
            />

            {/* Reconstruction Overlay */}
            {reconstructing && (
                <div className="fixed inset-0 z-[120] flex items-center justify-center pointer-events-none">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
                    <div className="relative z-10 p-6 bg-white/6 border border-white/10 rounded-lg text-center max-w-lg">
                        <h3 className="text-lg font-black text-white mb-2">Reconstructing Reality...</h3>
                        <p className="text-sm text-slate-300 mb-3">Replaying historical events to restore the requested snapshot. This may take a few seconds.</p>
                        {reconstructProgress !== null ? (
                            <div className="text-sm text-slate-300">Processed: {reconstructProgress}</div>
                        ) : null}
                    </div>
                </div>
            )}
        </>
    );
};
