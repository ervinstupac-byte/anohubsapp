import React, { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next'; // NEW
import { motion, AnimatePresence } from 'framer-motion';
import { Info } from 'lucide-react';

interface InfoTooltipProps {
    /** Optional key for docs.json definitions */
    docKey?: string; // NEW
    /** Content to display (overrides docKey) */
    content?: string;
    /** Optional custom icon size */
    size?: number;
    /** Optional custom className */
    className?: string;
}

/**
 * Touch-friendly info tooltip that shows explanatory text.
 * Can fetch content from i18n 'docs' namespace via docKey.
 */
export const InfoTooltip: React.FC<InfoTooltipProps> = React.memo(({
    docKey,
    content: propContent,
    size = 14,
    className = ''
}) => {
    const { t } = useTranslation('docs'); // NEW
    const [isVisible, setIsVisible] = useState(false);
    const [isTouchDevice, setIsTouchDevice] = useState(false);

    // Resolve content: propContent takes precedence, then docKey lookup
    const content = propContent || (docKey ? t(`definitions.${docKey}`) : '');

    // If translation fails (returns key) or empty, hide
    if (!content || content.startsWith('definitions.')) return null;

    const tooltipRef = useRef<HTMLDivElement>(null);
    const triggerRef = useRef<HTMLButtonElement>(null);

    // Detect touch device on mount
    useEffect(() => {
        setIsTouchDevice('ontouchstart' in window || navigator.maxTouchPoints > 0);
    }, []);

    // Close tooltip when clicking outside (for touch devices)
    useEffect(() => {
        if (!isVisible || !isTouchDevice) return;

        const handleClickOutside = (event: MouseEvent | TouchEvent) => {
            if (
                tooltipRef.current &&
                !tooltipRef.current.contains(event.target as Node) &&
                triggerRef.current &&
                !triggerRef.current.contains(event.target as Node)
            ) {
                setIsVisible(false);
            }
        };

        document.addEventListener('touchstart', handleClickOutside);
        document.addEventListener('mousedown', handleClickOutside);

        return () => {
            document.removeEventListener('touchstart', handleClickOutside);
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isVisible, isTouchDevice]);

    const handleInteraction = () => {
        if (isTouchDevice) {
            setIsVisible(!isVisible);
        }
    };

    return (
        <span className={`relative inline-flex items-center ${className}`}>
            <button
                ref={triggerRef}
                type="button"
                className="text-slate-500 hover:text-cyan-400 transition-colors duration-200 focus:outline-none"
                onMouseEnter={() => !isTouchDevice && setIsVisible(true)}
                onMouseLeave={() => !isTouchDevice && setIsVisible(false)}
                onClick={handleInteraction}
                onFocus={() => setIsVisible(true)}
                onBlur={() => !isTouchDevice && setIsVisible(false)}
                aria-label="More information"
            >
                <Info size={size} />
            </button>

            <AnimatePresence>
                {isVisible && (
                    <motion.div
                        ref={tooltipRef}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.15 }}
                        className="absolute z-50 bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 
                                   bg-slate-800/95 backdrop-blur-sm border border-white/10 
                                   rounded-lg shadow-lg text-xs text-slate-300 
                                   whitespace-nowrap max-w-[200px] text-center"
                        style={{ willChange: 'opacity' }}
                    >
                        {content}
                        {/* Arrow */}
                        <div className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 
                                        border-l-4 border-r-4 border-t-4 
                                        border-l-transparent border-r-transparent border-t-slate-800/95" />
                    </motion.div>
                )}
            </AnimatePresence>
        </span>
    );
});

InfoTooltip.displayName = 'InfoTooltip';
