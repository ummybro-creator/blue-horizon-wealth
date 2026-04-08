import { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('[ErrorBoundary] Caught error:', error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div
          style={{
            minHeight: '100vh',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            background: '#F4F6F8',
            fontFamily: 'Inter, sans-serif',
            padding: '24px',
            textAlign: 'center',
          }}
        >
          <div
            style={{
              background: '#fff',
              borderRadius: 20,
              padding: '32px 28px',
              boxShadow: '0 4px 24px rgba(0,0,0,0.08)',
              maxWidth: 340,
              width: '100%',
            }}
          >
            <p style={{ fontSize: 40, marginBottom: 12 }}>⚠️</p>
            <h2 style={{ color: '#111827', fontWeight: 800, fontSize: 18, marginBottom: 8 }}>
              Something went wrong
            </h2>
            <p style={{ color: '#6B7280', fontSize: 13, marginBottom: 20 }}>
              The app encountered an unexpected error. Please refresh the page.
            </p>
            <button
              onClick={() => window.location.reload()}
              style={{
                background: 'linear-gradient(135deg, #D9040A, #B50309)',
                color: '#fff',
                border: 'none',
                borderRadius: 14,
                padding: '12px 28px',
                fontWeight: 700,
                fontSize: 14,
                cursor: 'pointer',
                width: '100%',
              }}
            >
              Refresh Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
