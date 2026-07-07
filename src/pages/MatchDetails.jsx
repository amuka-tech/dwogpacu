import React, { useState, useMemo } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Shield, ArrowLeft, Clock, MapPin, Calendar } from 'lucide-react';
import { useTournament } from '../context/TournamentContext';
import { TEAMS } from '../data/teams';
import { getTeamForm } from '../utils/tournamentEngine';
import './MatchDetails.css';

export default function MatchDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { fixtures, results } = useTournament();

  const fixture = fixtures.find(f => f.id === id);
  const result = results[id] || { homeScore: null, awayScore: null, events: [], isLive: false };

  if (!fixture) {
    return (
      <div className="container" style={{ padding: '100px 0', textAlign: 'center' }}>
        <h2>Match not found</h2>
        <Link to="/" className="btn mt-2">Return Home</Link>
      </div>
    );
  }

  const home = TEAMS[fixture.homeTeamId];
  const away = TEAMS[fixture.awayTeamId];

  const homeForm = useMemo(() => home ? getTeamForm(home.id, fixtures, results) : [], [home, fixtures, results]);
  const awayForm = useMemo(() => away ? getTeamForm(away.id, fixtures, results) : [], [away, fixtures, results]);

  const [activeTab, setActiveTab] = useState('events');
  const events = [...(result.events || [])].sort((a, b) => a.minute - b.minute);
  
  const homeFormation = result.homeFormation || '';
  const awayFormation = result.awayFormation || '';
  const homeLineup = result.homeLineup || [];
  const awayLineup = result.awayLineup || [];

  const getEventIcon = (type) => {
    if (type === 'goal' || type === 'penalty' || type === 'own-goal') return '⚽';
    if (type === 'yellow') return <span className="card-icon yellow"></span>;
    if (type === 'red') return <span className="card-icon red"></span>;
    return '•';
  };

  const getEventLabel = (type) => {
    if (type === 'penalty') return '(PEN)';
    if (type === 'own-goal') return '(OG)';
    return '';
  };

  return (
    <div className="match-details-page animate-fade-in">
      
      {/* ── SCOREBOARD HEADER ─────────────────────── */}
      <section className="md-scoreboard">
        <div className="md-overlay"></div>
        <div className="container md-scoreboard-inner">
          <button onClick={() => navigate(-1)} className="back-link md-back btn-clear">
            <ArrowLeft size={16}/> Back
          </button>
          
          <div className="md-meta">
            <span className="badge badge-group">{fixture.group ? `Group ${fixture.group}` : fixture.stage}</span>
            <span className="md-date"><Calendar size={14}/> {fixture.isoDate}</span>
            <span className="md-venue"><MapPin size={14}/> {fixture.venue}</span>
          </div>

          <div className="md-teams">
            {/* HOME TEAM */}
            <div className="md-team home">
              <Shield size={100} style={{ color: home?.color }} className="md-team-logo" />
              <Link to={`/team/${home?.id}`} className="md-team-name">{home?.name}</Link>
              {homeForm.length > 0 && (
                <div className="form-guide" style={{ display: 'flex', gap: '4px', justifyContent: 'center', marginTop: '0.5rem' }}>
                  {homeForm.map((f, i) => <span key={i} className={`form-pill form-${f.toLowerCase()}`}>{f}</span>)}
                </div>
              )}
            </div>

            {/* SCORE */}
            <div className="md-center">
              {result.isLive && (
                <div className="md-live-badge">
                  <span className="live-dot" /> LIVE {result.liveMinute ? <span style={{ color: '#fff', marginLeft: '4px' }}>| {result.liveMinute}</span> : ''}
                </div>
              )}
              {result.homeScore !== null ? (
                <div className="md-score">
                  <span>{result.homeScore}</span>
                  <span className="md-dash">-</span>
                  <span>{result.awayScore}</span>
                </div>
              ) : (
                <div className="md-time">
                  <Clock size={20}/> {fixture.time}
                </div>
              )}
              {result.homeScore !== null && !result.isLive && (
                <div className="md-ft">FULL TIME</div>
              )}
            </div>

            {/* AWAY TEAM */}
            <div className="md-team away">
              <Shield size={100} style={{ color: away?.color }} className="md-team-logo" />
              <Link to={`/team/${away?.id}`} className="md-team-name">{away?.name}</Link>
              {awayForm.length > 0 && (
                <div className="form-guide" style={{ display: 'flex', gap: '4px', justifyContent: 'center', marginTop: '0.5rem' }}>
                  {awayForm.map((f, i) => <span key={i} className={`form-pill form-${f.toLowerCase()}`}>{f}</span>)}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      <div className="container md-content">
        
        {/* ── TIMELINE ──────────────────────────────── */}
        <section className="md-section">
          <h2 className="section-h2 text-center">Match Events</h2>
          {events.length === 0 ? (
            <div className="empty-state">No events recorded for this match yet.</div>
          ) : (
            <div className="md-timeline">
              <div className="md-timeline-line"></div>
              {events.map((ev, i) => {
                const isHome = ev.teamId === fixture.homeTeamId;
                return (
                  <div key={i} className={`md-event ${isHome ? 'home-event' : 'away-event'}`}>
                    <div className="md-event-content">
                      <span className="md-event-player">{ev.player} {getEventLabel(ev.type)}</span>
                      <span className="md-event-icon">{getEventIcon(ev.type)}</span>
                    </div>
                    <div className="md-event-minute">{ev.minute}'</div>
                    <div className="md-event-content empty"></div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* ── LINEUPS ───────────────────────── */}
        {(homeLineup.length > 0 || awayLineup.length > 0) && (
          <section className="md-section">
            <h2 className="section-h2 text-center">Starting Lineups</h2>
            <div className="md-lineups">
              <div className="md-lineup glass" style={{borderTopColor: home?.color}}>
                <h3 className="md-lineup-title">{home?.shortName}</h3>
                {homeFormation && <div className="md-formation">{homeFormation}</div>}
                <ul className="md-players">
                  {homeLineup.map((player, i) => (
                    <li key={i}>
                      <span className="md-shirt-num">{i === 0 ? 1 : i+2}</span>
                      <span className="md-dummy-player">{player}</span>
                    </li>
                  ))}
                </ul>
              </div>
              
              <div className="md-lineup glass" style={{borderTopColor: away?.color}}>
                <h3 className="md-lineup-title">{away?.shortName}</h3>
                {awayFormation && <div className="md-formation">{awayFormation}</div>}
                <ul className="md-players away-players">
                  {awayLineup.map((player, i) => (
                    <li key={i}>
                      <span className="md-shirt-num">{i === 0 ? 1 : i+2}</span>
                      <span className="md-dummy-player">{player}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </section>
        )}

      </div>
    </div>
  );
}
