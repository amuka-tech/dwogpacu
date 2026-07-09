import React, { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTournament } from '../context/TournamentContext';
import { TEAMS } from '../data/teams';
import { Shield, Clock, MapPin, Calendar, ChevronRight, Zap, Users, Trophy, Activity } from 'lucide-react';
import './Home.css';

// ── Countdown Timer ──────────────────────────────────────────
function Countdown({ targetDate, label }) {
  const [time, setTime] = React.useState(calcTime(targetDate));
  React.useEffect(() => {
    const t = setInterval(() => setTime(calcTime(targetDate)), 1000);
    return () => clearInterval(t);
  }, [targetDate]);

  function calcTime(d) {
    const diff = new Date(d) - new Date();
    if (diff <= 0) return null;
    const days    = Math.floor(diff / 86400000);
    const hours   = Math.floor((diff % 86400000) / 3600000);
    const minutes = Math.floor((diff % 3600000) / 60000);
    const seconds = Math.floor((diff % 60000) / 1000);
    return { days, hours, minutes, seconds };
  }

  if (!time) return <div className="countdown-ended">Tournament Underway! 🏆</div>;

  return (
    <div className="countdown">
      <p className="countdown-label">{label}</p>
      <div className="countdown-grid">
        {[['days', time.days], ['hrs', time.hours], ['min', time.minutes], ['sec', time.seconds]].map(([u, v]) => (
          <div key={u} className="countdown-unit">
            <span className="countdown-num">{String(v).padStart(2, '0')}</span>
            <span className="countdown-sub">{u}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Match Card Widget ─────────────────────────────────────────
function MatchWidget({ fixture, result, live }) {
  const navigate = useNavigate();
  const home = TEAMS[fixture.homeTeamId];
  const away = TEAMS[fixture.awayTeamId];
  if (!home || !away) return null;
  const hs = result?.homeScore ?? '-';
  const as = result?.awayScore ?? '-';

  return (
    <div className={`match-widget glass ${live ? 'live' : ''}`} onClick={() => navigate(`/match/${fixture.id}`)} style={{cursor: 'pointer'}}>
      {live && (
        <div className="widget-live-badge">
          <span className="live-dot" />
          LIVE {result?.liveMinute ? `${result.liveMinute}'` : ''}
        </div>
      )}
      <div className="widget-body">
        <Link to={`/team/${home.id}`} className="widget-team" style={{color: 'inherit', textDecoration: 'none'}} onClick={(e) => e.stopPropagation()}>
          <Shield size={20} style={{ color: home.color }} />
          <span>{home.shortName}</span>
        </Link>
        <div className="widget-scores">
          <span className="wscore">{hs}</span>
          <span className="wscore-sep">–</span>
          <span className="wscore">{as}</span>
        </div>
        <Link to={`/team/${away.id}`} className="widget-team right" style={{color: 'inherit', textDecoration: 'none'}} onClick={(e) => e.stopPropagation()}>
          <span>{away.shortName}</span>
          <Shield size={20} style={{ color: away.color }} />
        </Link>
      </div>
      <div className="widget-footer">
        <span className="badge badge-group">Group {fixture.group}</span>
        <span className="widget-venue"><MapPin size={12} />{fixture.venue}</span>
      </div>
    </div>
  );
}

// ── Mini Standings Table ──────────────────────────────────────
function MiniStandings({ group, rows }) {
  return (
    <div className="mini-table glass">
      <div className="mini-table-header">
        <span className="mini-group-label">Group {group}</span>
        <Link to="/standings" className="mini-view-all">Full Table <ChevronRight size={14} /></Link>
      </div>
      <div className="table-responsive">
        <table>
          <thead>
            <tr>
              <th>#</th><th>Team</th><th>P</th><th>W</th><th>D</th><th>L</th><th>Pts</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => (
              <tr key={row.team.id} className={i < 2 ? 'qualifies' : ''}>
                <td>{i + 1}</td>
                <td className="mini-team-name">
                  <Link to={`/team/${row.team.id}`} style={{color: 'inherit', textDecoration: 'none'}}>
                    {row.team.shortName}
                  </Link>
                </td>
                <td>{row.p}</td><td>{row.w}</td><td>{row.d}</td><td>{row.l}</td>
                <td className="pts">{row.pts}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ── Main Home Page ────────────────────────────────────────────
export default function Home() {
  const navigate = useNavigate();
  const { fixtures, results, liveMatches, relevantFixtures, standings } = useTournament();

  const finalDate = '2026-08-02T15:00:00';

  const completedCount = useMemo(
    () => fixtures.filter(f => {
      const r = results[f.id];
      return r && r.homeScore !== null && r.awayScore !== null && !r.isLive;
    }).length,
    [fixtures, results]
  );

  return (
    <div className="home-page animate-fade-in">

      {/* ── HERO ─────────────────────────────────── */}
      <section className="hero">
        <div className="hero-bg-overlay" />
        <div className="container hero-inner">
          <div className="hero-text">
            <div className="tagline-pill">"Ateka En Nga?"</div>
            <h1 className="hero-title">
              DWOG PACU<br />
              <span className="text-gradient">CUP 2026</span>
            </h1>
            <p className="hero-sub">
              The premier constituency-based football tournament for the Lango Sub-region in Northern Uganda.
              21 teams. {fixtures.length} matches. One Champion.
            </p>
            <Countdown targetDate={finalDate} label="Until the Grand Final · August 2, 2026" />
            <div className="hero-ctas">
              <Link to="/fixtures" className="btn btn-primary"><Zap size={18} /> Fixtures</Link>
              <Link to="/standings" className="btn btn-secondary"><Trophy size={18} /> Table Standings</Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── QUICK STATS BAR ──────────────────────── */}
      <section className="stats-bar">
        <div className="container stats-bar-inner">
          {[
            { icon: <Users size={22} />, value: '21', label: 'Teams' },
            { icon: <Calendar size={22} />, value: fixtures.length, label: 'Matches' },
            { icon: <Activity size={22} />, value: completedCount, label: 'Played' },
            { icon: <MapPin size={22} />, value: '2', label: 'Venues' },
            { icon: <Trophy size={22} />, value: '4', label: 'Groups' },
          ].map(s => (
            <div key={s.label} className="stat-item">
              <div className="stat-icon">{s.icon}</div>
              <span className="stat-value">{s.value}</span>
              <span className="stat-label">{s.label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ── LIVE MATCHES ─────────────────────────── */}
      {liveMatches.length > 0 && (
        <section className="section live-section">
          <div className="container">
            <div className="section-title-row">
              <h2><span className="badge badge-live">● LIVE NOW</span></h2>
              <Link to="/fixtures" className="see-all">All Fixtures <ChevronRight size={16} /></Link>
            </div>
            <div className="widgets-grid">
              {liveMatches.map(f => (
                <MatchWidget key={f.id} fixture={f} result={results[f.id]} live />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── DYNAMIC FIXTURES ─────────────────────── */}
      <section className="section">
        <div className="container">
          <div className="section-title-row">
            <h2 className="section-h2">{relevantFixtures.title}</h2>
            <Link to="/fixtures" className="see-all">All Matches <ChevronRight size={16} /></Link>
          </div>
          {relevantFixtures.matches.length === 0 ? (
            <div className="empty-state glass">No matches found.</div>
          ) : (
            <div className="today-list">
              {relevantFixtures.matches.map(f => {
                const r = results[f.id];
                const home = TEAMS[f.homeTeamId];
                const away = TEAMS[f.awayTeamId];
                const isDone = r && r.homeScore !== null && !r.isLive;
                const isLive = r?.isLive;
                return (
                  <div key={f.id} className={`today-card glass ${isDone ? 'done' : ''} ${isLive ? 'live' : ''}`} onClick={() => navigate(`/match/${f.id}`)} style={{cursor: 'pointer'}}>
                    <div className="today-meta">
                      <span className="badge badge-group">Group {f.group}</span>
                      {isLive && <span className="badge badge-live">● LIVE</span>}
                      {isLive && r.liveMinute && <span style={{ color: 'var(--text-primary)', fontWeight: 'bold', fontSize: '0.85rem' }}>{r.liveMinute}</span>}
                      {isDone && <span className="badge badge-done">FT</span>}
                    </div>
                    <div className="today-teams">
                      <Link to={`/team/${home?.id}`} className="today-team" style={{color: 'inherit', textDecoration: 'none'}} onClick={(e) => e.stopPropagation()}>
                        <Shield size={20} style={{ color: home?.color }} />
                        <span>{home?.shortName}</span>
                      </Link>
                      <div className="today-score">
                        {isDone || isLive
                          ? <><span>{r.homeScore}</span><span className="score-dash">–</span><span>{r.awayScore}</span></>
                          : <span className="kick-off">{f.time}</span>
                        }
                      </div>
                      <Link to={`/team/${away?.id}`} className="today-team right" style={{color: 'inherit', textDecoration: 'none'}} onClick={(e) => e.stopPropagation()}>
                        <span>{away?.shortName}</span>
                        <Shield size={20} style={{ color: away?.color }} />
                      </Link>
                    </div>
                    <div className="today-venue">
                      <MapPin size={14} /> {f.venue}
                      <Clock size={14} style={{ marginLeft: '1rem' }} /> {f.time}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* ── FOOTBALL WITH A PURPOSE ────────────────── */}
      <section className="section" style={{ background: 'var(--bg-secondary)' }}>
        <div className="container">
          <div className="section-title-row" style={{ flexDirection: 'column', alignItems: 'center', textAlign: 'center', marginBottom: '3rem' }}>
            <span className="badge badge-group" style={{ marginBottom: '1rem' }}>Beyond The Pitch</span>
            <h2 className="section-h2" style={{ fontSize: '2.5rem', color: 'var(--accent-primary)' }}>"Football with a Purpose"</h2>
            <p style={{ color: 'var(--text-secondary)', maxWidth: '600px', margin: '1rem auto 0' }}>
              The Dwog Pacu Foundation ensures the tournament achieves socio-economic goals far beyond just sports in Northern Uganda.
            </p>
          </div>
          
          <div className="widgets-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))' }}>
            <div className="glass" style={{ padding: '2rem', borderRadius: '1rem', textAlign: 'center' }}>
              <div style={{ background: 'rgba(0, 255, 136, 0.1)', color: '#00ff88', width: '64px', height: '64px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem' }}>
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22v-9"/><path d="M12 13a4 4 0 0 0-4-4h0a4 4 0 0 1-4-4"/><path d="M12 13a4 4 0 0 1 4-4h0a4 4 0 0 0 4-4"/></svg>
              </div>
              <h3 style={{ marginBottom: '1rem', color: 'var(--text-primary)' }}>Environmental Conservation</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: '1.6' }}>
                Running massive tree-planting campaigns at every host venue to actively combat deforestation in Northern Uganda.
              </p>
            </div>

            <div className="glass" style={{ padding: '2rem', borderRadius: '1rem', textAlign: 'center' }}>
              <div style={{ background: 'rgba(212, 175, 55, 0.1)', color: '#d4af37', width: '64px', height: '64px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem' }}>
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/></svg>
              </div>
              <h3 style={{ marginBottom: '1rem', color: 'var(--text-primary)' }}>Education Support</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: '1.6' }}>
                Awarding academic school bursaries to outstanding but underprivileged youth players to ensure they stay in school.
              </p>
            </div>

            <div className="glass" style={{ padding: '2rem', borderRadius: '1rem', textAlign: 'center' }}>
              <div style={{ background: 'rgba(56, 189, 248, 0.1)', color: '#38bdf8', width: '64px', height: '64px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem' }}>
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
              </div>
              <h3 style={{ marginBottom: '1rem', color: 'var(--text-primary)' }}>Corporate Partnerships</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: '1.6' }}>
                Local businesses, such as Oyoma General Stores, partner with the tournament to inject direct financial funding into local youth squads.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── LATEST NEWS ────────────────────────────── */}
      <section className="section">
        <div className="container">
          <div className="section-title-row">
            <h2 className="section-h2">Latest News</h2>
            <a href="https://x.com/DwogPacuCup" target="_blank" rel="noopener noreferrer" className="see-all">Follow @DwogPacuCup <ChevronRight size={16} /></a>
          </div>
          <div className="news-grid">
            
            <div className="news-card glass">
              <span className="badge badge-group" style={{ alignSelf: 'flex-start' }}>📌 Pinned</span>
              <p style={{ margin: 0, color: '#e5e5e5', lineHeight: 1.5 }}>
                "This Sunday at UTC Lira.... Defending Champions Vs Erute South, Isaac Okello Vs @AllanOkello8 ..... Mindyang Vs Sam Engola! Mark your calendar!"
              </p>
              <span style={{ fontSize: '0.875rem', color: '#888' }}>Jun 30</span>
            </div>

            <div className="news-card glass">
              <span className="badge badge-done" style={{ alignSelf: 'flex-start', background: '#333' }}>Match Update</span>
              <p style={{ margin: 0, color: '#e5e5e5', lineHeight: 1.5 }}>
                "Dokolo South and Apac Municipality share the spoils after settling for a draw!"
              </p>
              <span style={{ fontSize: '0.875rem', color: '#888' }}>1 hour ago</span>
            </div>

            <div className="news-card glass">
              <span className="badge" style={{ alignSelf: 'flex-start', background: 'var(--accent-primary)', color: '#fff' }}>Highlights</span>
              <p style={{ margin: 0, color: '#e5e5e5', lineHeight: 1.5 }}>
                "Fans flare from yesterday’s opening game between Kioga County and Erute South at UTC Lira playground. The stands brought the energy, the teams brought the fight, and the 2nd edition of the Dwog Pacu Cup is officially up and running in style."
              </p>
              <span style={{ fontSize: '0.875rem', color: '#888' }}>2 hours ago</span>
            </div>

          </div>
        </div>
      </section>

      {/* ── STANDINGS PREVIEW ────────────────────── */}
      <section className="section standings-preview">
        <div className="container">
          <div className="section-title-row">
            <h2 className="section-h2">Group Standings</h2>
            <Link to="/standings" className="see-all">Full Tables <ChevronRight size={16} /></Link>
          </div>
          <div className="mini-tables-grid">
            {Object.entries(standings).map(([g, rows]) => (
              <MiniStandings key={g} group={g} rows={rows} />
            ))}
          </div>
        </div>
      </section>



    </div>
  );
}
