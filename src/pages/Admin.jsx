import React, { useState, useMemo } from 'react';
import toast from 'react-hot-toast';
import { useTournament } from '../context/TournamentContext';
import { TEAMS } from '../data/teams';
import { SQUADS } from '../data/squads';
import { Lock, LogOut, Shield, Save, Plus, Trash2, CheckCircle, Clock, AlertCircle, Users, RotateCcw } from 'lucide-react';
import './Admin.css';

// ── Login Screen ──────────────────────────────────────────────
function LoginScreen({ onLogin }) {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [shaking, setShaking] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const success = await onLogin(password);
    if (success) {
      setError('');
    } else {
      setError('Incorrect password. Contact the Technical Committee.');
      setShaking(true);
      setTimeout(() => setShaking(false), 600);
    }
  };

  return (
    <div className="admin-login-wrap animate-fade-in">
      <div className={`admin-login-card glass ${shaking ? 'shake' : ''}`}>
        <div className="login-icon">
          <Lock size={32} />
        </div>
        <h2>Admin Access</h2>
        <p className="login-sub">DWOG PACU CUP 2026 · Score Entry Panel</p>
        <form onSubmit={handleSubmit} className="login-form">
          <input
            id="admin-password-input"
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            placeholder="Enter admin password"
            className="admin-input"
            autoFocus
          />
          {error && (
            <div className="login-error">
              <AlertCircle size={16} /> {error}
            </div>
          )}
          <button type="submit" className="btn btn-primary admin-login-btn">
            <Lock size={18} /> Sign In
          </button>
        </form>
        <p className="login-hint">Authorised DWOG PACU Technical Committee members only.</p>
      </div>
    </div>
  );
}

// ── Match Score Entry ─────────────────────────────────────────
function MatchScoreEntry({ fixture, result, onSave, onSetLive, onAddEvent, onRemoveEvent, onUpdateLineups, onReset }) {
  const home = TEAMS[fixture.homeTeamId];
  const away = TEAMS[fixture.awayTeamId];

  const [hs, setHs] = useState(result?.homeScore ?? '');
  const [as, setAs] = useState(result?.awayScore ?? '');
  const [liveMin, setLiveMin] = useState(result?.liveMinute ?? '');
  const [saved, setSaved] = useState(false);
  const [showEvents, setShowEvents] = useState(false);
  const [eventTeam, setEventTeam] = useState(fixture.homeTeamId || '');
  const [eventType, setEventType] = useState('goal');
  const [eventMin, setEventMin] = useState('');
  const [eventPlayer, setEventPlayer] = useState('');

  const [showLineups, setShowLineups] = useState(false);
  const [homeFormation, setHomeFormation] = useState(result?.homeFormation || '4-3-3');
  const [awayFormation, setAwayFormation] = useState(result?.awayFormation || '4-2-3-1');
  const [homeLineupText, setHomeLineupText] = useState((result?.homeLineup || []).join('\n'));
  const [awayLineupText, setAwayLineupText] = useState((result?.awayLineup || []).join('\n'));

  // Sync state with backend props if they arrive late
  React.useEffect(() => {
    setHs(result?.homeScore ?? '');
    setAs(result?.awayScore ?? '');
    setLiveMin(result?.liveMinute ?? '');
    setHomeFormation(result?.homeFormation || '4-3-3');
    setAwayFormation(result?.awayFormation || '4-2-3-1');
    setHomeLineupText((result?.homeLineup || []).join('\n'));
    setAwayLineupText((result?.awayLineup || []).join('\n'));
  }, [result]);

  const handleSave = () => {
    const h = hs === '' ? 0 : Number(hs);
    const a = as === '' ? 0 : Number(as);
    onSave(fixture.id, h, a);
    toast.success('Match Score Saved!');
    setHs(h);
    setAs(a);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleLive = () => {
    const h = hs === '' ? 0 : Number(hs);
    const a = as === '' ? 0 : Number(as);
    
    // Always set to live when this button is clicked
    onSetLive(fixture.id, h, a, liveMin, true);
    toast.success('Live match updated!');
    
    setHs(h);
    setAs(a);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleRemoveLive = () => {
    const h = hs === '' ? 0 : Number(hs);
    const a = as === '' ? 0 : Number(as);
    
    onSetLive(fixture.id, h, a, liveMin, false);
    toast.success('Live status removed.');
    
    setHs(h);
    setAs(a);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleReset = () => {
    if (window.confirm('Are you sure you want to completely reset this match to Upcoming? This will clear scores and live status.')) {
      onReset(fixture.id);
      setHs('');
      setAs('');
      setLiveMin('');
      toast.success('Match reset to Upcoming.');
    }
  };

  const handleAddEvent = (e) => {
    e.preventDefault();
    if (!eventTeam || !eventMin || !eventPlayer) return;
    const event = {
      id: Date.now().toString(),
      teamId: eventTeam,
      type: eventType,
      minute: eventMin,
      player: eventPlayer
    };
    onAddEvent(fixture.id, event);
    toast.success('Match Event Added!');
    setEventMin('');
    setEventPlayer('');
  };

  const handleSaveLineups = () => {
    const hl = homeLineupText.split('\n').map(s => s.trim()).filter(Boolean);
    const al = awayLineupText.split('\n').map(s => s.trim()).filter(Boolean);
    onUpdateLineups(fixture.id, homeFormation, awayFormation, hl, al);
    toast.success('Lineups Successfully Saved!');
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const events = result?.events || [];
  const selectedEventTeam = TEAMS[eventTeam];
  const squadPlayers = selectedEventTeam && SQUADS[selectedEventTeam.name] ? SQUADS[selectedEventTeam.name].players : [];
  const datalistId = `squad-list-${fixture.id}`;

  return (
    <div className="se-row glass">
      <div className="se-match-info">
        <span className="se-num">
          #{fixture.matchNo}
          {result?.isLive && <span className="live-indicator-pulse">LIVE</span>}
        </span>
        <span className="se-group">{fixture.group ? `Grp ${fixture.group}` : fixture.day}</span>
        <span className="se-date">{fixture.date} · {fixture.time}</span>
      </div>

      {fixture.homeTeamId ? (
        <div className="se-body">
          <div className="se-team">
            <Shield size={18} style={{ color: home?.color }} />
            <span>{home?.shortName}</span>
          </div>
          <div className="se-controls">
            <input
              type="number"
              min="0"
              max="99"
              value={hs}
              onChange={e => setHs(e.target.value)}
              className="score-input"
              placeholder="0"
            />
            <span className="se-dash">–</span>
            <input
              type="number"
              min="0"
              max="99"
              value={as}
              onChange={e => setAs(e.target.value)}
              className="score-input"
              placeholder="0"
            />
          </div>
          <div className="se-team right">
            <span>{away?.shortName}</span>
            <Shield size={18} style={{ color: away?.color }} />
          </div>
        </div>
      ) : (
        <div className="se-knockout">
          <span className="ko-label">{fixture.label}</span>
        </div>
      )}

      <div className="se-actions-container">
        <div className="se-actions primary">
          <div className="live-min-wrapper">
            <input
              type="text"
              value={liveMin}
              onChange={e => setLiveMin(e.target.value)}
              placeholder="Min/Period"
              className="min-input"
            />
            <div className="quick-periods">
              <button className="qp-btn" onClick={() => setLiveMin('1st Half')} title="First Half">1H</button>
              <button className="qp-btn" onClick={() => setLiveMin('Half Time')} title="Half Time">HT</button>
              <button className="qp-btn" onClick={() => setLiveMin('2nd Half')} title="Second Half">2H</button>
            </div>
          </div>
          <button
            className={`btn btn-live ${saved ? 'btn-saved' : ''}`}
            onClick={handleLive}
            disabled={!fixture.homeTeamId}
            title={result?.isLive ? "Update Live Score/Minute" : "Mark as Live"}
            style={result?.isLive ? { background: 'var(--accent-tertiary)', color: '#fff', borderColor: 'var(--accent-tertiary)' } : {}}
          >
            <Clock size={16} /> {result?.isLive ? 'Update Live' : 'Live'}
          </button>
          {result?.isLive && (
            <button
              className="btn btn-live"
              onClick={handleRemoveLive}
              title="Remove Live Status"
              style={{ background: '#333', color: '#fff', borderColor: '#333' }}
            >
              End Live
            </button>
          )}
          <button
            className={`btn btn-save ${saved ? 'btn-saved' : ''}`}
            onClick={handleSave}
            disabled={!fixture.homeTeamId}
          >
            {saved ? <><CheckCircle size={16} /> Saved!</> : <><Save size={16} /> Full Time</>}
          </button>
          {(result?.homeScore !== null || result?.isLive) && (
            <button
              className="btn"
              onClick={handleReset}
              title="Reset to Upcoming"
              style={{ background: 'transparent', color: 'var(--text-muted)', border: '1px solid var(--border-color)', padding: '0.5rem' }}
            >
              <RotateCcw size={16} /> <span className="mobile-text">Reset</span>
            </button>
          )}
        </div>

        {fixture.homeTeamId && (
          <div className="se-actions secondary">
            <button
              className="btn btn-secondary"
              onClick={() => { setShowEvents(!showEvents); setShowLineups(false); }}
              title="Match Events"
            >
              <Plus size={16} /> Events ({events.length})
            </button>
            <button
              className="btn btn-secondary"
              onClick={() => { setShowLineups(!showLineups); setShowEvents(false); }}
              title="Starting Lineups"
            >
              <Users size={16} /> Lineups
            </button>
          </div>
        )}
      </div>

      {/* Events Panel */}
      {showEvents && fixture.homeTeamId && (
        <div className="se-events-panel">
          <div className="se-events-list">
            {events.length === 0 ? (
              <div className="no-events">No events recorded.</div>
            ) : (
              events.map(ev => {
                const team = TEAMS[ev.teamId];
                return (
                  <div key={ev.id} className="se-event-item glass">
                    <span className="ev-min">{ev.minute}'</span>
                    <span className="ev-type badge-type" data-type={ev.type}>{ev.type}</span>
                    <span className="ev-player">{ev.player}</span>
                    <span className="ev-team">({team?.shortName})</span>
                    <button className="ev-del" onClick={() => onRemoveEvent(fixture.id, ev.id)}><Trash2 size={14} /></button>
                  </div>
                );
              })
            )}
          </div>
          <form className="se-event-form" onSubmit={handleAddEvent}>
            <select value={eventTeam} onChange={e => setEventTeam(e.target.value)} required>
              <option value={fixture.homeTeamId}>{home?.name}</option>
              <option value={fixture.awayTeamId}>{away?.name}</option>
            </select>
            <select value={eventType} onChange={e => setEventType(e.target.value)}>
              <option value="goal">Goal</option>
              <option value="penalty">Penalty Goal</option>
              <option value="own-goal">Own Goal</option>
              <option value="yellow">Yellow Card</option>
              <option value="red">Red Card</option>
            </select>
            <input
              type="text"
              placeholder="Min"
              value={eventMin}
              onChange={e => setEventMin(e.target.value)}
              required
              className="ev-input-min"
            />
            <input
              type="text"
              placeholder="Player Name"
              value={eventPlayer}
              onChange={e => setEventPlayer(e.target.value)}
              required
              className="ev-input-name"
              list={datalistId}
            />
            <datalist id={datalistId}>
              {squadPlayers.map((p, idx) => (
                <option key={idx} value={p.name} />
              ))}
            </datalist>
            <button type="submit" className="btn btn-primary"><Plus size={16} /> Add</button>
          </form>
        </div>
      )}

      {/* Lineups Panel */}
      {showLineups && fixture.homeTeamId && (
        <div className="se-lineups-panel">
          
          <div className="se-lineup-col">
            <label className="se-lineup-label">{home?.name} Formation</label>
            <input type="text" value={homeFormation} onChange={e => setHomeFormation(e.target.value)} className="se-lineup-input" />
            <label className="se-lineup-label">Starting 11 (One per line)</label>
            <textarea value={homeLineupText} onChange={e => setHomeLineupText(e.target.value)} rows={11} className="se-lineup-textarea" />
          </div>

          <div className="se-lineup-col">
            <label className="se-lineup-label">{away?.name} Formation</label>
            <input type="text" value={awayFormation} onChange={e => setAwayFormation(e.target.value)} className="se-lineup-input" />
            <label className="se-lineup-label">Starting 11 (One per line)</label>
            <textarea value={awayLineupText} onChange={e => setAwayLineupText(e.target.value)} rows={11} className="se-lineup-textarea" />
          </div>

          <div className="se-lineups-actions">
            <button className={`btn btn-save ${saved ? 'btn-saved' : ''}`} onClick={handleSaveLineups}>
              {saved ? <><CheckCircle size={16} /> Saved!</> : <><Save size={16} /> Save Lineups</>}
            </button>
          </div>

        </div>
      )}
    </div>
  );
}

// ── Main Admin Panel ──────────────────────────────────────────
export default function Admin() {
  const { 
    isAdmin, 
    loginAdmin, 
    logoutAdmin, 
    fixtures, 
    results,
    liveMatches,
    updateMatchResult, 
    removeMatchResult,
    addMatchEvent, 
    removeMatchEvent, 
    updateLineups 
  } = useTournament();

  const [filterDay, setFilterDay] = useState('All');

  const matchDays = useMemo(() => {
    const days = [...new Set(fixtures.map(f => f.day))];
    return ['All', ...days];
  }, [fixtures]);

  const filtered = useMemo(() => {
    if (filterDay === 'All') return fixtures;
    return fixtures.filter(f => f.day === filterDay);
  }, [fixtures, filterDay]);

  const handleSave = (matchId, homeScore, awayScore) => {
    updateMatchResult(matchId, homeScore, awayScore, false, null);
  };

  const handleSetLive = (matchId, homeScore, awayScore, liveMinute, isLive) => {
    updateMatchResult(matchId, homeScore, awayScore, isLive, liveMinute);
  };

  const handleResetMatch = (matchId) => {
    removeMatchResult(matchId);
  };

  const handleAddEvent = (matchId, event) => {
    addMatchEvent(matchId, event);
  };

  const handleRemoveEvent = (matchId, eventId) => {
    removeMatchEvent(matchId, eventId);
  };

  const handleUpdateLineups = (matchId, homeFormation, awayFormation, homeLineup, awayLineup) => {
    updateLineups(matchId, homeFormation, awayFormation, homeLineup, awayLineup);
  };

  if (!isAdmin) {
    return <LoginScreen onLogin={loginAdmin} />;
  }

  const completedCount = fixtures.filter(f => {
    const r = results[f.id];
    return r && r.homeScore !== null && !r.isLive;
  }).length;

  const liveCount = fixtures.filter(f => results[f.id]?.isLive).length;

  return (
    <div className="admin-page animate-fade-in">
      <div className="container">
        <div className="admin-topbar glass">
          <div className="admin-title">
            <div className="admin-badge">ADMIN</div>
            <h1>Score Entry Panel</h1>
            <span className="admin-subtitle">DWOG PACU CUP 2026</span>
          </div>
          <div className="admin-stats">
            <div className="admin-stat">
              <span className="ast-val">{liveCount}</span>
              <span className="ast-label">Live</span>
            </div>
            <div className="admin-stat">
              <span className="ast-val">{completedCount}</span>
              <span className="ast-label">Completed</span>
            </div>
            <div className="admin-stat">
              <span className="ast-val">{fixtures.length - completedCount - liveCount}</span>
              <span className="ast-label">Upcoming</span>
            </div>
          </div>
          <div className="admin-actions" style={{ display: 'flex', gap: '1rem' }}>
            <button 
              className="btn btn-secondary" 
              onClick={() => window.open('http://localhost:3001/api/backup', '_blank')}
            >
              <Save size={16} /> Backup
            </button>
            <button className="btn btn-secondary logout-btn" onClick={logoutAdmin}>
              <LogOut size={16} /> Logout
            </button>
          </div>
        </div>

        <div className="admin-info glass">
          <AlertCircle size={16} className="info-icon" />
          <span>All results are saved automatically to your browser. Standings update instantly. To reset a result, overwrite the scores and click Full Time again.</span>
        </div>

        {/* Day Filter */}
        <div className="admin-filters glass">
          <span className="filter-label">Filter by Match Day:</span>
          <div className="filter-btns">
            {matchDays.slice(0, 8).map(d => (
              <button
                key={d}
                className={`filter-btn ${filterDay === d ? 'active' : ''}`}
                onClick={() => setFilterDay(d)}
              >
                {d === 'All' ? 'All Matches' : d}
              </button>
            ))}
          </div>
        </div>

        {/* Live Matches List */}
        {liveMatches.length > 0 && (
          <div className="se-list live-matches-list">
            <div className="se-list-header live-header">
              <span className="live-header-pulse">● ACTIVE LIVE MATCHES</span>
              <span style={{ textAlign: 'center' }}>Teams & Score</span>
              <span style={{ textAlign: 'right' }}>Actions</span>
            </div>
            {liveMatches.map(f => (
              <MatchScoreEntry
                key={`live-${f.id}`}
                fixture={f}
                result={results[f.id] || null}
                onSave={handleSave}
                onSetLive={handleSetLive}
                onAddEvent={handleAddEvent}
                onRemoveEvent={handleRemoveEvent}
                onUpdateLineups={handleUpdateLineups}
                onReset={handleResetMatch}
              />
            ))}
          </div>
        )}

        {/* Score Entry List */}
        <div className="se-list">
          <div className="se-list-header">
            <span>Match</span>
            <span style={{ textAlign: 'center' }}>Teams & Score</span>
            <span style={{ textAlign: 'right' }}>Actions</span>
          </div>
          {filtered.map(f => (
            <MatchScoreEntry
              key={f.id}
              fixture={f}
              result={results[f.id] || null}
              onSave={handleSave}
              onSetLive={handleSetLive}
              onAddEvent={handleAddEvent}
              onRemoveEvent={handleRemoveEvent}
              onUpdateLineups={handleUpdateLineups}
              onReset={handleResetMatch}
            />
          ))}
        </div>

      </div>
    </div>
  );
}
