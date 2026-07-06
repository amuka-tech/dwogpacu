import React, { createContext, useContext, useEffect, useState, useMemo } from 'react';
import { TEAMS, GROUPS } from '../data/teams';
import { FIXTURES } from '../data/fixtures';
import { calculateGroupStandings, getTopScorers, getAllCards } from '../utils/tournamentEngine';
import { supabase } from '../utils/supabase';

const TournamentContext = createContext(null);

export function TournamentProvider({ children }) {
  const [results, setResults] = useState({});
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

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
          liveMinute: "", 
        };
      });
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
      const currentData = results[matchId] || { events: [] };
      const newMatchData = { ...currentData, homeScore, awayScore, isLive, ...(liveMinute && { liveMinute }) };
      setResults(prev => ({ ...prev, [matchId]: newMatchData }));
      
      await supabase.from('matches').upsert({
        id: matchId,
        home_score: homeScore,
        away_score: awayScore,
        is_live: isLive,
        events: currentData.events || []
      });
    } catch(err) {
      console.error("Failed to update result", err);
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
  
  const liveMatches = useMemo(() => FIXTURES.filter(f => results[f.id]?.isLive), [results]);
  const relevantFixtures = useMemo(() => {
    const d = new Date();
    const today = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    const todayMatches = FIXTURES.filter(f => f.isoDate === today);
    if (todayMatches.length > 0) return { title: todayMatches[0].day, matches: todayMatches };

    const upcoming = FIXTURES.filter(f => f.isoDate > today);
    if (upcoming.length > 0) {
      const nextDate = upcoming[0].isoDate;
      const nextMatches = upcoming.filter(f => f.isoDate === nextDate);
      return { title: nextMatches[0].day, matches: nextMatches };
    }

    const past = [...FIXTURES].reverse().filter(f => f.isoDate < today);
    if (past.length > 0) {
      const lastDate = past[0].isoDate;
      const lastMatches = past.filter(f => f.isoDate === lastDate);
      return { title: lastMatches[0].day, matches: lastMatches.reverse() };
    }

    return { title: "Fixtures", matches: [] };
  }, []);

  const getResult = (id) => results[id] || null;
  const getFixture = (id) => FIXTURES.find(f => f.id === id);

  return (
    <TournamentContext.Provider value={{
      fixtures: FIXTURES,
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
      updateLineups
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
