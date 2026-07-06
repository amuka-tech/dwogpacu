import { useState, useEffect } from 'react'
import './InstallPrompt.css'

export default function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState(null)
  const [showInstall, setShowInstall] = useState(false)

  useEffect(() => {
    // Check if user already dismissed it
    const hasDismissed = localStorage.getItem('pwa_prompt_dismissed');
    
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault()
      setDeferredPrompt(e)
      if (!hasDismissed) {
        setShowInstall(true)
      }
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)

    // Check if already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setShowInstall(false)
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    }
  }, [])

  const handleInstallClick = async () => {
    if (!deferredPrompt) return

    deferredPrompt.prompt()
    const { outcome } = await deferredPrompt.userChoice
    
    if (outcome === 'accepted') {
      setShowInstall(false)
      localStorage.setItem('pwa_prompt_dismissed', 'true');
    }
    
    setDeferredPrompt(null)
  }

  const handleDismiss = () => {
    setShowInstall(false)
    localStorage.setItem('pwa_prompt_dismissed', 'true');
  }

  if (!showInstall) return null

  return (
    <div className="install-prompt">
      <div className="install-prompt-content">
        <div className="install-icon">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
          </svg>
        </div>
        <div className="install-text">
          <h3>Install DWOG PACU CUP</h3>
          <p>Get live scores and instant notifications natively!</p>
        </div>
        <div className="install-actions">
          <button className="install-btn" onClick={handleInstallClick}>
            Install App
          </button>
          <button className="dismiss-btn" onClick={handleDismiss}>
            Not now
          </button>
        </div>
      </div>
    </div>
  )
}
