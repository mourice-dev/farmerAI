import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface Props {
  children: ReactNode;
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
    console.error('[FarmerAI] Uncaught error caught by ErrorBoundary:', error, errorInfo);
  }

  private handleReload = () => {
    window.location.reload();
  };

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
          background: '#0d0d0d',
          color: '#ffffff',
          fontFamily: 'var(--font-sans, system-ui, sans-serif)',
          padding: '24px',
          textAlign: 'center'
        }}>
          <div style={{
            maxWidth: '520px',
            background: '#171717',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '16px',
            padding: '32px',
            boxShadow: '0 20px 40px rgba(0,0,0,0.5)'
          }}>
            <div style={{
              width: '48px',
              height: '48px',
              borderRadius: '50%',
              background: 'rgba(239, 68, 68, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px auto',
              color: '#ef4444'
            }}>
              <AlertTriangle size={24} />
            </div>

            <h2 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '8px' }}>
              Something went wrong
            </h2>
            <p style={{ fontSize: '0.875rem', color: '#a3a3a3', marginBottom: '20px', lineHeight: 1.5 }}>
              An unexpected error occurred in FarmerAI. Your plant diagnosis data is safe.
            </p>

            {this.state.error?.message && (
              <div style={{
                background: '#000000',
                borderRadius: '8px',
                padding: '12px',
                fontSize: '0.75rem',
                color: '#ef4444',
                fontFamily: 'monospace',
                textAlign: 'left',
                marginBottom: '20px',
                overflowX: 'auto',
                border: '1px solid rgba(239, 68, 68, 0.2)'
              }}>
                {this.state.error.message}
              </div>
            )}

            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
              <button
                onClick={this.handleReset}
                style={{
                  background: 'transparent',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  color: '#ffffff',
                  padding: '10px 18px',
                  borderRadius: '8px',
                  fontSize: '0.875rem',
                  cursor: 'pointer',
                  fontWeight: 500
                }}
              >
                Try Again
              </button>
              <button
                onClick={this.handleReload}
                style={{
                  background: '#ffffff',
                  border: 'none',
                  color: '#000000',
                  padding: '10px 18px',
                  borderRadius: '8px',
                  fontSize: '0.875rem',
                  cursor: 'pointer',
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <RefreshCw size={14} />
                Reload Application
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
