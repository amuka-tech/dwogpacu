export const groups = {
  A: ["Kioga Constituency", "Erute South", "Oyam South", "Dokolo South", "Ajuri Constituency", "Apac Municipality"],
  B: ["Kioga North", "Kole South", "Kwania Constituency", "Otuke Constituency", "Maruzi North"],
  C: ["Lira City West", "Otuke East", "Dokolo North", "Moroto Constituency", "Erute North"],
  D: ["Kwania North", "Maruzi Constituency", "Oyam North", "Kole North", "Lira City East"]
};

// Generate mock standings based on groups
export const getMockStandings = () => {
  const standings = {};
  Object.keys(groups).forEach(group => {
    standings[group] = groups[group].map(team => ({
      team,
      p: 0,
      w: 0,
      d: 0,
      l: 0,
      gf: 0,
      ga: 0,
      gd: 0,
      pts: 0
    }));
  });
  return standings;
};

export const fixtures = [
  { id: "001", day: "Match Day One", date: "Monday, July 6th, 2026", time: "14:00", home: "Kioga Constituency", away: "Erute South", group: "A", venue: "UTC Lira", status: "Upcoming", homeScore: null, awayScore: null },
  { id: "002", day: "Match Day One", date: "Monday, July 6th, 2026", time: "16:00", home: "Oyam South", away: "Dokolo South", group: "A", venue: "UTC Lira", status: "Upcoming", homeScore: null, awayScore: null },
  { id: "003", day: "Match Day One", date: "Monday, July 6th, 2026", time: "14:00", home: "Ajuri Constituency", away: "Apac Municipality", group: "A", venue: "LTC", status: "Upcoming", homeScore: null, awayScore: null },
  { id: "004", day: "Match Day Two", date: "Tuesday, July 7th, 2026", time: "14:00", home: "Kioga North", away: "Kole South", group: "B", venue: "UTC Lira", status: "Upcoming", homeScore: null, awayScore: null },
  { id: "005", day: "Match Day Two", date: "Tuesday, July 7th, 2026", time: "16:00", home: "Kwania Constituency", away: "Otuke Constituency", group: "B", venue: "UTC Lira", status: "Upcoming", homeScore: null, awayScore: null },
  { id: "006", day: "Match Day Three", date: "Wednesday, July 8th, 2026", time: "14:00", home: "Lira City West", away: "Otuke East", group: "C", venue: "UTC Lira", status: "Upcoming", homeScore: null, awayScore: null },
  { id: "007", day: "Match Day Three", date: "Wednesday, July 8th, 2026", time: "16:00", home: "Dokolo North", away: "Moroto Constituency", group: "C", venue: "UTC Lira", status: "Upcoming", homeScore: null, awayScore: null },
  { id: "008", day: "Match Day Four", date: "Thursday, July 9th, 2026", time: "14:00", home: "Kwania North", away: "Maruzi Constituency", group: "D", venue: "UTC Lira", status: "Upcoming", homeScore: null, awayScore: null },
  { id: "009", day: "Match Day Four", date: "Thursday, July 9th, 2026", time: "16:00", home: "Oyam North", away: "Kole North", group: "D", venue: "UTC Lira", status: "Upcoming", homeScore: null, awayScore: null },
];

export const latestNews = [
  { id: 1, title: "DWOG PACU CUP 2026 Opening Ceremony Details", date: "July 1, 2026", snippet: "Join us at UTC Lira for the grand opening featuring cultural performances and the first match of the tournament." },
  { id: 2, title: "Group Stage Draw Results Announced", date: "June 25, 2026", snippet: "The official draw has concluded. Check out who your team will face in the highly anticipated group stages." },
  { id: 3, title: "Technical Committee Updates Tournament Rules", date: "June 20, 2026", snippet: "Chairman Bongo Patrick announces minor revisions to substitution rules for the upcoming tournament." }
];

export const liveMatches = [
  { id: "L01", time: "45'", home: "Kioga Constituency", away: "Erute South", group: "A", homeScore: 1, awayScore: 0 }
];
