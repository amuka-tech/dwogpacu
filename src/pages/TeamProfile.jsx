import React from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Shield, ArrowLeft, MapPin, Calendar, Clock, Trophy, Target, Zap } from 'lucide-react';
import { TEAMS } from '../data/teams';
import { useTournament } from '../context/TournamentContext';
import './TeamProfile.css';

export default function TeamProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const team = TEAMS[id];
  const { fixtures, results, standings } = useTournament();

  if (!team) return <div className="container" style={{padding: '100px 0', textAlign: 'center'}}><h2>Team not found</h2></div>;

  // Find team's matches
  const teamFixtures = fixtures.filter(f => f.homeTeamId === id || f.awayTeamId === id);

  // Find team's standings stats
  let stats = { played: 0, won: 0, drawn: 0, lost: 0, gf: 0, ga: 0, gd: 0, points: 0, form: [] };
  Object.values(standings).forEach(group => {
    const s = group.find(t => t.team.id === id);
    if (s) stats = s;
  });

  const resultsMatches = teamFixtures.filter(f => results[f.id] && (results[f.id].homeScore !== null || results[f.id].isLive));
  const upcomingMatches = teamFixtures.filter(f => !results[f.id] || (results[f.id].homeScore === null && !results[f.id].isLive));

  return (
    <div className="team-profile-page animate-fade-in">
      
      {/* ── HERO SECTION ─────────────────────────── */}
      <section className="tp-hero" style={{ '--team-color': team.color }}>
        <div className="tp-hero-overlay" />
        <div className="container tp-hero-content">
          <Link to="/" className="back-link"><ArrowLeft size={16}/> Back to Home</Link>
          <div className="tp-hero-main">
            <div className="tp-hero-shield">
              <Shield size={120} style={{ color: team.color }} />
            </div>
            <div className="tp-hero-text">
              <div className="tp-hero-badges">
                <span className="badge badge-group">Group {team.group}</span>
                <span className="badge" style={{background: team.color, color: '#fff'}}>{team.shortName}</span>
                {stats.form && stats.form.length > 0 && (
                  <div className="form-guide" style={{ display: 'inline-flex', gap: '4px', marginLeft: '12px', verticalAlign: 'middle' }}>
                    {stats.form.map((f, i) => (
                      <span key={i} className={`form-pill form-${f.toLowerCase()}`} title={`Match ${i+1}: ${f === 'W' ? 'Win' : f === 'D' ? 'Draw' : 'Loss'}`}>
                        {f}
                      </span>
                    ))}
                  </div>
                )}
              </div>
              <h1 className="tp-title">{team.name}</h1>
            </div>
          </div>
        </div>
      </section>

      <div className="container tp-main-content">
        
        {/* ── ABOUT & STATS SECTION ────────────────── */}
        <section className="tp-about-section">
          <div className="tp-about-text">
            <h2 className="section-h2">About Team</h2>
            <p>
              Representing <strong>{team.name}</strong> in the DWOG PACU CUP 2026. 
              The team is drawn from the best local talent across the constituency, bringing passion, high energy, and unwavering determination to the pitch. 
            </p>
            <p>
              As part of <strong>Group {team.group}</strong>, they aim to dominate their fixtures and progress deep into the knockout stages to ultimately claim the coveted title of Champions. "Ateka En Nga?"
            </p>
          </div>
          
          <div className="tp-stats-overview">
            <div className="tp-stat-card">
              <Trophy className="tp-stat-icon" />
              <div className="tp-stat-val">{stats.points}</div>
              <div className="tp-stat-lbl">Points</div>
            </div>
            <div className="tp-stat-card">
              <Target className="tp-stat-icon" />
              <div className="tp-stat-val">{stats.gf} - {stats.ga}</div>
              <div className="tp-stat-lbl">Goals (F - A)</div>
            </div>
            <div className="tp-stat-card">
              <Zap className="tp-stat-icon" />
              <div className="tp-stat-val">{stats.played}</div>
              <div className="tp-stat-lbl">Matches Played</div>
            </div>
            <div className="tp-stat-card">
              <Shield className="tp-stat-icon" />
              <div className="tp-stat-val">{stats.won}</div>
              <div className="tp-stat-lbl">Wins</div>
            </div>
          </div>
        </section>

        {/* ── RESULTS SECTION ──────────────────────── */}
        <section className="tp-results-section">
          <h2 className="section-h2">Results</h2>
          {resultsMatches.length === 0 ? (
            <div className="empty-state">No match results available yet.</div>
          ) : (
            <div className="tp-match-grid">
              {resultsMatches.slice().reverse().map(f => {
                const r = results[f.id];
                const home = TEAMS[f.homeTeamId];
                const away = TEAMS[f.awayTeamId];
                return (
                  <article key={f.id} className="tp-match-card result-card" onClick={() => navigate(`/match/${f.id}`)} style={{cursor: 'pointer'}}>
                    <div className="tp-mc-header">
                      <span className="tp-mc-date"><Calendar size={14}/> {f.isoDate}</span>
                      {r.isLive && <span className="badge badge-live">LIVE</span>}
                    </div>
                    <div className="tp-mc-body">
                      <Link to={`/team/${home?.id}`} className="tp-mc-team home" style={{color: 'inherit', textDecoration: 'none'}} onClick={(e) => e.stopPropagation()}>
                        <Shield size={32} style={{ color: home?.color }} />
                        <span>{home?.shortName}</span>
                      </Link>
                      <div className="tp-mc-score">
                        {r.homeScore} - {r.awayScore}
                      </div>
                      <Link to={`/team/${away?.id}`} className="tp-mc-team away" style={{color: 'inherit', textDecoration: 'none'}} onClick={(e) => e.stopPropagation()}>
                        <span>{away?.shortName}</span>
                        <Shield size={32} style={{ color: away?.color }} />
                      </Link>
                    </div>
                    <div className="tp-mc-footer">
                      <MapPin size={14} /> {f.venue}
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>

        {/* ── FIXTURES SECTION ─────────────────────── */}
        <section className="tp-fixtures-section">
          <h2 className="section-h2">Upcoming Fixtures</h2>
          {upcomingMatches.length === 0 ? (
            <div className="empty-state">No upcoming fixtures scheduled.</div>
          ) : (
            <div className="tp-match-grid">
              {upcomingMatches.map(f => {
                const home = TEAMS[f.homeTeamId];
                const away = TEAMS[f.awayTeamId];
                return (
                  <article key={f.id} className="tp-match-card fixture-card" onClick={() => navigate(`/match/${f.id}`)} style={{cursor: 'pointer'}}>
                    <div className="tp-mc-header">
                      <span className="tp-mc-date"><Calendar size={14}/> {f.isoDate}</span>
                      <span className="badge badge-group">Group {f.group}</span>
                    </div>
                    <div className="tp-mc-body">
                      <Link to={`/team/${home?.id}`} className="tp-mc-team home" style={{color: 'inherit', textDecoration: 'none'}} onClick={(e) => e.stopPropagation()}>
                        <Shield size={32} style={{ color: home?.color }} />
                        <span>{home?.shortName}</span>
                      </Link>
                      <div className="tp-mc-vs">VS</div>
                      <Link to={`/team/${away?.id}`} className="tp-mc-team away" style={{color: 'inherit', textDecoration: 'none'}} onClick={(e) => e.stopPropagation()}>
                        <span>{away?.shortName}</span>
                        <Shield size={32} style={{ color: away?.color }} />
                      </Link>
                    </div>
                    <div className="tp-mc-footer">
                      <span><MapPin size={14} /> {f.venue}</span>
                      <span><Clock size={14} /> {f.time}</span>
                    </div>
                    <Link to={`/match/${f.id}`} className="tp-mc-btn btn" onClick={(e) => e.stopPropagation()}>Match Center <ArrowLeft size={14} style={{transform: 'rotate(180deg)'}}/></Link>
                  </article>
                );
              })}
            </div>
          )}
        </section>

      </div>
    </div>
  );
}
