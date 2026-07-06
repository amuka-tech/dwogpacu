// ============================================================
// Tournament Engine — Pure calculation functions
// DWOG PACU CUP 2026
// ============================================================
import { GROUPS, TEAMS } from '../data/teams';

/**
 * Calculate group standings from fixtures + stored results.
 * Tiebreakers: pts → h2h pts → h2h GD → overall GD → overall GF → name
 */
export function calculateGroupStandings(fixtures, results) {
  const standings = {};

  Object.entries(GROUPS).forEach(([group, teamIds]) => {
    const rows = {};
    teamIds.forEach(id => {
      rows[id] = {
        team: TEAMS[id],
        p: 0, w: 0, d: 0, l: 0,
        gf: 0, ga: 0, gd: 0, pts: 0,
        form: [],            // last 5: 'W'|'D'|'L'
        h2h: {},             // h2h[opponentId] = { pts, gd, gf }
      };
    });

    // Process completed group-stage fixtures
    fixtures
      .filter(f => f.group === group && f.stage === 'group')
      .forEach(f => {
        const r = results[f.id];
        if (r == null || r.homeScore === null || r.awayScore === null) return;

        const hs = Number(r.homeScore);
        const as = Number(r.awayScore);
        const home = rows[f.homeTeamId];
        const away = rows[f.awayTeamId];
        if (!home || !away) return;

        home.p++; away.p++;
        home.gf += hs; home.ga += as;
        away.gf += as; away.ga += hs;

        // Init h2h buckets
        if (!home.h2h[f.awayTeamId]) home.h2h[f.awayTeamId] = { pts: 0, gd: 0, gf: 0 };
        if (!away.h2h[f.homeTeamId]) away.h2h[f.homeTeamId] = { pts: 0, gd: 0, gf: 0 };

        if (hs > as) {
          home.w++; home.pts += 3; away.l++;
          home.form.push('W'); away.form.push('L');
          home.h2h[f.awayTeamId].pts += 3;
          home.h2h[f.awayTeamId].gd  += hs - as;
          home.h2h[f.awayTeamId].gf  += hs;
          away.h2h[f.homeTeamId].gd  -= hs - as;
          away.h2h[f.homeTeamId].gf  += as;
        } else if (as > hs) {
          away.w++; away.pts += 3; home.l++;
          away.form.push('W'); home.form.push('L');
          away.h2h[f.homeTeamId].pts += 3;
          away.h2h[f.homeTeamId].gd  += as - hs;
          away.h2h[f.homeTeamId].gf  += as;
          home.h2h[f.awayTeamId].gd  -= as - hs;
          home.h2h[f.awayTeamId].gf  += hs;
        } else {
          home.d++; home.pts++; away.d++; away.pts++;
          home.form.push('D'); away.form.push('D');
          home.h2h[f.awayTeamId].pts += 1;
          away.h2h[f.homeTeamId].pts += 1;
        }
      });

    // Compute goal difference
    Object.values(rows).forEach(r => { r.gd = r.gf - r.ga; });

    // Sort with tiebreakers
    standings[group] = Object.values(rows).sort((a, b) => {
      if (b.pts !== a.pts) return b.pts - a.pts;
      // Head-to-head pts among tied teams (simplified: direct if same pts)
      const aH2H = (a.h2h[b.team.id] || { pts: 0 }).pts;
      const bH2H = (b.h2h[a.team.id] || { pts: 0 }).pts;
      if (bH2H !== aH2H) return bH2H - aH2H;
      // H2H GD
      const aHGD = (a.h2h[b.team.id] || { gd: 0 }).gd;
      const bHGD = (b.h2h[a.team.id] || { gd: 0 }).gd;
      if (bHGD !== aHGD) return bHGD - aHGD;
      // Overall GD
      if (b.gd !== a.gd) return b.gd - a.gd;
      // Overall GF
      if (b.gf !== a.gf) return b.gf - a.gf;
      // Alphabetical
      return a.team.name.localeCompare(b.team.name);
    });
  });

  return standings;
}

/**
 * Get top scorers across all matches.
 * Returns array of { playerName, teamId, goals, assists }
 */
export function getTopScorers(results) {
  const scorers = {};

  Object.values(results).forEach(r => {
    if (!r || !r.events) return;
    r.events.forEach(ev => {
      if (ev.type !== 'goal' && ev.type !== 'penalty') return;
      const key = `${ev.playerName}__${ev.teamId}`;
      if (!scorers[key]) {
        scorers[key] = { playerName: ev.playerName, teamId: ev.teamId, goals: 0, assists: 0 };
      }
      scorers[key].goals++;
      if (ev.assistBy) {
        const aKey = `${ev.assistBy}__${ev.teamId}`;
        if (!scorers[aKey]) scorers[aKey] = { playerName: ev.assistBy, teamId: ev.teamId, goals: 0, assists: 0 };
        scorers[aKey].assists++;
      }
    });
  });

  return Object.values(scorers).sort((a, b) => b.goals - a.goals || b.assists - a.assists);
}

/**
 * Get all cards across all matches.
 * Returns array of { playerName, teamId, type:'yellow'|'red', matchId }
 */
export function getAllCards(results) {
  const cards = [];
  Object.entries(results).forEach(([matchId, r]) => {
    if (!r || !r.events) return;
    r.events.forEach(ev => {
      if (ev.type === 'yellow_card' || ev.type === 'red_card') {
        cards.push({ ...ev, matchId });
      }
    });
  });
  return cards;
}

/**
 * Derive match status from date/time string.
 * Returns 'live' | 'completed' | 'upcoming'
 */
export function getMatchStatus(fixture, result) {
  if (result && result.homeScore !== null && result.awayScore !== null) return 'completed';
  if (result && result.isLive) return 'live';
  const matchDT = new Date(`${fixture.isoDate}T${fixture.time}:00`);
  const now = new Date();
  if (now > matchDT) return 'upcoming'; // past but no result yet
  return 'upcoming';
}

/**
 * Returns the form guide (last 5 matches) for a specific team.
 * W = Win, D = Draw, L = Loss
 */
export function getTeamForm(teamId, fixtures, results) {
  const teamFixtures = fixtures.filter(f => f.homeTeamId === teamId || f.awayTeamId === teamId);
  const form = [];
  
  for (const f of teamFixtures) {
    const r = results[f.id];
    if (r == null || r.homeScore === null || r.awayScore === null) continue;
    
    const isHome = f.homeTeamId === teamId;
    const teamScore = isHome ? Number(r.homeScore) : Number(r.awayScore);
    const oppScore = isHome ? Number(r.awayScore) : Number(r.homeScore);
    
    if (teamScore > oppScore) form.push('W');
    else if (teamScore < oppScore) form.push('L');
    else form.push('D');
  }
  
  // Return only the last 5
  return form.slice(-5);
}
