import React from 'react';
import { Info } from 'lucide-react';
import { GLOSSARY, GlossaryEntry } from '../../data/GlossaryDefinitions';
import { useTelemetryStore } from '../../features/telemetry/store/useTelemetryStore';
import { motion, AnimatePresence } from 'framer-motion';

interface SmartTooltipProps {
    term: string;
    children?: React.ReactNode;
}

export const SmartTooltip: React.FC<SmartTooltipProps> = ({ term, children }) => {
    const entry: GlossaryEntry | undefined = GLOSSARY[term];
    const { educationMode } = useTelemetryStore();
    const [isHovered, setIsHovered] = React.useState(false);

    if (!entry) {
        return <>{children || term}</>;
    }

    return (
        <div 
            className="inline-flex items-center gap-1 relative cursor-help group"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            <span className={`${educationMode ? 'underline decoration-dotted decoration-sky-500/50' : ''}`}>
                {children || term}
            </span>
            
            {/* Always show icon in Education Mode, or on hover if normal */}
            {(educationMode || isHovered) && (
                <Info className={`w-3 h-3 ${educationMode ? 'text-sky-400' : 'text-slate-600 group-hover:text-sky-500'} transition-colors`} />
            )}

            <AnimatePresence>
                {isHovered && (
                    <motion.div 
                        initial={{ opacity: 0, y: 5, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ duration: 0.15 }}
                        className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 p-3 bg-slate-900/95 backdrop-blur-md border border-sky-500/30 rounded-none shadow-none z-50 text-left pointer-events-none"
                    >
                        <div className="flex items-center gap-2 mb-1 pb-1 border-b border-white/10">
                            <span className="font-bold text-sky-400 text-xs uppercase tracking-wider">{term}</span>
                            <span className="text-[10px] text-slate-500 px-1.5 py-0.5 bg-slate-800 rounded-none border border-slate-700">NC-11400</span>
                        </div>
                        
                        <p className="text-xs text-slate-300 leading-relaxed">
                            {entry.definition}
                        </p>

                        {entry.codeRef && educationMode && (
                            <div className="mt-2 text-[10px] font-mono text-slate-500 bg-black/30 p-1.5 rounded-none border border-white/5 truncate">
                                ↳ {entry.codeRef.path.split('/').pop()}
                            </div>
                        )}

                        <div className="absolute bottom-[-4px] left-1/2 -translate-x-1/2 w-2 h-2 bg-slate-900 border-r border-b border-sky-500/30 rotate-45"></div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};
