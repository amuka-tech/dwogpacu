import React, { createContext, useContext, useEffect, useState, useMemo, useRef } from 'react';
import { TEAMS, GROUPS } from '../data/teams';
import { FIXTURES } from '../data/fixtures';
import { calculateGroupStandings, getTopScorers, getAllCards } from '../utils/tournamentEngine';
import { supabase } from '../utils/supabase';
import { toast } from 'react-hot-toast';

function urlB64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding).replace(/\-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

const TournamentContext = createContext(null);

export function TournamentProvider({ children }) {
  const [results, setResults] = useState({});
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const resultsRef = useRef({});

  const fetchMatches = async () => {
    try {
      const { data, error } = await supabase.from('matches').select('*');
      if (error) throw error;
      const resultsMap = {};
      data.forEach(match => {
        resultsMap[match.id] = {
          homeScore: match.home_score,
          awayScore: match.away_score,
          isLive: match.is_live,
          events: match.events || [],
          liveMinute: match.live_minute || "",
          leg1: match.leg1 || null,
          leg2: match.leg2 || null,
        };
      });
      resultsRef.current = resultsMap;
      setResults(resultsMap);
    } catch (err) {
      console.error('Error fetching matches:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const adminStatus = localStorage.getItem('dwogpacu_admin');
    if (adminStatus === 'true') {
      setIsAdmin(true);
    }

    fetchMatches();

    const channel = supabase.channel('public:matches')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'matches' }, (payload) => {
        if (payload.eventType === 'UPDATE' && payload.new) {
          const newMatch = payload.new;
          // payload.old does not contain the old scores because of Replica Identity rules.
          // So we use our local resultsRef to determine if a goal was scored!
          const oldMatch = resultsRef.current[newMatch.id] || { homeScore: 0, awayScore: 0, isLive: false };
          const fixture = FIXTURES.find(f => f.id === newMatch.id);
          
          if (fixture) {
            const homeName = TEAMS[fixture.homeTeamId]?.shortName || 'Home';
            const awayName = TEAMS[fixture.awayTeamId]?.shortName || 'Away';
            
            if (newMatch.home_score > oldMatch.homeScore) {
              toast.success(`⚽ GOAL! ${homeName} ${newMatch.home_score} - ${newMatch.away_score} ${awayName}`, { duration: 5000 });
            } else if (newMatch.away_score > oldMatch.awayScore) {
              toast.success(`⚽ GOAL! ${homeName} ${newMatch.home_score} - ${newMatch.away_score} ${awayName}`, { duration: 5000 });
            } else if (newMatch.is_live && !oldMatch.isLive) {
              toast.success(`🔴 KICKOFF! ${homeName} vs ${awayName}`, { duration: 5000 });
            } else if (!newMatch.is_live && oldMatch.isLive) {
              toast.success(`🏁 FULL TIME! ${homeName} ${newMatch.home_score} - ${newMatch.away_score} ${awayName}`, { duration: 5000 });
            }
          }
        }
        fetchMatches(); 
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const loginAdmin = async (password) => {
    if (password === 'dwogpacu2026') {
      localStorage.setItem('dwogpacu_admin', 'true');
      setIsAdmin(true);
      return true;
    }
    return false;
  };

  const logoutAdmin = () => {
    localStorage.removeItem('dwogpacu_admin');
    setIsAdmin(false);
  };

  const updateMatchResult = async (matchId, homeScore, awayScore, isLive = false, liveMinute = null) => {
    try {
      const currentData = results[matchId] || { events: [], homeScore: 0, awayScore: 0, isLive: false };
      const finalLiveMinute = liveMinute !== null ? liveMinute : currentData.liveMinute;
      const newMatchData = { ...currentData, homeScore, awayScore, isLive, liveMinute: finalLiveMinute };
      setResults(prev => ({ ...prev, [matchId]: newMatchData }));
      
      const { error } = await supabase.from('matches').upsert({
        id: matchId,
        home_score: homeScore,
        away_score: awayScore,
        is_live: isLive,
        live_minute: finalLiveMinute,
        events: currentData.events || []
      });

      if (error) throw error;

      const fixture = FIXTURES.find(f => f.id === matchId);
      const homeName = fixture ? TEAMS[fixture.homeTeamId]?.shortName || "Home" : "Home";
      const awayName = fixture ? TEAMS[fixture.awayTeamId]?.shortName || "Away" : "Away";

      // Directly invoke the Edge Function to send push notifications
      const { data: invokeData, error: invokeError } = await supabase.functions.invoke('notify', {
        body: {
          type: 'UPDATE',
          table: 'matches',
          old_record: { home_score: currentData.homeScore, away_score: currentData.awayScore, is_live: currentData.isLive },
          record: { 
            home_score: homeScore, 
            away_score: awayScore, 
            is_live: isLive,
            home_team: homeName,
            away_team: awayName
          }
        }
      });
      if (invokeError) {
        console.error("Edge function push error:", invokeError);
      } else {
        console.log("Edge function success:", invokeData);
      }

      // Automatically grade any predictions for this match if it has scores
      if (homeScore !== null && awayScore !== null) {
        const { data: preds } = await supabase.from('predictions').select('id, home_score_pred, away_score_pred').eq('match_id', matchId);
        if (preds && preds.length > 0) {
          for (const p of preds) {
            const isExact = (p.home_score_pred === homeScore && p.away_score_pred === awayScore);
            const predDiff = p.home_score_pred - p.away_score_pred;
            const actualDiff = homeScore - awayScore;
            
            let isCorrect = false;
            if (predDiff > 0 && actualDiff > 0) isCorrect = true;
            else if (predDiff < 0 && actualDiff < 0) isCorrect = true;
            else if (predDiff === 0 && actualDiff === 0) isCorrect = true;
            
            await supabase.from('predictions').update({
              is_correct: isCorrect,
              exact_score: isExact
            }).eq('id', p.id);
          }
        }
      }

    } catch(err) {
      console.error("Failed to update result", err);
    }
  };

  const updateLegScore = async (matchId, leg, homeScore, awayScore) => {
    try {
      const currentData = results[matchId] || {};
      const legKey = `leg${leg}`;
      const newLegData = { home: homeScore, away: awayScore };
      const updated = { ...currentData, [legKey]: newLegData };

      // Compute aggregate for homeScore/awayScore fields
      const l1 = leg === 1 ? newLegData : (currentData.leg1 || null);
      const l2 = leg === 2 ? newLegData : (currentData.leg2 || null);
      const aggHome = l1 && l2 ? l1.home + l2.away : null;
      const aggAway = l1 && l2 ? l1.away + l2.home : null;

      updated.homeScore = aggHome;
      updated.awayScore = aggAway;

      setResults(prev => ({ ...prev, [matchId]: updated }));

      await supabase.from('matches').upsert({
        id: matchId,
        home_score: aggHome,
        away_score: aggAway,
        is_live: currentData.isLive || false,
        live_minute: currentData.liveMinute || null,
        events: currentData.events || [],
        leg1: l1,
        leg2: l2,
      });
    } catch (err) {
      console.error('Failed to save leg score', err);
    }
  };

  const removeMatchResult = async (matchId) => {
    try {
      setResults(prev => {
        const next = { ...prev };
        delete next[matchId];
        return next;
      });
      await supabase.from('matches').delete().eq('id', matchId);
    } catch(err) {
      console.error("Failed to delete result", err);
    }
  };

  const subscribeToPushNotifications = async () => {
    try {
      if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
        toast.error('Push notifications are not supported by your browser.');
        return;
      }
      
      const permission = await Notification.requestPermission();
      if (permission !== 'granted') {
        toast.error('Notification permission denied.');
        return;
      }

      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlB64ToUint8Array('BOl_ede4LbXQpsED0dXQp23ehRtecYLTz2I9QI9PpLVGgRqcQjmdYslWoe2R4YMfKJhs8Xm3oTHdyGKjd9Znme4')
      });
      
      const subJSON = subscription.toJSON();
      
      // Store in Supabase
      const { error } = await supabase.from('subscriptions').insert([{
        endpoint: subJSON.endpoint,
        p256dh: subJSON.keys.p256dh,
        auth: subJSON.keys.auth
      }]);
      
      if (error) {
        // If it already exists or errors
        console.warn('Subscription insert issue:', error);
      }
      
      toast.success('Successfully subscribed to live updates!');
    } catch (err) {
      console.error('Failed to subscribe:', err);
      toast.error('Failed to subscribe to notifications.');
    }
  };

  const addMatchEvent = async (matchId, event) => {
    try {
      const currentData = results[matchId] || { homeScore: 0, awayScore: 0, isLive: true };
      const newEvents = [...(currentData.events || []), event];
      
      setResults(prev => ({ ...prev, [matchId]: { ...currentData, events: newEvents } }));

      await supabase.from('matches').upsert({
        id: matchId,
        home_score: currentData.homeScore,
        away_score: currentData.awayScore,
        is_live: currentData.isLive,
        live_minute: currentData.liveMinute || null,
        events: newEvents
      });
    } catch(err) {
      console.error("Failed to add event", err);
    }
  };

  const removeMatchEvent = async (matchId, eventId) => {
    try {
      const currentData = results[matchId];
      if (!currentData || !currentData.events) return;
      const newEvents = currentData.events.filter(e => e.id !== eventId);
      
      setResults(prev => ({ ...prev, [matchId]: { ...currentData, events: newEvents } }));

      await supabase.from('matches').upsert({
        id: matchId,
        home_score: currentData.homeScore,
        away_score: currentData.awayScore,
        is_live: currentData.isLive,
        live_minute: currentData.liveMinute || null,
        events: newEvents
      });
    } catch(err) {
      console.error("Failed to remove event", err);
    }
  };

  const updateLineups = async (matchId, homeFormation, awayFormation, homeLineup, awayLineup) => {
    const currentData = results[matchId] || { homeScore: 0, awayScore: 0 };
    setResults(prev => ({
      ...prev,
      [matchId]: { ...currentData, homeFormation, awayFormation, homeLineup, awayLineup }
    }));
  };

  const standings = useMemo(() => calculateGroupStandings(FIXTURES, results), [results]);
  const topScorers = useMemo(() => getTopScorers(results), [results]);
  const allCards = useMemo(() => getAllCards(results), [results]);
  
  const dynamicFixtures = useMemo(() => {
    const updatedFixtures = JSON.parse(JSON.stringify(FIXTURES));
    
    const getTeam = (group, index, defaultId) => {
      const groupStandings = standings?.[group];
      if (!groupStandings) return defaultId;
      
      const team = groupStandings[index];
      if (!team) return defaultId;
      
      const totalMatches = groupStandings.length - 1;
      
      // The user wants teams to only show if they have finished ALL their games
      // AND mathematically clinched the spot.
      if (team.p < totalMatches) return defaultId;
      
      if (index === 0) {
        // To be locked in 1st, Team 0 must be unreachable by ANY team below them
        for (let i = 1; i < groupStandings.length; i++) {
          const opp = groupStandings[i];
          const oppRemaining = totalMatches - opp.p;
          const oppMaxPts = opp.pts + (oppRemaining * 3);
          if (oppRemaining > 0 && oppMaxPts >= team.pts) return defaultId;
        }
        return team.team.id;
      }
      
      if (index === 1) {
        // To be locked in 2nd, Team 0 must be locked in 1st
        let team0Locked = true;
        const team0 = groupStandings[0];
        if (team0.p < totalMatches) team0Locked = false;
        else {
          for (let i = 1; i < groupStandings.length; i++) {
            const opp = groupStandings[i];
            const oppRemaining = totalMatches - opp.p;
            const oppMaxPts = opp.pts + (oppRemaining * 3);
            if (oppRemaining > 0 && oppMaxPts >= team0.pts) {
              team0Locked = false;
              break;
            }
          }
        }
        if (!team0Locked) return defaultId;
        
        // And Team 1 must be unreachable by ANY team below them (teams 2, 3, etc)
        for (let i = 2; i < groupStandings.length; i++) {
          const opp = groupStandings[i];
          const oppRemaining = totalMatches - opp.p;
          const oppMaxPts = opp.pts + (oppRemaining * 3);
          if (oppRemaining > 0 && oppMaxPts >= team.pts) return defaultId;
        }
        return team.team.id;
      }
      
      return defaultId;
    };

    const winnerA = getTeam('A', 0, 'WINNER A');
    const runnerA = getTeam('A', 1, 'RUNNER UP A');
    const winnerB = getTeam('B', 0, 'WINNER B');
    const runnerB = getTeam('B', 1, 'RUNNER UP B');
    const winnerC = getTeam('C', 0, 'WINNER C');
    const runnerC = getTeam('C', 1, 'RUNNER UP C');
    const winnerD = getTeam('D', 0, 'WINNER D');
    const runnerD = getTeam('D', 1, 'RUNNER UP D');

    const updateFixture = (id, homeId, awayId) => {
      const f = updatedFixtures.find(x => x.id === id);
      if (f) { f.homeTeamId = homeId; f.awayTeamId = awayId; }
    };

    updateFixture('046', winnerA, runnerB);
    updateFixture('047', winnerB, runnerA);
    updateFixture('048', winnerC, runnerD);
    updateFixture('049', winnerD, runnerC);

    const getWinner = (matchId, defaultName) => {
      const res = results[matchId];
      if (!res || res.homeScore === null || res.awayScore === null) return defaultName;
      if (res.homeScore > res.awayScore) {
        return updatedFixtures.find(f => f.id === matchId)?.homeTeamId || defaultName;
      } else if (res.awayScore > res.homeScore) {
        return updatedFixtures.find(f => f.id === matchId)?.awayTeamId || defaultName;
      }
      return defaultName;
    };

    updateFixture('050', getWinner('046', 'WINNER QT 1'), getWinner('048', 'WINNER QT 3'));
    updateFixture('051', getWinner('047', 'WINNER QT 2'), getWinner('049', 'WINNER QT 4'));
    updateFixture('052', getWinner('050', 'WINNER SM 1'), getWinner('051', 'WINNER SM 2'));

    return updatedFixtures;
  }, [standings, results]);
  
  const liveMatches = useMemo(() => dynamicFixtures.filter(f => results[f.id]?.isLive), [dynamicFixtures, results]);
  const relevantFixtures = useMemo(() => {
    const d = new Date();
    const today = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    const todayMatches = dynamicFixtures.filter(f => f.isoDate === today);
    if (todayMatches.length > 0) return { title: todayMatches[0].day, matches: todayMatches };

    const upcoming = dynamicFixtures.filter(f => f.isoDate > today);
    if (upcoming.length > 0) {
      const nextDate = upcoming[0].isoDate;
      const nextMatches = upcoming.filter(f => f.isoDate === nextDate);
      return { title: nextMatches[0].day, matches: nextMatches };
    }

    const past = [...dynamicFixtures].reverse().filter(f => f.isoDate < today);
    if (past.length > 0) {
      const lastDate = past[0].isoDate;
      const lastMatches = past.filter(f => f.isoDate === lastDate);
      return { title: lastMatches[0].day, matches: lastMatches.reverse() };
    }

    return { title: "Fixtures", matches: [] };
  }, [dynamicFixtures]);

  const getResult = (id) => results[id] || null;
  const getFixture = (id) => dynamicFixtures.find(f => f.id === id);

  return (
    <TournamentContext.Provider value={{
      fixtures: dynamicFixtures,
      teams: TEAMS,
      groups: GROUPS,
      results,
      standings,
      topScorers,
      allCards,
      liveMatches,
      relevantFixtures,
      isAdmin,
      loading,
      getResult,
      getFixture,
      loginAdmin,
      logoutAdmin,
      updateMatchResult,
      removeMatchResult,
      addMatchEvent,
      removeMatchEvent,
      updateLineups,
      updateLegScore,
      subscribeToPushNotifications
    }}>
      {children}
    </TournamentContext.Provider>
  );
}

export const useTournament = () => {
  const ctx = useContext(TournamentContext);
  if (!ctx) throw new Error('useTournament must be used within TournamentProvider');
  return ctx;
};
