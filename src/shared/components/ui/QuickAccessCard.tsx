import React from 'react';
import { motion } from 'framer-motion';
import { ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export interface QuickAccessCardProps {
    id: string;
    title: string;
    description: string;
    icon: React.ReactNode;
    route?: string;
    onClick?: () => void;
    color: string;
    borderColor: string;
    priority: 'critical' | 'high' | 'medium' | 'low';
    disabled?: boolean;
}

export const QuickAccessCard: React.FC<QuickAccessCardProps> = ({ 
    id, 
    title, 
    description, 
    icon, 
    route, 
    onClick, 
    color, 
    borderColor, 
    priority,
    disabled = false 
}) => {
    const navigate = useNavigate();

    const handleClick = () => {
        if (disabled) return;
        if (onClick) {
            onClick();
        } else if (route) {
            navigate(route);
        }
    };

    return (
        <motion.button
            onClick={handleClick}
            whileHover={!disabled ? { scale: 1.02, y: -2 } : {}}
            whileTap={!disabled ? { scale: 0.98 } : {}}
            disabled={disabled}
            className={`relative p-6 rounded-xl border-2 ${borderColor} ${color} bg-slate-900/50 backdrop-blur-sm transition-all duration-300 group hover:shadow-lg ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
            style={{ minHeight: '140px' }}
        >
            <div className="absolute top-3 right-3">
                {priority === 'critical' && !disabled && (
                    <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                )}
            </div>
            <div className="flex flex-col items-center text-center gap-3">
                <div className={`p-3 rounded-lg ${color.replace('bg-', 'bg-opacity-20 ')} ${color.replace('bg-', 'text-')}`}>
                    {icon}
                </div>
                <div>
                    <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-1">{title}</h3>
                    <p className="text-xs text-slate-400 leading-tight">{description}</p>
                </div>
            </div>
            {!disabled && (
                <ChevronRight className={`absolute bottom-3 right-3 w-4 h-4 text-slate-500 group-hover:text-white transition-colors ${color.replace('bg-', 'text-')}`} />
            )}
        </motion.button>
    );
};
