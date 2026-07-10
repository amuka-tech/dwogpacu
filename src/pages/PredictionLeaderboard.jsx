import React, { useState, useEffect, useMemo } from 'react';
import { supabase } from '../utils/supabase';
import { FIXTURES } from '../data/fixtures';
import { getBrowserId } from '../utils/browserId';
import { Trophy, Target, Medal, Star } from 'lucide-react';
import './PredictionLeaderboard.css';

export default function PredictionLeaderboard() {
  const [predictions, setPredictions] = useState([]);
  const [loading, setLoading] = useState(true);
  const myBid = getBrowserId();

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
          correct: 0,
          exact: 0,
          pts: 0,
        };
      }
      const f = fans[p.browser_id];
      f.total++;

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

  const topThree = leaderboard.slice(0, 3);
  const remaining = leaderboard.slice(3);

  return (
    <div className="pred-lb-page animate-fade-in">
      <div className="container">
        
        {/* HERO SECTION */}
        <div className="pred-hero">
          <div className="pred-hero-content">
            <span className="badge badge-group">Fan Arena</span>
            <h1 className="pred-title">Prediction <span className="text-gradient">Leaderboard</span></h1>
            <p className="pred-subtitle">
              Compete against other fans. <strong>{totalPredictions}</strong> predictions made across <strong>{matchesPredicted}</strong> matches.
            </p>
          </div>
          
          <div className="pred-scoring-guide glass">
            <div className="pred-score-item">
              <div className="pred-score-icon-wrap exact-wrap"><Target size={20} /></div>
              <div className="pred-score-text">
                <span className="pred-score-name">Exact Score</span>
                <span className="pred-score-pts">+5 pts</span>
              </div>
            </div>
            <div className="pred-score-divider"></div>
            <div className="pred-score-item">
              <div className="pred-score-icon-wrap correct-wrap"><CheckCircleIcon /></div>
              <div className="pred-score-text">
                <span className="pred-score-name">Correct Result</span>
                <span className="pred-score-pts">+2 pts</span>
              </div>
            </div>
          </div>
        </div>

        {/* MY RANKING BANNER */}
        {myRank && (
          <div className="pred-my-rank glass">
            <div className="pred-my-rank-left">
              <div className="pred-my-avatar">
                {myRank.nickname.charAt(0).toUpperCase()}
              </div>
              <div className="pred-my-info">
                <div className="pred-my-label">Your Ranking</div>
                <div className="pred-my-name">{myRank.nickname}</div>
              </div>
            </div>
            <div className="pred-my-stats">
              <div className="pred-stat-box">
                <span className="pred-stat-val">#{myRank.rank}</span>
                <span className="pred-stat-lbl">Rank</span>
              </div>
              <div className="pred-stat-box highlight">
                <span className="pred-stat-val">{myRank.pts}</span>
                <span className="pred-stat-lbl">Points</span>
              </div>
              <div className="pred-stat-box">
                <span className="pred-stat-val">{myRank.exact}</span>
                <span className="pred-stat-lbl">Exact</span>
              </div>
            </div>
          </div>
        )}

        {/* LEADERBOARD SECTION */}
        <div className="pred-board-container">
          {loading ? (
            <div className="pred-loading glass">Loading rankings...</div>
          ) : leaderboard.length === 0 ? (
            <div className="pred-empty glass">
              <Target size={48} style={{ opacity: 0.2, marginBottom: '1rem' }} />
              <p>No predictions yet. Be the first to predict a match!</p>
            </div>
          ) : (
            <>
              {/* TOP 3 PODIUM */}
              {topThree.length > 0 && (
                <div className="pred-podium">
                  {/* Rank 2 */}
                  {topThree[1] && (
                    <div className="podium-card silver">
                      <div className="podium-rank"><Medal size={20}/> 2</div>
                      <div className="podium-name">{topThree[1].nickname} {topThree[1].browser_id === myBid && <span className="you-tag">You</span>}</div>
                      <div className="podium-pts">{topThree[1].pts} pts</div>
                      <div className="podium-exact">{topThree[1].exact} exact</div>
                    </div>
                  )}
                  {/* Rank 1 */}
                  {topThree[0] && (
                    <div className="podium-card gold">
                      <div className="podium-crown"><Trophy size={28}/></div>
                      <div className="podium-rank">1</div>
                      <div className="podium-name">{topThree[0].nickname} {topThree[0].browser_id === myBid && <span className="you-tag">You</span>}</div>
                      <div className="podium-pts">{topThree[0].pts} pts</div>
                      <div className="podium-exact">{topThree[0].exact} exact</div>
                    </div>
                  )}
                  {/* Rank 3 */}
                  {topThree[2] && (
                    <div className="podium-card bronze">
                      <div className="podium-rank"><Medal size={20}/> 3</div>
                      <div className="podium-name">{topThree[2].nickname} {topThree[2].browser_id === myBid && <span className="you-tag">You</span>}</div>
                      <div className="podium-pts">{topThree[2].pts} pts</div>
                      <div className="podium-exact">{topThree[2].exact} exact</div>
                    </div>
                  )}
                </div>
              )}

              {/* REMAINING LIST */}
              {remaining.length > 0 && (
                <div className="pred-list glass">
                  <div className="pred-list-header">
                    <span className="pl-rank">#</span>
                    <span className="pl-fan">Fan</span>
                    <span className="pl-stat">Predicted</span>
                    <span className="pl-stat">Exact</span>
                    <span className="pl-pts">Points</span>
                  </div>
                  {remaining.map((fan) => {
                    const isMe = fan.browser_id === myBid;
                    return (
                      <div key={fan.browser_id} className={`pred-list-row ${isMe ? 'is-me' : ''}`}>
                        <span className="pl-rank">{fan.rank}</span>
                        <span className="pl-fan">
                          {fan.nickname} {isMe && <span className="you-tag">You</span>}
                        </span>
                        <span className="pl-stat">{fan.total}</span>
                        <span className="pl-stat">{fan.exact}</span>
                        <span className="pl-pts">{fan.pts}</span>
                      </div>
                    );
                  })}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function CheckCircleIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
      <polyline points="22 4 12 14.01 9 11.01"></polyline>
    </svg>
  );
}
