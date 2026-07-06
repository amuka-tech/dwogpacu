import React from 'react';
import { useTournament } from '../context/TournamentContext';
import './MatchCenter.css';

export default function MatchCenter() {
  const { fixtures, results } = useTournament();

  return (
    <div className="match-center-page animate-fade-in">
      <div className="container">
        <h1 className="section-heading">Match Center</h1>
        <p className="section-subheading">Live dashboards and commentary.</p>
        <div className="glass empty-state">
          Coming Soon (Phase 2)
        </div>
      </div>
    </div>
  );
}
