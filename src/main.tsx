import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

class ErrorBoundary extends React.Component<{children: React.ReactNode}, {hasError: boolean, error: Error | null}> {
  constructor(props: {children: React.ReactNode}) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("CRITICAL APP ERROR:", error, errorInfo);
  }

  handleReset = () => {
    localStorage.clear();
    sessionStorage.clear();
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ 
          padding: '40px 20px', 
          background: '#0f172a', 
          color: 'white', 
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: 'system-ui, sans-serif',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '64px', marginBottom: '20px' }}>⚠️</div>
          <h1 style={{ fontSize: '24px', fontWeight: 800, marginBottom: '16px' }}>Oops! Something went wrong</h1>
          <p style={{ color: '#94a3b8', maxWidth: '400px', marginBottom: '24px', lineHeight: 1.6 }}>
            The application encountered an unexpected error. We've been notified and are working on it.
          </p>
          
          <div style={{ 
            background: 'rgba(255,255,255,0.05)', 
            padding: '16px', 
            borderRadius: '12px', 
            marginBottom: '24px',
            maxWidth: '100%',
            overflowX: 'auto',
            textAlign: 'left',
            border: '1px solid rgba(255,255,255,0.1)'
          }}>
            <p style={{ color: '#ef4444', fontSize: '13px', fontWeight: 700, marginBottom: '8px' }}>Error Details:</p>
            <pre style={{ fontSize: '12px', margin: 0, color: '#f8fafc' }}>
              {this.state.error?.message || 'Unknown error'}
            </pre>
          </div>

          <button 
            onClick={this.handleReset}
            style={{
              background: '#3B82F6',
              color: 'white',
              border: 'none',
              padding: '12px 24px',
              borderRadius: '8px',
              fontWeight: 700,
              cursor: 'pointer',
              boxShadow: '0 4px 15px rgba(59,130,246,0.4)'
            }}
          >
            Restart Application
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

// Catch unhandled promise rejections
window.addEventListener('unhandledrejection', (event) => {
  console.error('Unhandled Promise Rejection:', event.reason);
});

createRoot(document.getElementById("root")!).render(
  <ErrorBoundary>
    <App />
  </ErrorBoundary>
);
