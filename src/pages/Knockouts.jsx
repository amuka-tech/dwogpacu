import React from 'react';
import { Trophy } from 'lucide-react';
import { useTournament } from '../context/TournamentContext';
import { TEAMS } from '../data/teams';
import './Knockouts.css';

function LegScore({ label, homeScore, awayScore }) {
  if (homeScore === null || homeScore === undefined) return null;
  return (
    <div className="leg-score-row">
      <span className="leg-label">{label}</span>
      <span className="leg-score-val">{homeScore} – {awayScore}</span>
    </div>
  );
}

function MatchupBox({ fixture, result, title }) {
  const home = TEAMS[fixture.homeTeamId];
  const away = TEAMS[fixture.awayTeamId];

  const homeLabel = home ? home.name : (fixture.homeTeamId || 'TBD');
  const awayLabel = away ? away.name : (fixture.awayTeamId || 'TBD');

  // Leg scores stored as result.leg1 / result.leg2
  const leg1 = result?.leg1;
  const leg2 = result?.leg2;
  const hasLegs = leg1 && leg2 && leg1.home !== null && leg2.home !== null;
  const aggHome = hasLegs ? (leg1.home + leg2.away) : null;
  const aggAway = hasLegs ? (leg1.away + leg2.home) : null;

  return (
    <div className="matchup glass">
      <div className="matchup-header">{title}</div>
      <div className="matchup-team">
        <span className={`team-name ${!home ? 'text-muted' : ''}`}>{homeLabel}</span>
        <span className="team-score">
          {aggHome !== null ? aggHome : (result?.homeScore ?? '-')}
        </span>
      </div>
      <div className="matchup-team">
        <span className={`team-name ${!away ? 'text-muted' : ''}`}>{awayLabel}</span>
        <span className="team-score">
          {aggAway !== null ? aggAway : (result?.awayScore ?? '-')}
        </span>
      </div>

      {/* Leg breakdown shown when at least leg1 has been played */}
      {(leg1?.home !== null && leg1?.home !== undefined) && (
        <div className="leg-scores">
          <LegScore label="1st Leg" homeScore={leg1.home} awayScore={leg1.away} />
          <LegScore label="2nd Leg" homeScore={leg2?.home ?? null} awayScore={leg2?.away ?? null} />
        </div>
      )}
    </div>
  );
}

const Knockouts = () => {
  const { fixtures, results } = useTournament();

  const qf = fixtures.filter(f => f.day === 'Quarter Finals');
  const sf = fixtures.filter(f => f.day === 'Semi Finals');
  const final = fixtures.find(f => f.day === 'Final');

  return (
    <div className="knockouts-page animate-fade-in">
      <div className="container">
        <div className="page-header text-center">
          <span className="badge badge-live">Road to Glory</span>
          <h1 className="section-heading">Knockout Bracket</h1>
          <p className="section-subheading">The path to becoming the champions of the DWOG PACU CUP 2026.</p>
        </div>

        <div className="bracket-wrapper">
          <div className="bracket">
            {/* Quarter Finals */}
            <div className="round quarter-finals">
              <h3 className="round-title">Quarter-Finals</h3>
              <div className="matchup-list">
                {qf.map((f, i) => (
                  <MatchupBox key={f.id} fixture={f} result={results[f.id]} title={`QF ${i + 1}`} />
                ))}
              </div>
            </div>

            {/* Semi Finals */}
            <div className="round semi-finals">
              <h3 className="round-title">Semi-Finals</h3>
              <div className="matchup-list">
                {sf.map((f, i) => (
                  <MatchupBox key={f.id} fixture={f} result={results[f.id]} title={`SF ${i + 1}`} />
                ))}
              </div>
            </div>

            {/* Final */}
            <div className="round final">
              <h3 className="round-title"><Trophy size={20} className="text-gradient" /> The Final</h3>
              <div className="matchup-list">
                {final && (
                  <div className="matchup final-matchup glass">
                    <div className="matchup-header highlight">{final.date}</div>
                    <div className="matchup-team">
                      <span className={`team-name ${!final.homeTeamId ? 'text-muted' : ''}`}>
                        {final.homeTeamId ? (TEAMS[final.homeTeamId]?.name || final.homeTeamId) : 'Winner SF 1'}
                      </span>
                      <span className="team-score">{results[final.id]?.homeScore ?? '-'}</span>
                    </div>
                    <div className="matchup-team">
                      <span className={`team-name ${!final.awayTeamId ? 'text-muted' : ''}`}>
                        {final.awayTeamId ? (TEAMS[final.awayTeamId]?.name || final.awayTeamId) : 'Winner SF 2'}
                      </span>
                      <span className="team-score">{results[final.id]?.awayScore ?? '-'}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default Knockouts;
