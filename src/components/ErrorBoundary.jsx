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
                onClick={() => window.location.reload()}
              >
                <RefreshCcw size={18} /> Restart Application
              </button>
            </div>
            {process.env.NODE_ENV === 'development' && (
              <pre className="error-details">
                {this.state.error?.toString()}
              </pre>
            )}
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
