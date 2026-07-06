import React, { createContext, useContext, useEffect, useState, useMemo } from 'react';
import { TEAMS, GROUPS } from '../data/teams';
import { FIXTURES } from '../data/fixtures';
import { calculateGroupStandings, getTopScorers, getAllCards } from '../utils/tournamentEngine';

const TournamentContext = createContext(null);

export function TournamentProvider({ children }) {
  const [results, setResults] = useState({});
  const [isAdmin, setIsAdmin] = useState(false);

  // Load from local storage
  useEffect(() => {
    const adminStatus = localStorage.getItem('dwogpacu_admin');
    if (adminStatus === 'true') {
      setIsAdmin(true);
    }

    const savedResults = localStorage.getItem('dwogpacu_results');
    if (savedResults) {
      try {
        setResults(JSON.parse(savedResults));
      } catch (err) {
        console.error('Failed to parse local results');
      }
    }
  }, []);

  const saveResults = (newResults) => {
    setResults(newResults);
    localStorage.setItem('dwogpacu_results', JSON.stringify(newResults));
  };

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
    const newMatchData = {
      ...(results[matchId] || {}),
      homeScore,
      awayScore,
      isLive,
      ...(liveMinute && { liveMinute })
    };
    saveResults({ ...results, [matchId]: newMatchData });
  };

  const removeMatchResult = async (matchId) => {
    const next = { ...results };
    delete next[matchId];
    saveResults(next);
  };

  const addMatchEvent = async (matchId, event) => {
    const currentData = results[matchId] || { homeScore: 0, awayScore: 0, isLive: true };
    const newEvents = [...(currentData.events || []), event];
    saveResults({ ...results, [matchId]: { ...currentData, events: newEvents } });
  };

  const removeMatchEvent = async (matchId, eventId) => {
    const currentData = results[matchId];
    if (!currentData || !currentData.events) return;
    const newEvents = currentData.events.filter(e => e.id !== eventId);
    saveResults({ ...results, [matchId]: { ...currentData, events: newEvents } });
  };

  const updateLineups = async (matchId, homeFormation, awayFormation, homeLineup, awayLineup) => {
    const currentData = results[matchId] || { homeScore: 0, awayScore: 0 };
    saveResults({
      ...results,
      [matchId]: { ...currentData, homeFormation, awayFormation, homeLineup, awayLineup }
    });
  };

  const standings = useMemo(() => calculateGroupStandings(FIXTURES, results), [results]);
  const topScorers = useMemo(() => getTopScorers(results), [results]);
  const allCards = useMemo(() => getAllCards(results), [results]);
  
  const liveMatches = useMemo(() => FIXTURES.filter(f => results[f.id]?.isLive), [results]);
  const todaysFixtures = useMemo(() => {
    const today = new Date().toISOString().slice(0, 10);
    return FIXTURES.filter(f => f.isoDate === today);
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
      todaysFixtures,
      isAdmin,
      loading: false,
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
