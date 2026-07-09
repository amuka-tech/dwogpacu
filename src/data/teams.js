export const GROUPS = {
  A: ["Kioga Constituency", "Erute South", "Oyam South", "Dokolo South", "Ajuri Constituency", "Apac Municipality"],
  B: ["Kioga North", "Kole South", "Kwania Constituency", "Otuke Constituency", "Maruzi North"],
  C: ["Lira City West", "Otuke East", "Dokolo North", "Moroto Constituency", "Erute North"],
  D: ["Kwania North", "Maruzi Constituency", "Oyam North", "Kole North", "Lira City East"]
};

export const TEAMS = {};

// We will use the full name as the shortName per user request
const getShortName = (name) => {
  return name.replace(' Constituency', '').replace(' Municipality', '');
};

const colors = ['#e63946', '#f4a261', '#2a9d8f', '#264653', '#8ab17d', '#e9c46a'];

Object.values(GROUPS).flat().forEach((team, i) => {
  TEAMS[team] = { 
    id: team, 
    name: team,
    shortName: getShortName(team),
    color: colors[i % colors.length],
    logo: '/hero.png'
  };
});

// Add Knockout Teams so the app doesn't crash on undefined
const knockoutTeams = [
  "WINNER A", "RUNNER UP B", "WINNER B", "RUNNER UP A",
  "WINNER C", "RUNNER UP D", "WINNER D", "RUNNER UP C",
  "WINNER QT 1", "WINNER QT 2", "WINNER QT 3", "WINNER QT 4",
  "WINNER SM 1", "WINNER SM 2"
];

knockoutTeams.forEach(team => {
  TEAMS[team] = {
    id: team,
    name: team,
    shortName: getShortName(team),
    color: '#888',
    logo: '/hero.png'
  };
});
