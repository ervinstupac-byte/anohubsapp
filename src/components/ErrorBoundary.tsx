import { Component, ErrorInfo, ReactNode } from 'react';
import { GlassCard } from './ui/GlassCard';
import { ModernButton } from './ui/ModernButton';

interface Props {
    children: ReactNode;
    fallback?: ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
    public state: State = {
        hasError: false,
        error: null
    };

    public static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error('Uncaught error:', error, errorInfo);
    }

    private handleReset = () => {
        this.setState({ hasError: false, error: null });
        window.location.reload();
    };

    public render() {
        if (this.state.hasError) {
            return this.props.fallback || (
                <div className="min-h-[400px] flex items-center justify-center p-6 text-center">
                    <GlassCard className="max-w-md border-red-500/30">
                        <div className="text-5xl mb-6">🛰️</div>
                        <h2 className="text-2xl font-black text-white mb-2 uppercase tracking-tighter">Connection Lost</h2>
                        <p className="text-slate-400 mb-8 text-sm leading-relaxed">
                            Something went wrong in this sector. Our engineers have been notified.
                            Please try refreshing the interface.
                        </p>
                        <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3 mb-6 text-left">
                            <p className="text-[10px] font-mono text-red-400 break-all">
                                {this.state.error?.message || 'Unknown Protocol Error'}
                            </p>
                        </div>
                        <ModernButton onClick={this.handleReset} variant="secondary" fullWidth icon={<span>🔄</span>}>
                            Re-establish Link
                        </ModernButton>
                    </GlassCard>
                </div>
            );
        }

        return this.props.children;
    }
}
