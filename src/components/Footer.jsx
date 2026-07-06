import React from 'react';
import { Mail } from 'lucide-react';
import './Footer.css';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="container footer-container">
        <div className="footer-grid">
          <div className="footer-col">
            <h3>DWOG PACU CUP 2026</h3>
            <p className="footer-desc">The premier football tournament featuring constituencies and municipalities from the Lira region. Join us for a month of thrilling football action.</p>
            <div className="social-links">
              <a href="#" className="social-link">Fb</a>
              <a href="#" className="social-link">Tw</a>
              <a href="#" className="social-link">Ig</a>
            </div>
          </div>
          
          <div className="footer-col">
            <h4>Quick Links</h4>
            <ul className="footer-links">
              <li><a href="/fixtures">Fixtures & Results</a></li>
              <li><a href="/standings">Group Standings</a></li>
              <li><a href="/groups">Teams & Groups</a></li>
              <li><a href="/info">Tournament Rules</a></li>
            </ul>
          </div>
          
          <div className="footer-col">
            <h4>Contact Us</h4>
            <ul className="footer-contact">
              <li><Mail size={16} /> info@dwogpacucup.com</li>
              <li>Organizing Committee</li>
              <li>UTC Lira, Uganda</li>
            </ul>
          </div>
        </div>
        
        <div className="footer-bottom">
          <p>&copy; 2026 DWOG PACU CUP. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
