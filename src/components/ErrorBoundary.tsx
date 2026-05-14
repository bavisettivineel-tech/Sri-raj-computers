import React from 'react';

interface Props {
  children: React.ReactNode;
  name: string;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class SectionErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error(`Error in section [${this.props.name}]:`, error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ 
          padding: '24px', 
          margin: '16px',
          background: 'rgba(239, 68, 68, 0.05)', 
          border: '1px solid rgba(239, 68, 68, 0.2)', 
          borderRadius: '16px',
          textAlign: 'center'
        }}>
          <p style={{ color: '#ef4444', fontSize: '14px', fontWeight: 700, marginBottom: '8px' }}>
            Section "{this.props.name}" failed to load
          </p>
          <button 
            onClick={() => this.setState({ hasError: false, error: null })}
            style={{ 
              background: 'rgba(239, 68, 68, 0.1)', 
              border: 'none', 
              color: '#ef4444', 
              padding: '6px 12px', 
              borderRadius: '6px', 
              fontSize: '12px', 
              fontWeight: 600, 
              cursor: 'pointer' 
            }}
          >
            Retry Section
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
