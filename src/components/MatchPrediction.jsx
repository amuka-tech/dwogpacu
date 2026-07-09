import React, { useState, useEffect } from 'react';
import { supabase } from '../utils/supabase';
import { TEAMS } from '../data/teams';
import { getBrowserId } from '../utils/browserId';
import { Target, Users, CheckCircle2, XCircle } from 'lucide-react';
import { toast } from 'react-hot-toast';
import './MatchPrediction.css';

export default function MatchPrediction({ fixture, result }) {
  const [allPredictions, setAllPredictions] = useState([]);
  const [myPrediction, setMyPrediction] = useState(null);
  const [homePred, setHomePred] = useState(0);
  const [awayPred, setAwayPred] = useState(0);
  const [nickname, setNickname] = useState(() => localStorage.getItem('dwogpacu_nickname') || '');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const home = TEAMS[fixture?.homeTeamId];
  const away = TEAMS[fixture?.awayTeamId];
  const isUpcoming = !result || result.homeScore === null;
  const isCompleted = result && result.homeScore !== null && !result.isLive;

  useEffect(() => {
    if (!fixture?.id) return;
    const bid = getBrowserId();

    async function load() {
      setLoading(true);
      const { data } = await supabase
        .from('predictions')
        .select('*')
        .eq('match_id', fixture.id)
        .order('created_at', { ascending: true });

      if (data) {
        setAllPredictions(data);
        const mine = data.find(p => p.browser_id === bid);
        if (mine) setMyPrediction(mine);
      }
      setLoading(false);
    }
    load();
  }, [fixture?.id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isUpcoming || submitting || myPrediction) return;
    setSubmitting(true);
    const bid = getBrowserId();
    const nick = nickname.trim() || 'Fan';
    localStorage.setItem('dwogpacu_nickname', nick);

    const { data, error } = await supabase.from('predictions').insert({
      match_id: fixture.id,
      home_score_pred: homePred,
      away_score_pred: awayPred,
      browser_id: bid,
      nickname: nick,
    }).select().single();

    if (error) {
      if (error.code === '23505') toast.error('You already predicted this match!');
      else toast.error('Failed to save prediction.');
    } else {
      setMyPrediction(data);
      setAllPredictions(prev => [...prev, data]);
      toast.success('Prediction locked in! 🎯');
    }
    setSubmitting(false);
  };

  if (!fixture || result?.isLive) return null;
  // Only show for group stage upcoming/completed
  if (fixture.stage !== 'group') return null;

  // Aggregate community predictions
  const total = allPredictions.length;
  const homeWins = allPredictions.filter(p => p.home_score_pred > p.away_score_pred).length;
  const draws = allPredictions.filter(p => p.home_score_pred === p.away_score_pred).length;
  const awayWins = allPredictions.filter(p => p.home_score_pred < p.away_score_pred).length;

  // Find most popular prediction
  const freq = {};
  allPredictions.forEach(p => {
    const k = `${p.home_score_pred}-${p.away_score_pred}`;
    freq[k] = (freq[k] || 0) + 1;
  });
  const popular = Object.entries(freq).sort((a, b) => b[1] - a[1])[0];

  return (
    <section className="pred-section">
      <div className="pred-header">
        <Target size={20} className="pred-icon" />
        <h2 className="pred-title">
          {isUpcoming ? 'Predict the Score' : 'Fan Predictions'}
        </h2>
        {total > 0 && (
          <span className="pred-count"><Users size={13}/> {total}</span>
        )}
      </div>

      {/* Input form — only for upcoming matches before prediction made */}
      {isUpcoming && !myPrediction && (
        <form onSubmit={handleSubmit} className="pred-form">
          <div className="pred-score-input">
            <div className="pred-team-input">
              <span className="pred-team-name" style={{ color: home?.color }}>{home?.shortName || fixture.homeTeamId}</span>
              <div className="pred-num-wrap">
                <button type="button" className="pred-num-btn" onClick={() => setHomePred(v => Math.max(0, v - 1))}>−</button>
                <span className="pred-num">{homePred}</span>
                <button type="button" className="pred-num-btn" onClick={() => setHomePred(v => v + 1)}>+</button>
              </div>
            </div>
            <span className="pred-vs">VS</span>
            <div className="pred-team-input">
              <div className="pred-num-wrap">
                <button type="button" className="pred-num-btn" onClick={() => setAwayPred(v => Math.max(0, v - 1))}>−</button>
                <span className="pred-num">{awayPred}</span>
                <button type="button" className="pred-num-btn" onClick={() => setAwayPred(v => v + 1)}>+</button>
              </div>
              <span className="pred-team-name" style={{ color: away?.color }}>{away?.shortName || fixture.awayTeamId}</span>
            </div>
          </div>

          <div className="pred-nick-row">
            <input
              className="pred-nick-input"
              placeholder="Your name (optional)"
              value={nickname}
              onChange={e => setNickname(e.target.value)}
              maxLength={20}
            />
            <button type="submit" className="pred-submit-btn" disabled={submitting}>
              {submitting ? 'Saving...' : '🎯 Lock In'}
            </button>
          </div>
        </form>
      )}

      {/* My prediction recap */}
      {myPrediction && (
        <div className="pred-mine">
          <span className="pred-mine-label">Your prediction:</span>
          <span className="pred-mine-score">
            {myPrediction.home_score_pred} – {myPrediction.away_score_pred}
          </span>
          {isCompleted && (
            myPrediction.exact_score
              ? <span className="pred-result exact"><CheckCircle2 size={14}/> Exact!</span>
              : myPrediction.is_correct
              ? <span className="pred-result correct"><CheckCircle2 size={14}/> Correct result</span>
              : <span className="pred-result wrong"><XCircle size={14}/> Wrong</span>
          )}
        </div>
      )}

      {/* Community consensus */}
      {total > 0 && (
        <div className="pred-community">
          <div className="pred-bars">
            <div className="pred-bar-item home-win">
              <div className="pred-bar-fill" style={{ height: `${total > 0 ? (homeWins / total) * 100 : 0}%` }} />
              <span className="pred-bar-label">{home?.shortName}</span>
              <span className="pred-bar-pct">{total > 0 ? Math.round((homeWins / total) * 100) : 0}%</span>
            </div>
            <div className="pred-bar-item draw">
              <div className="pred-bar-fill draw-fill" style={{ height: `${total > 0 ? (draws / total) * 100 : 0}%` }} />
              <span className="pred-bar-label">Draw</span>
              <span className="pred-bar-pct">{total > 0 ? Math.round((draws / total) * 100) : 0}%</span>
            </div>
            <div className="pred-bar-item away-win">
              <div className="pred-bar-fill away-fill" style={{ height: `${total > 0 ? (awayWins / total) * 100 : 0}%` }} />
              <span className="pred-bar-label">{away?.shortName}</span>
              <span className="pred-bar-pct">{total > 0 ? Math.round((awayWins / total) * 100) : 0}%</span>
            </div>
          </div>
          {popular && (
            <p className="pred-popular">
              Most tipped: <strong>{popular[0]}</strong> ({popular[1]} fan{popular[1] > 1 ? 's' : ''})
            </p>
          )}
        </div>
      )}
    </section>
  );
}
