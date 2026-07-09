import React from 'react';
import { useRegisterSW } from 'virtual:pwa-register/react';
import { RefreshCw, X } from 'lucide-react';
import './UpdatePrompt.css';

export default function UpdatePrompt() {
  const {
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegistered(r) {
      // Registration handled by vite-plugin-pwa
    },
    onRegisterError(error) {
      console.error('SW registration error', error);
    },
  });

  const close = () => {
    setNeedRefresh(false);
  };

  if (!needRefresh) return null;

  return (
    <div className="update-prompt-container animate-slide-up">
      <div className="update-prompt-card glass">
        <div className="update-prompt-content">
          <div className="update-prompt-icon">
            <RefreshCw size={24} className="spin-slow" />
          </div>
          <div className="update-prompt-text">
            <h4>Update Available!</h4>
            <p>A new version of DWOG PACU CUP is ready.</p>
          </div>
        </div>
        <div className="update-prompt-actions">
          <button className="btn btn-primary" onClick={() => updateServiceWorker(true)}>
            Reload to Update
          </button>
          <button className="btn-close" onClick={close} aria-label="Close">
            <X size={20} />
          </button>
        </div>
      </div>
    </div>
  );
}
