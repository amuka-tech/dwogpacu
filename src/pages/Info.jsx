import React from 'react';
import { Users, MapPin, Trophy, ShieldAlert } from 'lucide-react';
import './Info.css';
import aboutImg from '../assets/HLWJfn7WwAErNJZ.jpg'; // Using another image for about section

const Info = () => {
  return (
    <div className="info-page animate-fade-in">
      <div className="container">
        <div className="page-header text-center">
          <span className="badge badge-group">About The Tournament</span>
          <h1 className="section-heading">Tournament Information</h1>
          <p className="section-subheading">Everything you need to know about the DWOG PACU CUP 2026.</p>
        </div>

        <div className="info-grid">
          <div className="info-main">
            <section className="info-section glass">
              <h2 className="info-title"><Trophy className="info-icon" /> Background & Objectives</h2>
              <img src={aboutImg} alt="Tournament Action" className="info-image" />
              <div className="info-text">
                <p>The DWOG PACU CUP 2026 is a premier football tournament designed to foster unity, talent discovery, and community engagement across the constituencies and municipalities of the Lira region.</p>
                <p>Bringing together 21 elite teams divided into 4 competitive groups, this month-long football fiesta promises high-octane action, exceptional sportsmanship, and a celebration of our local heritage through the beautiful game.</p>
              </div>
            </section>

            <section className="info-section glass">
              <h2 className="info-title"><ShieldAlert className="info-icon" /> Tournament Format</h2>
              <div className="format-steps">
                <div className="format-step">
                  <div className="step-number">1</div>
                  <h3>Group Stage</h3>
                  <p>Teams are drawn into 4 groups (A, B, C, D). They play round-robin matches within their groups.</p>
                </div>
                <div className="format-step">
                  <div className="step-number">2</div>
                  <h3>Quarter-Finals</h3>
                  <p>Top two teams from each group advance to the knockout Quarter-finals stage.</p>
                </div>
                <div className="format-step">
                  <div className="step-number">3</div>
                  <h3>Semi-Finals</h3>
                  <p>Winners of the Quarter-finals battle in two-legged Semi-final matches to secure a spot in the final.</p>
                </div>
                <div className="format-step">
                  <div className="step-number">4</div>
                  <h3>The Final</h3>
                  <p>The grand finale on August 2nd, 2026, to crown the champions of the DWOG PACU CUP!</p>
                </div>
              </div>
            </section>
          </div>

          <div className="info-sidebar">
            <div className="sidebar-card glass">
              <h3 className="sidebar-title"><Users className="sidebar-icon" /> Organizing Committee</h3>
              <ul className="committee-list">
                <li>
                  <strong>Chairperson (Technical)</strong>
                  <span>Bongo Patrick</span>
                </li>
                <li>
                  <strong>Tournament Director</strong>
                  <span>To be announced</span>
                </li>
                <li>
                  <strong>Media & Communications</strong>
                  <span>To be announced</span>
                </li>
              </ul>
            </div>

            <div className="sidebar-card glass">
              <h3 className="sidebar-title"><MapPin className="sidebar-icon" /> Venues</h3>
              <div className="venue-card">
                <h4>UTC Lira</h4>
                <p className="venue-type">Primary Venue</p>
                <p className="venue-desc">Hosting the opening ceremony, majority of group matches, and the grand final.</p>
              </div>
              <div className="venue-card">
                <h4>LTC</h4>
                <p className="venue-type">Secondary Venue</p>
                <p className="venue-desc">Hosting select group stage matches and training sessions.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Info;
