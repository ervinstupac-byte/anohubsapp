import React, { useState } from 'react';
import { Microscope, Activity, Clock } from 'lucide-react';
import { VisionAnalyzer } from './VisionAnalyzer';
import { AudioSpectrogram } from './AudioSpectrogram';
import { PostMortemMonitor } from './PostMortemMonitor';
import { useTranslation } from 'react-i18next';

export const ForensicDashboard: React.FC = () => {
    const { t } = useTranslation();

    return (
        <div className="min-h-screen bg-[#050505] text-slate-200 p-8 font-sans">
            <header className="mb-8 border-b border-white/10 pb-6 flex justify-between items-end">
                <div>
                    <h1 className="text-3xl font-black text-white uppercase tracking-tighter mb-2 flex items-center gap-3">
                        <div className="bg-[#2dd4bf] text-black p-2 rounded-lg">
                            <Microscope className="w-8 h-8" />
                        </div>
                        {t('forensics.title', 'Diagnostic Forensics')}
                    </h1>
                    <p className="text-xs font-mono text-slate-500 uppercase tracking-widest pl-1">
                        {t('forensics.subtitle', 'Field Analysis Unit • Machine Health • Root Cause')}
                    </p>
                </div>
            </header>

            <div className="grid grid-cols-12 gap-8">

                {/* Visual Forensics */}
                <div className="col-span-8 h-[400px]">
                    <VisionAnalyzer />
                </div>

                {/* Audio Forensics */}
                <div className="col-span-4 h-[400px]">
                    <AudioSpectrogram />
                </div>

                {/* Post-Mortem (Bottom Full Width) */}
                <div className="col-span-12">
                    <PostMortemMonitor />
                </div>

            </div>
        </div>
    );
};
