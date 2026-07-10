import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, Trophy, Lock, Sun, Moon, Bell } from 'lucide-react';
import { useTournament } from '../context/TournamentContext';
import './Header.css';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'dark');
  const location = useLocation();
  const { liveMatches, isAdmin, subscribeToPushNotifications } = useTournament();

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Teams', path: '/groups' },
    { name: 'Fixtures & Results', path: '/fixtures' },
    { name: 'Standings', path: '/standings' },
    { name: 'Knockouts', path: '/knockouts' },
    { 
      name: 'Stats', 
      path: '/stats',
      subLinks: [
        { name: '🎯 Predictions', path: '/predictions' },
        { name: '💰 Prize Money', path: '/prizes' }
      ]
    },
    { name: 'Info', path: '/info' },
  ];

  return (
    <header className="header glass">
      <div className="container header-container">
        <Link to="/" className="logo">
          <img src={`${import.meta.env.BASE_URL}favicon.svg`} alt="DWOG PACU Logo" className="logo-icon" style={{ height: '36px', width: 'auto' }} />
          <span className="logo-text">DWOG PACU <span className="text-gradient">CUP</span></span>
          {liveMatches.length > 0 && (
            <span className="header-live-badge">● {liveMatches.length} Live</span>
          )}
        </Link>
        
        <nav className={`nav-menu ${isMenuOpen ? 'open' : ''}`}>
          <ul className="nav-list">
            {navLinks.map((link) => (
              <li key={link.name} className={`nav-item ${link.subLinks ? 'has-dropdown' : ''}`}>
                <Link 
                  to={link.path} 
                  className={`nav-link ${location.pathname === link.path ? 'active' : ''}`}
                  onClick={() => setIsMenuOpen(false)}
                  style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}
                >
                  {link.name}
                  {link.subLinks && (
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" style={{ marginTop: '2px' }}>
                      <polyline points="6 9 12 15 18 9"></polyline>
                    </svg>
                  )}
                </Link>
                {link.subLinks && (
                  <div className="nav-dropdown">
                    {link.subLinks.map(sub => (
                      <Link 
                        key={sub.name}
                        to={sub.path}
                        className={`dropdown-link ${location.pathname === sub.path ? 'active' : ''}`}
                        onClick={() => setIsMenuOpen(false)}
                      >
                        {sub.name}
                      </Link>
                    ))}
                  </div>
                )}
              </li>
            ))}
          </ul>
        </nav>
        <div className="header-right">
          <button className="theme-toggle" onClick={subscribeToPushNotifications} title="Enable Live Notifications" style={{ background: 'transparent', border: 'none', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', padding: '0.5rem', borderRadius: '50%', transition: 'background 0.2s' }}>
            <Bell size={18} />
          </button>
          <button className="theme-toggle" onClick={toggleTheme} title="Toggle Theme" style={{ background: 'transparent', border: 'none', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', padding: '0.5rem', borderRadius: '50%', transition: 'background 0.2s' }}>
            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
          </button>
          <Link to="/admin" className={`admin-link ${isAdmin ? 'admin-active' : ''}`} title="Admin Panel">
            <Lock size={18} />
          </Link>
          <button className="mobile-menu-btn" onClick={() => setIsMenuOpen(!isMenuOpen)}>
            {isMenuOpen ? <X size={28} color="currentColor" /> : <Menu size={28} color="currentColor" />}
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
