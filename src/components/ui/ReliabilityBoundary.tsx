import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Activity } from 'lucide-react';

interface Props {
    children: ReactNode;
    componentName?: string;
    fallback?: ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
}

/**
 * RELIABILITY BOUNDARY (The Fortress)
 * 
 * Wraps critical industrial components. If a component crashes (e.g., bad sensor data),
 * this boundary catches the error and displays a "Degraded Mode" UI instead of 
 * crashing the entire dashboard.
 */
export class ReliabilityBoundary extends Component<Props, State> {
    public state: State = {
        hasError: false,
        error: null
    };

    public static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error(`[ReliabilityBoundary] Failure in <${this.props.componentName || 'UnknownComponent'}>:`, error, errorInfo);
        // In a real app, log to Sentry/Datadog here
    }

    private handleRetry = () => {
        this.setState({ hasError: false, error: null });
    };

    public render() {
        if (this.state.hasError) {
            if (this.props.fallback) {
                return this.props.fallback;
            }

            return (
                <div className="w-full h-full min-h-[100px] flex flex-col items-center justify-center p-4 bg-slate-950 border border-amber-900/30 rounded-lg relative overflow-hidden group">
                    {/* Background Pattern */}
                    <div className="absolute inset-0 opacity-10 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-amber-900 to-transparent pointer-events-none" />

                    <div className="z-10 flex flex-col items-center text-center">
                        <div className="p-3 bg-amber-900/10 rounded-full border border-amber-500/20 mb-3 animate-pulse">
                            <AlertTriangle className="w-6 h-6 text-amber-500" />
                        </div>

                        <h3 className="text-xs font-black text-amber-500 uppercase tracking-widest mb-1">
                            Component Degraded
                        </h3>

                        <p className="text-[10px] font-mono text-slate-500 mb-4 max-w-[200px]">
                            {this.props.componentName ? `<${this.props.componentName}/>` : 'Module'} encountered a runtime exception. Signal lost.
                        </p>

                        <button
                            onClick={this.handleRetry}
                            className="flex items-center gap-2 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 border border-white/5 hover:border-amber-500/30 rounded text-[10px] font-bold text-slate-300 hover:text-amber-400 uppercase tracking-wider transition-all"
                        >
                            <RefreshCw className="w-3 h-3" />
                            Attempt Reset
                        </button>
                    </div>

                    <div className="absolute bottom-1 right-2 text-[8px] font-mono text-red-900/40">
                        ERR_0x{Math.floor(Math.random() * 1000).toString(16).toUpperCase()}
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}
