import React, { useMemo } from 'react';
import { useTournament } from '../context/TournamentContext';
import { TEAMS } from '../data/teams';
import { Trophy, AlertOctagon } from 'lucide-react';
import './Stats.css';

export default function Stats() {
  const { fixtures, results } = useTournament();

  const playerStats = useMemo(() => {
    const stats = {};
    Object.values(results).forEach(r => {
      (r.events || []).forEach(ev => {
        if (!ev.player) return;
        const key = `${ev.player}-${ev.teamId}`;
        if (!stats[key]) {
          stats[key] = {
            name: ev.player,
            teamId: ev.teamId,
            goals: 0,
            yellows: 0,
            reds: 0,
            ownGoals: 0
          };
        }
        if (ev.type === 'goal' || ev.type === 'penalty') stats[key].goals++;
        if (ev.type === 'yellow') stats[key].yellows++;
        if (ev.type === 'red') stats[key].reds++;
        if (ev.type === 'own-goal') stats[key].ownGoals++;
      });
    });
    return Object.values(stats);
  }, [results]);

  const topScorers = [...playerStats].sort((a, b) => b.goals - a.goals).filter(p => p.goals > 0);
  const carded = [...playerStats].sort((a, b) => (b.reds * 3 + b.yellows) - (a.reds * 3 + a.yellows)).filter(p => p.yellows > 0 || p.reds > 0);

  const maxGoals = topScorers.length > 0 ? topScorers[0].goals : 1;
  const maxCardsScore = carded.length > 0 ? (carded[0].reds * 3 + carded[0].yellows) : 1;

  return (
    <div className="stats-page animate-fade-in">
      <div className="container">
        <div className="page-header">
          <span className="badge">Data Hub</span>
          <h1 className="section-heading">Tournament Statistics</h1>
          <p className="section-subheading">Top scorers and disciplinary records across the DWOG PACU CUP 2026.</p>
        </div>

        <div className="stats-grid">
          <div className="stats-panel glass">
            <h2>Golden Boot Race</h2>
            <div className="stats-list">
              <div className="stats-list-header">
                <span>Player</span>
                <span>Team</span>
                <span style={{ textAlign: 'center' }}>Goals</span>
              </div>
              {topScorers.length === 0 ? (
                <div className="empty-state">
                  <Trophy size={48} style={{ opacity: 0.2, marginBottom: '1rem' }} />
                  <p>No goals recorded yet.</p>
                </div>
              ) : (
                topScorers.map((p, i) => (
                  <div key={i} className="stats-row">
                    <div className="stats-row-bg" style={{ width: `${(p.goals / maxGoals) * 100}%` }}></div>
                    <div className="stats-row-content">
                      <span className="p-name">{p.name}</span>
                      <span className="p-team">{TEAMS[p.teamId]?.shortName}</span>
                      <span className="p-val">{p.goals}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="stats-panel glass">
            <h2>Disciplinary Record</h2>
            <div className="stats-list">
              <div className="stats-list-header">
                <span>Player</span>
                <span>Team</span>
                <span style={{ textAlign: 'center' }}>Cards</span>
              </div>
              {carded.length === 0 ? (
                <div className="empty-state">
                  <AlertOctagon size={48} style={{ opacity: 0.2, marginBottom: '1rem' }} />
                  <p>No cards recorded yet.</p>
                </div>
              ) : (
                carded.map((p, i) => {
                  const score = p.reds * 3 + p.yellows;
                  return (
                    <div key={i} className="stats-row">
                      <div className="stats-row-bg card-bg" style={{ width: `${(score / maxCardsScore) * 100}%` }}></div>
                      <div className="stats-row-content">
                        <span className="p-name">{p.name}</span>
                        <span className="p-team">{TEAMS[p.teamId]?.shortName}</span>
                        <span className="p-val cards-val">
                          {p.yellows > 0 && <span className="c-yellow">{p.yellows} Y</span>}
                          {p.reds > 0 && <span className="c-red">{p.reds} R</span>}
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
