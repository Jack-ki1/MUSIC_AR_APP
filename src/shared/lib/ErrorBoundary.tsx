import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Card } from '../ui/Card';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('[ErrorBoundary]', error, info.componentStack);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback ?? (
        <Card padding="lg">
          <h2 className="text-lg font-semibold mb-2">Something went wrong</h2>
          <p className="text-sm text-purple-500">Please refresh the page or contact support.</p>
          {this.state.error && (
            <pre className="mt-3 text-xs font-mono bg-purple-100 p-3 rounded-sm overflow-auto">
              {this.state.error.message}
            </pre>
          )}
        </Card>
      );
    }
    return this.props.children;
  }
}
