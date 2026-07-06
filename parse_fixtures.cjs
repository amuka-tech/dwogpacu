const fs = require('fs');

const teamMap = {
  "Kioga Const.": "Kioga Constituency",
  "Erute South": "Erute South",
  "Dokolo South": "Dokolo South",
  "Apac Mun.": "Apac Municipality",
  "Ajuri Const.": "Ajuri Constituency",
  "Oyam South": "Oyam South",
  "Kole South": "Kole South",
  "Maruzi North": "Maaruzi North",
  "Otuke Const.": "Otuke Constituency",
  "Kwania Const.": "Kwania Constituency",
  "Otuke East": "Otuke East",
  "Erute North": "Erute North",
  "Moroto Const.": "Moroto Constituency",
  "Dokolo North": "Dokolo North",
  "Maruzi Const.": "Maruzi Constituency",
  "Lira City East": "Lira City East",
  "Kole North": "Kole North",
  "Oyam North": "Oyam North",
  "Lira City West": "Lira City West",
  "Kwania North": "Kwania North",
  "Kioga North": "Kioga North",
  "Kyoga North": "Kioga North",

  // Knockout Placeholders
  "WINNER A": "WINNER A",
  "RUNNER UP B": "RUNNER UP B",
  "WINNER B": "WINNER B",
  "RUNNER UP A": "RUNNER UP A",
  "WINNER C": "WINNER C",
  "RUNNER UP D": "RUNNER UP D",
  "WINNER D": "WINNER D",
  "RUNNER UP C": "RUNNER UP C",
  "WINNER QT 1": "WINNER QT 1",
  "WINNER QT 2": "WINNER QT 2",
  "WINNER QT 3": "WINNER QT 3",
  "WINNER QT 4": "WINNER QT 4",
  "WINNER SM 1": "WINNER SM 1",
  "WINNER SM 2": "WINNER SM 2"
};

const rawFixtures = [
  // Group Stage
  ["001", "Opening Ceremony", "Sunday 5th July, 2026", "2026-07-05", "Kioga Const.", "Erute South", "A", "UTC Lira", "3:00pm"],
  ["002", "Match Day One", "Monday 6th July, 2026", "2026-07-06", "Dokolo South", "Apac Mun.", "A", "UTC Lira", "9:00am"],
  ["003", "Match Day One", "Monday 6th July, 2026", "2026-07-06", "Ajuri Const.", "Oyam South", "A", "LTC", "9:00am"],
  ["004", "Match Day One", "Monday 6th July, 2026", "2026-07-06", "Kole South", "Maruzi North", "B", "UTC Lira", "11:00am"],
  ["005", "Match Day One", "Monday 6th July, 2026", "2026-07-06", "Otuke Const.", "Kwania Const.", "B", "LTC", "11:00am"],
  ["006", "Match Day One", "Monday 6th July, 2026", "2026-07-06", "Otuke East", "Erute North", "C", "UTC Lira", "2:00pm"],
  ["007", "Match Day One", "Monday 6th July, 2026", "2026-07-06", "Moroto Const.", "Dokolo North", "C", "LTC", "2:00pm"],
  ["008", "Match Day One", "Monday 6th July, 2026", "2026-07-06", "Maruzi Const.", "Lira City East", "D", "UTC Lira", "4:00pm"],
  ["009", "Match Day One", "Monday 6th July, 2026", "2026-07-06", "Kole North", "Oyam North", "D", "LTC", "4:00pm"],
  ["010", "Match Day Two", "Tuesday 7th July, 2026", "2026-07-07", "Dokolo North", "Lira City West", "C", "UTC Lira", "8:00am"],
  ["011", "Match Day Two", "Tuesday 7th July, 2026", "2026-07-07", "Moroto Const.", "Erute North", "C", "LTC", "9:00am"],
  ["012", "Match Day Two", "Tuesday 7th July, 2026", "2026-07-07", "Oyam North", "Kwania North", "D", "UTC Lira", "10:00am"],
  ["013", "Match Day Two", "Tuesday 7th July, 2026", "2026-07-07", "Kole North", "Lira City East", "D", "LTC", "11:00am"],
  ["014", "Match Day Two", "Tuesday 7th July, 2026", "2026-07-07", "Apac Mun.", "Kioga Const.", "A", "UTC Lira", "12:00pm"],
  ["015", "Match Day Two", "Tuesday 7th July, 2026", "2026-07-07", "Erute South", "Ajuri Const.", "A", "LTC", "2:00pm"],
  ["016", "Match Day Two", "Tuesday 7th July, 2026", "2026-07-07", "Dokolo South", "Oyam South", "A", "UTC Lira", "2:00pm"],
  ["017", "Match Day Two", "Tuesday 7th July, 2026", "2026-07-07", "Kwania Const.", "Kioga North", "B", "LTC", "4:00pm"],
  ["018", "Match Day Two", "Tuesday 7th July, 2026", "2026-07-07", "Otuke Const.", "Maruzi North", "B", "UTC Lira", "4:00pm"],
  ["019", "Match Day Three", "Wednesday 8th July, 2026", "2026-07-08", "Kole North", "Maruzi Const.", "D", "UTC Lira", "8:00am"],
  ["020", "Match Day Three", "Wednesday 8th July, 2026", "2026-07-08", "Kwania North", "Lira City East", "D", "LTC", "9:00am"],
  ["021", "Match Day Three", "Wednesday 8th July, 2026", "2026-07-08", "Moroto Const.", "Otuke East", "C", "UTC Lira", "10:00am"],
  ["022", "Match Day Three", "Wednesday 8th July, 2026", "2026-07-08", "Lira City West", "Erute North", "C", "LTC", "11:00am"],
  ["023", "Match Day Three", "Wednesday 8th July, 2026", "2026-07-08", "Otuke Const.", "Kole South", "B", "UTC Lira", "12:00pm"],
  ["024", "Match Day Three", "Wednesday 8th July, 2026", "2026-07-08", "Kioga North", "Maruzi North", "B", "LTC", "2:00pm"],
  ["025", "Match Day Three", "Wednesday 8th July, 2026", "2026-07-08", "Dokolo South", "Ajuri Const.", "A", "UTC Lira", "2:00pm"],
  ["026", "Match Day Three", "Wednesday 8th July, 2026", "2026-07-08", "Erute South", "Apac Mun.", "A", "LTC", "4:00pm"],
  ["027", "Match Day Three", "Wednesday 8th July, 2026", "2026-07-08", "Oyam South", "Kioga Const.", "A", "UTC Lira", "4:00pm"],
  ["028", "Match Day Four", "Thursday 9th July, 2026", "2026-07-09", "Maruzi North", "Kwania Const.", "B", "UTC Lira", "8:00am"],
  ["029", "Match Day Four", "Thursday 9th July, 2026", "2026-07-09", "Kyoga North", "Kole South", "B", "LTC", "9:00am"],
  ["030", "Match Day Four", "Thursday 9th July, 2026", "2026-07-09", "Apac Mun.", "Oyam South", "A", "UTC Lira", "10:00am"],
  ["031", "Match Day Four", "Thursday 9th July, 2026", "2026-07-09", "Kioga Const.", "Ajuri Const.", "A", "LTC", "11:00am"],
  ["032", "Match Day Four", "Thursday 9th July, 2026", "2026-07-09", "Dokolo South", "Erute South", "A", "UTC Lira", "12:00pm"],
  ["033", "Match Day Four", "Thursday 9th July, 2026", "2026-07-09", "Lira City East", "Oyam North", "D", "LTC", "2:00pm"],
  ["034", "Match Day Four", "Thursday 9th July, 2026", "2026-07-09", "Kwania North", "Maruzi Const.", "D", "UTC Lira", "2:00pm"],
  ["035", "Match Day Four", "Thursday 9th July, 2026", "2026-07-09", "Erute North", "Dokolo North", "C", "LTC", "4:00pm"],
  ["036", "Match Day Four", "Thursday 9th July, 2026", "2026-07-09", "Lira City West", "Otuke East", "C", "UTC Lira", "4:00pm"],
  ["037", "Match Day Five", "Friday 10th July, 2026", "2026-07-10", "Apac Mun.", "Ajuri Const.", "A", "UTC Lira", "8:00am"],
  ["038", "Match Day Five", "Friday 10th July, 2026", "2026-07-10", "Kioga Const.", "Dokolo South", "A", "LTC", "9:00am"],
  ["039", "Match Day Five", "Friday 10th July, 2026", "2026-07-10", "Oyam South", "Erute South", "A", "UTC Lira", "10:00am"],
  ["040", "Match Day Five", "Friday 10th July, 2026", "2026-07-10", "Kioga North", "Otuke Const.", "B", "LTC", "11:00am"],
  ["041", "Match Day Five", "Friday 10th July, 2026", "2026-07-10", "Kwania Const.", "Kole South", "B", "UTC Lira", "12:00pm"],
  ["042", "Match Day Five", "Friday 10th July, 2026", "2026-07-10", "Dokolo North", "Otuke East", "C", "LTC", "2:00pm"],
  ["043", "Match Day Five", "Friday 10th July, 2026", "2026-07-10", "Lira City West", "Moroto Const.", "C", "UTC Lira", "2:00pm"],
  ["044", "Match Day Five", "Friday 10th July, 2026", "2026-07-10", "Kwania North", "Kole North", "D", "LTC", "4:00pm"],
  ["045", "Match Day Five", "Friday 10th July, 2026", "2026-07-10", "Oyam North", "Maruzi Const.", "D", "UTC Lira", "4:00pm"],

  // Knockouts (Quarter Finals - First Leg)
  ["046", "Quarter Finals", "Sunday 12th July, 2026", "2026-07-12", "WINNER A", "RUNNER UP B", "Q1 L1", "UTC Lira", "3:00pm"],
  ["047", "Quarter Finals", "Monday 13th July, 2026", "2026-07-13", "WINNER B", "RUNNER UP A", "Q2 L1", "UTC Lira", "3:00pm"],
  ["048", "Quarter Finals", "Tuesday 14th July, 2026", "2026-07-14", "WINNER C", "RUNNER UP D", "Q3 L1", "UTC Lira", "3:00pm"],
  ["049", "Quarter Finals", "Wednesday 15th July, 2026", "2026-07-15", "WINNER D", "RUNNER UP C", "Q4 L1", "UTC Lira", "3:00pm"],

  // Knockouts (Quarter Finals - Second Leg)
  ["050", "Quarter Finals", "Thursday 16th July, 2026", "2026-07-16", "RUNNER UP B", "WINNER A", "Q1 L2", "UTC Lira", "3:00pm"],
  ["051", "Quarter Finals", "Friday 17th July, 2026", "2026-07-17", "RUNNER UP A", "WINNER B", "Q2 L2", "UTC Lira", "3:00pm"],
  ["052", "Quarter Finals", "Saturday 18th July, 2026", "2026-07-18", "RUNNER UP D", "WINNER C", "Q3 L2", "UTC Lira", "3:00pm"],
  ["053", "Quarter Finals", "Sunday 19th July, 2026", "2026-07-19", "RUNNER UP C", "WINNER D", "Q4 L2", "UTC Lira", "3:00pm"],

  // Knockouts (Semi Finals - First Leg)
  ["054", "Semi Finals", "Wednesday 22nd July, 2026", "2026-07-22", "WINNER QT 1", "WINNER QT 3", "S1 L1", "UTC Lira", "3:00pm"],
  ["055", "Semi Finals", "Thursday 23rd July, 2026", "2026-07-23", "WINNER QT 2", "WINNER QT 4", "S2 L1", "UTC Lira", "3:00pm"],

  // Knockouts (Semi Finals - Second Leg)
  ["056", "Semi Finals", "Saturday 25th July, 2026", "2026-07-25", "WINNER QT 3", "WINNER QT 1", "S1 L2", "UTC Lira", "3:00pm"],
  ["057", "Semi Finals", "Sunday 26th July, 2026", "2026-07-26", "WINNER QT 4", "WINNER QT 2", "S2 L2", "UTC Lira", "3:00pm"],

  // Final
  ["058", "Final", "Sunday 2nd August, 2026", "2026-08-02", "WINNER SM 1", "WINNER SM 2", "F", "UTC Lira", "3:00pm"]
];

const fixtures = rawFixtures.map(f => {
  const home = teamMap[f[4]] || f[4];
  const away = teamMap[f[5]] || f[5];
  const isKnockout = parseInt(f[0], 10) >= 46;
  
  return {
    id: f[0],
    day: f[1],
    date: f[2],
    isoDate: f[3],
    time: f[8],
    homeTeamId: home,
    awayTeamId: away,
    group: isKnockout ? null : f[6],
    stage: isKnockout ? 'knockout' : 'group',
    venue: f[7],
    status: "Upcoming",
    homeScore: null,
    awayScore: null
  }
});

const content = 'export const FIXTURES = ' + JSON.stringify(fixtures, null, 2) + ';\n';
fs.writeFileSync('./src/data/fixtures.js', content);
console.log('Successfully wrote all 58 fixtures to src/data/fixtures.js');
