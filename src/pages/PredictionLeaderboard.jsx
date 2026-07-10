import React, { useState, useEffect, useMemo } from 'react';
import { supabase } from '../utils/supabase';
import { FIXTURES } from '../data/fixtures';
import { getBrowserId } from '../utils/browserId';
import { Link } from 'react-router-dom';
import { Trophy, Target, Medal, Calendar, ChevronRight } from 'lucide-react';
import { useTournament } from '../context/TournamentContext';
import { TEAMS } from '../data/teams';
import './PredictionLeaderboard.css';

export default function PredictionLeaderboard() {
  const [predictions, setPredictions] = useState([]);
  const [loading, setLoading] = useState(true);
  const myBid = getBrowserId();
  const { fixtures } = useTournament();

  useEffect(() => {
    async function load() {
      setLoading(true);
      const { data } = await supabase
        .from('predictions')
        .select('*')
        .order('created_at', { ascending: true });
      if (data) setPredictions(data);
      setLoading(false);
    }
    load();
  }, []);

  // Build leaderboard: group by browser_id, score accuracy
  const leaderboard = useMemo(() => {
    const fans = {};
    predictions.forEach(p => {
      if (!fans[p.browser_id]) {
        fans[p.browser_id] = {
          browser_id: p.browser_id,
          nickname: p.nickname || 'Fan',
          total: 0,
          correct: 0,   // right result (W/D/L)
          exact: 0,     // exact score
          pts: 0,       // 2pts for correct result, 5pts for exact score
        };
      }
      const f = fans[p.browser_id];
      f.total++;

      // Find the actual result
      const fixture = FIXTURES.find(fx => fx.id === p.match_id);
      if (!fixture) return;

      // We need the result — we'll compute from predictions' is_correct/exact_score
      // These get updated by the admin or can be computed client-side
      if (p.exact_score) {
        f.exact++;
        f.correct++;
        f.pts += 5;
      } else if (p.is_correct) {
        f.correct++;
        f.pts += 2;
      }
    });

    return Object.values(fans)
      .sort((a, b) => b.pts !== a.pts ? b.pts - a.pts : b.exact !== a.exact ? b.exact - a.exact : b.correct - a.correct)
      .map((fan, i) => ({ ...fan, rank: i + 1 }));
  }, [predictions]);

  const myRank = leaderboard.find(f => f.browser_id === myBid);
  const totalPredictions = predictions.length;
  const matchesPredicted = new Set(predictions.map(p => p.match_id)).size;

  const upcomingMatches = useMemo(() => {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    const todayStr = `${yyyy}-${mm}-${dd}`;

    return fixtures.filter(f => {
      if (f.homeScore !== null) return false;
      if (!f.homeTeamId || !f.awayTeamId || f.homeTeamId === 'TBD' || f.homeTeamId.includes('WINNER')) return false;
      
      if (f.isoDate !== todayStr) return false;

      return true;
    }).slice(0, 10);
  }, [fixtures]);

  return (
    <div className="pred-lb-page animate-fade-in">
      <div className="container">
        <div className="page-header">
          <span className="badge badge-group">Fan Arena</span>
          <h1 className="section-heading">Prediction Leaderboard</h1>
          <p className="section-subheading">
            Who knows their football? {totalPredictions} predictions across {matchesPredicted} matches.
            Score 2pts for the correct result, 5pts for the exact score!
          </p>
        </div>

        {/* Scoring system */}
        <div className="pred-scoring-guide glass">
          <div className="pred-score-item">
            <span className="pred-score-icon exact-icon">🎯</span>
            <div>
              <div className="pred-score-name">Exact Score</div>
              <div className="pred-score-desc">Predict the exact scoreline</div>
            </div>
            <span className="pred-score-pts">+5 pts</span>
          </div>
          <div className="pred-score-item">
            <span className="pred-score-icon correct-icon">✅</span>
            <div>
              <div className="pred-score-name">Correct Result</div>
              <div className="pred-score-desc">Win/Draw/Loss outcome right</div>
            </div>
            <span className="pred-score-pts">+2 pts</span>
          </div>
        </div>

        {/* Upcoming Matches for Prediction */}
        {upcomingMatches.length > 0 && (
          <div className="pred-upcoming-section">
            <h2 className="pred-upcoming-title"><Calendar size={20} /> Upcoming Matches to Predict</h2>
            <div className="pred-upcoming-list">
              {upcomingMatches.map(match => {
                const home = TEAMS[match.homeTeamId];
                const away = TEAMS[match.awayTeamId];
                return (
                  <Link to={`/match/${match.id}`} key={match.id} className="pred-upcoming-card glass">
                    <div className="pred-uc-teams">
                      <span className="pred-uc-team home">{home?.shortName || match.homeTeamId}</span>
                      <span className="pred-uc-vs">VS</span>
                      <span className="pred-uc-team away">{away?.shortName || match.awayTeamId}</span>
                    </div>
                    <div className="pred-uc-action">
                      Predict <ChevronRight size={16} />
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        )}

        {/* My standing */}
        {myRank && (
          <div className="pred-my-rank glass">
            <Target size={18} className="pred-my-icon" />
            <div>
              <div className="pred-my-label">Your ranking</div>
              <div className="pred-my-name">{myRank.nickname}</div>
            </div>
            <div className="pred-my-stats">
              <span>#{myRank.rank}</span>
              <span className="pred-my-sep">·</span>
              <span>{myRank.pts} pts</span>
              <span className="pred-my-sep">·</span>
              <span>{myRank.exact} exact</span>
            </div>
          </div>
        )}

        {/* Leaderboard table */}
        <div className="pred-lb-card glass">
          {loading ? (
            <div className="pred-lb-loading">Loading predictions...</div>
          ) : leaderboard.length === 0 ? (
            <div className="pred-lb-empty">
              <Target size={48} style={{ opacity: 0.2, marginBottom: '1rem' }} />
              <p>No predictions yet. Be the first to predict a match!</p>
            </div>
          ) : (
            <table className="pred-lb-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Fan</th>
                  <th>Predicted</th>
                  <th>Exact</th>
                  <th>Pts</th>
                </tr>
              </thead>
              <tbody>
                {leaderboard.map((fan) => {
                  const isMe = fan.browser_id === myBid;
                  return (
                    <tr key={fan.browser_id} className={isMe ? 'pred-lb-me' : ''}>
                      <td className="pred-lb-rank">
                        {fan.rank === 1 ? <Trophy size={18} className="rank-gold" /> :
                         fan.rank === 2 ? <Medal size={18} className="rank-silver" /> :
                         fan.rank === 3 ? <Medal size={18} className="rank-bronze" /> :
                         fan.rank}
                      </td>
                      <td className="pred-lb-nick">
                        {fan.nickname}
                        {isMe && <span className="pred-lb-you">you</span>}
                      </td>
                      <td>{fan.total}</td>
                      <td>{fan.exact}</td>
                      <td className="pred-lb-pts">{fan.pts}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
