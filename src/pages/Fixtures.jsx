import React, { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTournament } from '../context/TournamentContext';
import { TEAMS } from '../data/teams';
import { Calendar, MapPin, Clock, Filter, ChevronDown, ChevronUp, Shield, Search } from 'lucide-react';
import './Fixtures.css';

const STATUS_LABELS = { upcoming: 'Upcoming', live: 'Live', completed: 'FT' };

function getStatus(fixture, result) {
  if (result?.isLive) return 'live';
  if (result && result.homeScore !== null && result.awayScore !== null) return 'completed';
  return 'upcoming';
}

function FixtureCard({ fixture, result }) {
  const navigate = useNavigate();
  const [expanded, setExpanded] = useState(false);
  const home = TEAMS[fixture.homeTeamId];
  const away = TEAMS[fixture.awayTeamId];
  const status = getStatus(fixture, result);
  const isKnockout = fixture.stage === 'knockout' || fixture.stage === 'charity';
  const events = result?.events || [];

  return (
    <div className={`fx-card glass ${status}`} onClick={() => navigate(`/match/${fixture.id}`)} style={{cursor: 'pointer'}}>
      <div className="fx-header">
        <span className="fx-num">Match #{fixture.matchNo}</span>
        <div className="fx-badges">
          {fixture.group && <span className="badge badge-group">Group {fixture.group}</span>}
          <span className={`badge badge-status ${status}`}>{STATUS_LABELS[status]}</span>
        </div>
      </div>

      {isKnockout ? (
        <div className="fx-body knockout-body">
          <div className="knockout-label">{fixture.label || fixture.matchDay}</div>
        </div>
      ) : (
        <div className="fx-body">
          <Link to={`/team/${home?.id}`} className="fx-team home" style={{color: 'inherit', textDecoration: 'none'}} onClick={(e) => e.stopPropagation()}>
            <Shield size={22} style={{ color: home?.color, flexShrink: 0 }} />
            <span className="fx-team-name">{home?.name}</span>
          </Link>
          <div className="fx-center">
            {status === 'upcoming'
              ? <span className="fx-vs">VS</span>
              : (
                <div className="fx-score">
                  <span className={status === 'live' ? 'score-live' : ''}>{result?.homeScore ?? '-'}</span>
                  <span className="fx-dash">–</span>
                  <span className={status === 'live' ? 'score-live' : ''}>{result?.awayScore ?? '-'}</span>
                </div>
              )
            }
          </div>
          <Link to={`/team/${away?.id}`} className="fx-team away" style={{color: 'inherit', textDecoration: 'none'}} onClick={(e) => e.stopPropagation()}>
            <span className="fx-team-name">{away?.name}</span>
            <Shield size={22} style={{ color: away?.color, flexShrink: 0 }} />
          </Link>
        </div>
      )}

      <div className="fx-footer">
        <span><Calendar size={13} />{fixture.date}</span>
        <span><Clock size={13} />{fixture.time}</span>
        <span><MapPin size={13} />{fixture.venue}</span>
        {events.length > 0 && (
          <button className="fx-events-btn" onClick={(e) => { e.stopPropagation(); setExpanded(!expanded); }}>
            Events {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </button>
        )}
      </div>

      {expanded && events.length > 0 && (
        <div className="fx-events-display">
          {events.map(ev => {
            const isHome = ev.teamId === fixture.homeTeamId;
            return (
              <div key={ev.id} className={`fx-event-row ${isHome ? 'home-ev' : 'away-ev'}`}>
                {isHome ? (
                  <>
                    <span className="ev-min">{ev.minute}'</span>
                    <span className="ev-type badge-type" data-type={ev.type}>{ev.type === 'penalty' ? 'PEN' : ev.type === 'own-goal' ? 'OG' : ev.type}</span>
                    <span className="ev-player">{ev.player}</span>
                  </>
                ) : (
                  <>
                    <span className="ev-player">{ev.player}</span>
                    <span className="ev-type badge-type" data-type={ev.type}>{ev.type === 'penalty' ? 'PEN' : ev.type === 'own-goal' ? 'OG' : ev.type}</span>
                    <span className="ev-min">{ev.minute}'</span>
                  </>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default function Fixtures() {
  const { fixtures, results } = useTournament();

  const [openDays, setOpenDays] = useState({ 'Match Day 1': true });
  const [filterGroup, setFilterGroup] = useState('All');
  const [filterVenue, setFilterVenue] = useState('All');
  const [filterStatus, setFilterStatus] = useState('All');
  const [filterTeam, setFilterTeam] = useState('All');
  const [search, setSearch] = useState('');

  const matchDays = useMemo(() => {
    const order = [
      'Match Day 1','Match Day 2','Match Day 3','Match Day 4','Match Day 5',
      'Quarter-Final','Semi-Final (Leg 1)','Semi-Final (Leg 2)',
      'Third Place','The Final','Charity Match'
    ];
    return order.filter(d => fixtures.some(f => f.matchDay === d));
  }, [fixtures]);

  const allTeamNames = useMemo(() => {
    const names = new Set();
    fixtures.forEach(f => {
      if (f.homeTeamId) names.add(TEAMS[f.homeTeamId]?.name);
      if (f.awayTeamId) names.add(TEAMS[f.awayTeamId]?.name);
    });
    return ['All', ...Array.from(names).filter(Boolean).sort()];
  }, [fixtures]);

  const filtered = useMemo(() => {
    return fixtures.filter(f => {
      const r = results[f.id];
      const status = getStatus(f, r);
      const home = TEAMS[f.homeTeamId];
      const away = TEAMS[f.awayTeamId];
      const matchesSearch = !search ||
        home?.name.toLowerCase().includes(search.toLowerCase()) ||
        away?.name.toLowerCase().includes(search.toLowerCase());
      return (
        (filterGroup === 'All' || f.group === filterGroup) &&
        (filterVenue === 'All' || f.venue === filterVenue) &&
        (filterStatus === 'All' || status === filterStatus) &&
        (filterTeam === 'All' || home?.name === filterTeam || away?.name === filterTeam) &&
        matchesSearch
      );
    });
  }, [fixtures, results, filterGroup, filterVenue, filterStatus, filterTeam, search]);

  const toggleDay = (day) => setOpenDays(prev => ({ ...prev, [day]: !prev[day] }));

  const completedCount = fixtures.filter(f => {
    const r = results[f.id];
    return r && r.homeScore !== null && !r.isLive;
  }).length;

  return (
    <div className="fixtures-page animate-fade-in">
      <div className="container">
        <div className="page-header">
          <span className="badge badge-live">Match Centre</span>
          <h1 className="section-heading">Fixtures & Results</h1>
          <p className="section-subheading">
            {completedCount} of {fixtures.filter(f => f.stage === 'group').length} group stage matches played · {fixtures.length} total fixtures
          </p>
        </div>

        {/* Filters */}
        <div className="fx-filters glass">
          <div className="fx-search-wrap">
            <Search size={18} className="search-icon" />
            <input
              className="fx-search"
              placeholder="Search team..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <div className="fx-filter-row">
            <div className="fx-filter-group">
              <Filter size={16} />
              <label>Group</label>
              <select value={filterGroup} onChange={e => setFilterGroup(e.target.value)}>
                {['All','A','B','C','D'].map(g => <option key={g}>{g}</option>)}
              </select>
            </div>
            <div className="fx-filter-group">
              <label>Venue</label>
              <select value={filterVenue} onChange={e => setFilterVenue(e.target.value)}>
                {['All','UTC Lira','LTC'].map(v => <option key={v}>{v}</option>)}
              </select>
            </div>
            <div className="fx-filter-group">
              <label>Status</label>
              <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
                {[['All','All'],['upcoming','Upcoming'],['live','Live'],['completed','Completed']].map(([v,l]) => <option key={v} value={v}>{l}</option>)}
              </select>
            </div>
          </div>
        </div>

        {/* Match Days */}
        <div className="fx-days">
          {matchDays.map(day => {
            const dayFixtures = filtered.filter(f => f.matchDay === day);
            if (dayFixtures.length === 0) return null;
            const isOpen = openDays[day] !== false;
            const dayDate = dayFixtures[0]?.date;

            return (
              <div key={day} className="fx-day-section">
                <button
                  className="fx-day-header glass"
                  onClick={() => toggleDay(day)}
                >
                  <div className="fx-day-info">
                    <span className="fx-day-name">{day}</span>
                    <span className="fx-day-date">{dayDate}</span>
                  </div>
                  <div className="fx-day-right">
                    <span className="fx-day-count">{dayFixtures.length} match{dayFixtures.length !== 1 ? 'es' : ''}</span>
                    {isOpen ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                  </div>
                </button>

                {isOpen && (
                  <div className="fx-day-body">
                    {dayFixtures.map(f => (
                      <FixtureCard key={f.id} fixture={f} result={results[f.id]} />
                    ))}
                  </div>
                )}
              </div>
            );
          })}

          {filtered.length === 0 && (
            <div className="empty-state glass">No matches found for the selected filters.</div>
          )}
        </div>
      </div>
    </div>
  );
}
