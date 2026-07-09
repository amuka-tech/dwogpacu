import React, { useState, useEffect } from 'react';
import { supabase } from '../utils/supabase';
import { TEAMS } from '../data/teams';
import { getBrowserId } from '../utils/browserId';
import { Star, Trophy, Check } from 'lucide-react';
import './MotmVoting.css';

export default function MotmVoting({ fixture, result }) {
  const [votes, setVotes] = useState([]); // { player_name, team_id, count }
  const [myVote, setMyVote] = useState(null);
  const [loading, setLoading] = useState(true);
  const [voting, setVoting] = useState(false);

  // Build candidate list from match events (players who scored/carded)
  const candidates = React.useMemo(() => {
    const seen = new Set();
    const list = [];
    (result?.events || []).forEach(ev => {
      if (!ev.player) return;
      const key = `${ev.player}-${ev.teamId}`;
      if (!seen.has(key)) {
        seen.add(key);
        list.push({ player: ev.player, teamId: ev.teamId });
      }
    });
    return list;
  }, [result]);

  useEffect(() => {
    if (!fixture?.id) return;
    const bid = getBrowserId();

    async function loadVotes() {
      setLoading(true);
      const { data } = await supabase
        .from('motm_votes')
        .select('player_name, team_id, browser_id')
        .eq('match_id', fixture.id);

      if (data) {
        // Aggregate
        const tally = {};
        data.forEach(v => {
          const k = `${v.player_name}|${v.team_id}`;
          tally[k] = (tally[k] || 0) + 1;
        });
        setVotes(Object.entries(tally).map(([k, count]) => {
          const [player_name, team_id] = k.split('|');
          return { player_name, team_id, count };
        }).sort((a, b) => b.count - a.count));

        const mine = data.find(v => v.browser_id === bid);
        if (mine) setMyVote(`${mine.player_name}|${mine.team_id}`);
      }
      setLoading(false);
    }
    loadVotes();
  }, [fixture?.id]);

  const handleVote = async (player, teamId) => {
    if (myVote || voting) return;
    setVoting(true);
    const bid = getBrowserId();
    const { error } = await supabase.from('motm_votes').insert({
      match_id: fixture.id,
      player_name: player,
      team_id: teamId,
      browser_id: bid,
    });
    if (!error) {
      setMyVote(`${player}|${teamId}`);
      setVotes(prev => {
        const k = `${player}|${teamId}`;
        const exists = prev.find(v => v.player_name === player && v.team_id === teamId);
        if (exists) return prev.map(v => v.player_name === player && v.team_id === teamId ? { ...v, count: v.count + 1 } : v).sort((a, b) => b.count - a.count);
        return [...prev, { player_name: player, team_id: teamId, count: 1 }].sort((a, b) => b.count - a.count);
      });
    }
    setVoting(false);
  };

  const totalVotes = votes.reduce((s, v) => s + v.count, 0);

  // Only show for completed matches with events
  if (!result || result.homeScore === null || result.isLive) return null;
  if (candidates.length === 0) return null;

  return (
    <section className="motm-section">
      <div className="motm-header">
        <Star size={20} className="motm-star" />
        <h2 className="motm-title">Man of the Match</h2>
        {myVote && <span className="motm-voted-badge"><Check size={13}/> Voted</span>}
      </div>
      <p className="motm-sub">{myVote ? `${totalVotes} fan${totalVotes !== 1 ? 's' : ''} voted` : 'Who was your star player?'}</p>

      <div className="motm-candidates">
        {candidates.map(c => {
          const key = `${c.player}|${c.teamId}`;
          const voteObj = votes.find(v => v.player_name === c.player && v.team_id === c.teamId);
          const count = voteObj?.count || 0;
          const pct = totalVotes > 0 ? Math.round((count / totalVotes) * 100) : 0;
          const isWinner = myVote && votes[0] && `${votes[0].player_name}|${votes[0].team_id}` === key;
          const isMyVote = myVote === key;
          const teamColor = TEAMS[c.teamId]?.color || '#e33117';

          return (
            <button
              key={key}
              className={`motm-card ${isMyVote ? 'my-vote' : ''} ${isWinner ? 'winner' : ''} ${myVote && !isMyVote ? 'voted-other' : ''}`}
              onClick={() => handleVote(c.player, c.teamId)}
              disabled={!!myVote || voting}
              style={{ '--team-color': teamColor }}
            >
              {isWinner && <Trophy size={14} className="motm-trophy" />}
              <span className="motm-player">{c.player}</span>
              <span className="motm-team">{TEAMS[c.teamId]?.shortName || c.teamId}</span>
              {myVote && (
                <div className="motm-bar-wrap">
                  <div className="motm-bar" style={{ width: `${pct}%`, background: teamColor }} />
                  <span className="motm-pct">{pct}%</span>
                </div>
              )}
            </button>
          );
        })}
      </div>
    </section>
  );
}
