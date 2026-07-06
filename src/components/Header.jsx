import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, Trophy, Lock } from 'lucide-react';
import { useTournament } from '../context/TournamentContext';
import './Header.css';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();
  const { liveMatches, isAdmin } = useTournament();

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Groups', path: '/groups' },
    { name: 'Fixtures & Results', path: '/fixtures' },
    { name: 'Standings', path: '/standings' },
    { name: 'Knockouts', path: '/knockouts' },
    { name: 'Stats', path: '/stats' },
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
              <li key={link.name} className="nav-item">
                <Link 
                  to={link.path} 
                  className={`nav-link ${location.pathname === link.path ? 'active' : ''}`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  {link.name}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <div className="header-right">
          <Link to="/admin" className={`admin-link ${isAdmin ? 'admin-active' : ''}`} title="Admin Panel">
            <Lock size={18} />
          </Link>
          <button className="mobile-menu-btn" onClick={() => setIsMenuOpen(!isMenuOpen)}>
            {isMenuOpen ? <X size={28} color="#fff" /> : <Menu size={28} color="#fff" />}
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
