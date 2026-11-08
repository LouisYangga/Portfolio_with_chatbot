// Two trading days of rankings for the rank-change tests.
// Tech list is ranked by longScore/shortScore; "MOVE" changes sector on day 2.
export const day1 = [
  { ticker: "AAA", sector: "Tech", longRank: 1, shortRank: 3 },
  { ticker: "BBB", sector: "Tech", longRank: 2, shortRank: 1 },
  { ticker: "CCC", sector: "Tech", longRank: 3, shortRank: 2 },
  { ticker: "DDD", sector: "Tech", longRank: 4, shortRank: 4 },
  { ticker: "GONE", sector: "Tech", longRank: 5, shortRank: 5 },
  { ticker: "MOVE", sector: "Energy", longRank: 1, shortRank: 1 },
];

// Day 2 scores (ranks are computed by rankWithinSector in the test).
export const day2 = [
  { ticker: "AAA", sector: "Tech", longScore: 70, shortScore: 60 },
  { ticker: "BBB", sector: "Tech", longScore: 80, shortScore: 55 },
  { ticker: "CCC", sector: "Tech", longScore: 60, shortScore: 90 },
  { ticker: "DDD", sector: "Tech", longScore: 50, shortScore: 50 },
  { ticker: "NEWB", sector: "Tech", longScore: 65, shortScore: 40 },
  { ticker: "MOVE", sector: "Utilities", longScore: 55, shortScore: 55 },
];
