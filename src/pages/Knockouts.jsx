import React from 'react';
import { Trophy } from 'lucide-react';
import { useTournament } from '../context/TournamentContext';
import { TEAMS } from '../data/teams';
import './Knockouts.css';

function MatchupBox({ fixture, result, title }) {
  const home = TEAMS[fixture.homeTeamId];
  const away = TEAMS[fixture.awayTeamId];
  
  const homeLabel = home ? home.name : (fixture.homeTeamId || 'TBD');
  const awayLabel = away ? away.name : (fixture.awayTeamId || 'TBD');

  return (
    <div className="matchup glass">
      <div className="matchup-header">{title}</div>
      <div className="matchup-team">
        <span className={`team-name ${!home ? 'text-muted' : ''}`}>{homeLabel}</span>
        <span className="team-score">{result?.homeScore ?? '-'}</span>
      </div>
      <div className="matchup-team">
        <span className={`team-name ${!away ? 'text-muted' : ''}`}>{awayLabel}</span>
        <span className="team-score">{result?.awayScore ?? '-'}</span>
      </div>
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
