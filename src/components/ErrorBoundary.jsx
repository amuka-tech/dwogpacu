import React from 'react';
import { AlertTriangle, RefreshCcw } from 'lucide-react';
import './ErrorBoundary.css';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('App Crashed:', error, errorInfo);
    this.setState({ errorInfo });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="error-boundary-screen">
          <div className="error-card glass">
            <div className="error-icon">
              <AlertTriangle size={48} />
            </div>
            <h2>System Failure</h2>
            <p className="error-desc">
              The DWOG PACU CUP 2026 application encountered a critical error. 
              Our technical committee has been notified.
            </p>
            <div className="error-actions">
              <button 
                className="btn btn-primary"
                onClick={async () => {
                  if ('serviceWorker' in navigator) {
                    const registrations = await navigator.serviceWorker.getRegistrations();
                    for (let registration of registrations) {
                      await registration.unregister();
                    }
                  }
                  window.location.reload(true);
                }}
              >
                <RefreshCcw size={18} /> Restart Application
              </button>
            </div>
            <pre className="error-details" style={{ marginTop: '1rem', background: '#222', padding: '1rem', borderRadius: '8px', fontSize: '0.8rem', color: '#ff6b6b', whiteSpace: 'pre-wrap', textAlign: 'left', maxHeight: '200px', overflowY: 'auto' }}>
              {this.state.error?.toString()}
              {'\n'}
              {this.state.errorInfo?.componentStack}
            </pre>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
