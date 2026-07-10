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

  const [isReloading, setIsReloading] = React.useState(false);

  const close = () => {
    setNeedRefresh(false);
  };

  if (!needRefresh) return null;

  const handleUpdate = () => {
    setIsReloading(true);
    updateServiceWorker(true);
    // Fallback: forcefully reload if the SW doesn't reload the page within 2 seconds
    setTimeout(() => {
      window.location.reload();
    }, 2000);
  };

  return (
    <div className="update-prompt-container animate-slide-up">
      <div className="update-prompt-card glass">
        <div className="update-prompt-content">
          <div className="update-prompt-icon">
            <RefreshCw size={24} className={isReloading ? "spin-fast" : "spin-slow"} />
          </div>
          <div className="update-prompt-text">
            <h4>Update Available!</h4>
            <p>A new version of DWOG PACU CUP is ready.</p>
          </div>
        </div>
        <div className="update-prompt-actions">
          <button className="btn btn-primary" onClick={handleUpdate} disabled={isReloading}>
            {isReloading ? 'Reloading...' : 'Reload to Update'}
          </button>
          <button className="btn-close" onClick={close} aria-label="Close" disabled={isReloading}>
            <X size={20} />
          </button>
        </div>
      </div>
    </div>
  );
}
