import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

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
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error caught by ErrorBoundary:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }
      return (
        <div className="min-h-[400px] flex items-center justify-center p-6" role="alert">
          <div className="bg-white border border-red-100 rounded-3xl p-8 max-w-md w-full shadow-luxury text-center space-y-4">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-red-50 text-red-600 flex items-center justify-center">
              <AlertTriangle className="w-8 h-8" />
            </div>
            <h2 className="text-xl font-bold font-serif text-slate-900">Application Notice</h2>
            <p className="text-sm text-slate-500">
              An unexpected display error occurred. Please try reloading this section.
            </p>
            <button
              onClick={() => this.setState({ hasError: false, error: null })}
              className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-purple-600 text-white font-medium hover:bg-purple-700 transition shadow-md shadow-purple-600/20 focus:outline-none focus:ring-2 focus:ring-purple-600"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Reload Section</span>
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
