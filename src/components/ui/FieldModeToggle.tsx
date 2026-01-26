import React from 'react';
import { Sun, Moon, Eye } from 'lucide-react';
import { useTheme } from '../../stores/useTheme';

/**
 * FIELD MODE TOGGLE (NC-9.0)
 * 
 * High-Contrast/Low-Light toggle for turbine halls.
 * Strips all ambient glows and orbs for maximum readability.
 */
export const FieldModeToggle: React.FC<{ className?: string }> = ({ className = '' }) => {
    const { mode, toggleFieldMode } = useTheme();
    const isFieldMode = mode === 'field-contrast';

    return (
        <button
            onClick={toggleFieldMode}
            className={`
                relative flex items-center gap-2 px-3 py-1.5 rounded border transition-all
                ${isFieldMode
                    ? 'bg-white text-black border-white font-black'
                    : 'bg-slate-900/80 text-slate-400 border-cyan-900/40 hover:border-cyan-500/50 hover:text-cyan-400'
                }
                ${className}
            `}
            title={isFieldMode ? 'Switch to Standard Mode' : 'Switch to Field Mode (High Contrast)'}
        >
            {isFieldMode ? (
                <>
                    <Eye className="w-3.5 h-3.5" />
                    <span className="text-[9px] font-mono font-black uppercase tracking-widest">
                        FIELD
                    </span>
                </>
            ) : (
                <>
                    <Sun className="w-3.5 h-3.5" />
                    <span className="text-[9px] font-mono font-bold uppercase tracking-wider">
                        STD
                    </span>
                </>
            )}
        </button>
    );
};

/**
 * THEME INDICATOR
 * Shows current theme mode with visual feedback
 */
export const ThemeIndicator: React.FC = () => {
    const { mode, setMode } = useTheme();

    const modes = [
        { id: 'tactical-cyan', label: 'CYAN', color: 'bg-cyan-500' },
        { id: 'tactical-red', label: 'RED', color: 'bg-red-500' },
        { id: 'field-contrast', label: 'FIELD', color: 'bg-white' }
    ] as const;

    return (
        <div className="flex items-center gap-1">
            {modes.map((m) => (
                <button
                    key={m.id}
                    onClick={() => setMode(m.id)}
                    className={`
                        w-6 h-6 rounded flex items-center justify-center transition-all
                        ${mode === m.id
                            ? `${m.color} ${m.id === 'field-contrast' ? 'text-black' : 'text-white'} ring-2 ring-offset-2 ring-offset-slate-950`
                            : 'bg-slate-800 text-slate-500 hover:bg-slate-700'
                        }
                    `}
                    title={`${m.label} Mode`}
                >
                    <span className="text-[8px] font-bold">{m.label.charAt(0)}</span>
                </button>
            ))}
        </div>
    );
};
