import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = { hasError: false, error: null };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Centralized logging for uncaught React errors
    // Keep this minimal and synchronous to avoid additional failures
    // Monitoring integrations can be added here.
    // eslint-disable-next-line no-console
    console.error('Uncaught error captured by ErrorBoundary:', error, errorInfo);
  }

  private handleReload = () => {
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;

      return (
        <div className="min-h-screen flex items-center justify-center bg-[#071018] text-white p-6">
          <div className="max-w-2xl text-center bg-[#071823] border border-red-700/30 rounded p-6">
            <h1 className="text-2xl font-black mb-3">Application Error</h1>
            <p className="mb-4">An unrecoverable error occurred. The UI has been isolated to prevent further failures.</p>
            <div className="text-xs text-left bg-black/40 p-3 rounded text-red-300 overflow-auto mb-4">{String(this.state.error?.message || this.state.error)}</div>
            <div className="mt-4">
              <button onClick={this.handleReload} className="px-4 py-2 bg-red-600 rounded font-bold">Reload</button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
