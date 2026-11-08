// Pure scoring functions for the stock-ranking job. No I/O.
//
// Long score (0-100), the "quality at a fair price" view:
//   valuation 25%  forward P/E, PEG, P/B          (lower is better, sector percentile)
//   growth    25%  revenue growth, earnings growth (higher is better, sector percentile)
//   quality   25%  ROE, profit margin, debt/equity (D/E lower is better, sector percentile)
//   sentiment 15%  analyst trend, earnings surprises, insider buying (0-1 signal × 100)
//   trend     10%  price vs 200-day average
//
// Short score (0-100), the "what is moving now" view:
//   momentum  30%  1-month and 3-month return       (sector percentile)
//   news      25%  7-day headline score (70%) + change vs prior week (30%)
//   trend     20%  price vs 50-day average, 50-day vs 200-day average
//   rsi       15%  RSI(14): best between 40 and 65, penalised above 70
//   volume    10%  20-day vs 60-day average volume
//
// Any metric that is missing scores a neutral 50, and is listed in
// `components.missing`, so a stock with thin data is neither crashed out
// nor pushed to the top.

export const LONG_WEIGHTS = { valuation: 0.25, growth: 0.25, quality: 0.25, sentiment: 0.15, trend: 0.1 };
export const SHORT_WEIGHTS = { momentum: 0.3, news: 0.25, trend: 0.2, rsi: 0.15, volume: 0.1 };
export const NEUTRAL = 50;

const isNum = (v) => typeof v === "number" && Number.isFinite(v);
const clamp = (x, lo, hi) => Math.min(hi, Math.max(lo, x));
export const round = (x, dp = 2) => (isNum(x) ? Math.round(x * 10 ** dp) / 10 ** dp : null);

// ---------------------------------------------------------------------------
// Technical indicators
// ---------------------------------------------------------------------------

/** Simple moving average of the last `n` values, or null if too short. */
export function sma(values, n) {
  if (!Array.isArray(values) || values.length < n || n <= 0) return null;
  let sum = 0;
  for (let i = values.length - n; i < values.length; i++) sum += values[i];
  return sum / n;
}

/** Wilder's RSI over `period` (default 14) for the latest value. */
export function rsi(closes, period = 14) {
  if (!Array.isArray(closes) || closes.length < period + 1) return null;
  let gain = 0;
  let loss = 0;
  for (let i = 1; i <= period; i++) {
    const d = closes[i] - closes[i - 1];
    if (d >= 0) gain += d;
    else loss -= d;
  }
  let avgGain = gain / period;
  let avgLoss = loss / period;
  for (let i = period + 1; i < closes.length; i++) {
    const d = closes[i] - closes[i - 1];
    avgGain = (avgGain * (period - 1) + Math.max(d, 0)) / period;
    avgLoss = (avgLoss * (period - 1) + Math.max(-d, 0)) / period;
  }
  if (avgLoss === 0) return avgGain === 0 ? 50 : 100;
  const rs = avgGain / avgLoss;
  return 100 - 100 / (1 + rs);
}

/** Fractional return over the last `bars` bars (0.05 = +5%). */
export function pctReturn(closes, bars) {
  if (!Array.isArray(closes) || closes.length <= bars) return null;
  const start = closes[closes.length - 1 - bars];
  const end = closes[closes.length - 1];
  if (!isNum(start) || !isNum(end) || start === 0) return null;
  return end / start - 1;
}

/** Average volume of the last `short` bars divided by the last `long` bars. */
export function volumeRatio(volumes, short = 20, long = 60) {
  const v = (volumes || []).filter(isNum);
  if (v.length < long) return null;
  const s = sma(v, short);
  const l = sma(v, long);
  return l ? s / l : null;
}

/** Technical snapshot from daily bars [{ close, volume }], oldest first. */
export function computeTechnicals(history) {
  const closes = (history || []).map((b) => b.close).filter(isNum);
  const volumes = (history || []).map((b) => b.volume);
  return {
    price: closes.length ? closes[closes.length - 1] : null,
    sma50: sma(closes, 50),
    sma200: sma(closes, 200),
    rsi14: rsi(closes, 14),
    ret1m: pctReturn(closes, 21),
    ret3m: pctReturn(closes, 63),
    volRatio: volumeRatio(volumes, 20, 60),
  };
}

// ---------------------------------------------------------------------------
// Percentile scoring
// ---------------------------------------------------------------------------

/**
 * Percentile (0-100) of `value` within `population`. Ties count half, so
 * equal values share a score. Lower values score higher when
 * `higherIsBetter` is false. Missing value → null.
 */
export function percentileRank(population, value, higherIsBetter = true) {
  if (!isNum(value)) return null;
  const pop = population.filter(isNum);
  if (pop.length <= 1) return NEUTRAL;
  let below = 0;
  let equal = 0;
  for (const v of pop) {
    if (v < value) below += 1;
    else if (v === value) equal += 1;
  }
  // When the value is part of the population, exclude itself from the
  // comparison set; otherwise compare against everyone.
  const pct =
    equal > 0
      ? ((below + (equal - 1) / 2) / (pop.length - 1)) * 100
      : (below / pop.length) * 100;
  return higherIsBetter ? pct : 100 - pct;
}

/**
 * Valuation ratios where a negative number means losses (negative earnings
 * or book value). Those are treated as the worst valuation, not the best.
 */
export function cleanRatio(v) {
  if (!isNum(v)) return null;
  return v <= 0 ? Number.POSITIVE_INFINITY : v;
}

const percentileOrInf = (pop, value, higherIsBetter) => {
  if (value === Number.POSITIVE_INFINITY) return higherIsBetter ? 100 : 0;
  return percentileRank(pop.filter((v) => v !== Number.POSITIVE_INFINITY), value, higherIsBetter);
};

/** Mean of the non-null scores, or NEUTRAL when all are null. */
function meanOrNeutral(scores) {
  const have = scores.filter(isNum);
  return have.length ? have.reduce((a, b) => a + b, 0) / have.length : NEUTRAL;
}

// ---------------------------------------------------------------------------
// Component transforms
// ---------------------------------------------------------------------------

/** Distance above/below an average → 0-100. 0% → 50, ±10% saturates. */
export function distanceScore(value, average, saturatePct = 10) {
  if (!isNum(value) || !isNum(average) || average === 0) return null;
  const pct = (value / average - 1) * 100;
  return clamp(50 + (pct / saturatePct) * 50, 0, 100);
}

/**
 * RSI → 0-100. 100 inside [40, 65]; falls linearly to 0 at RSI 20 on the
 * oversold side; above 65 falls to 50 at 70 and 0 at 85 (overbought penalty).
 */
export function rsiScore(r) {
  if (!isNum(r)) return null;
  if (r >= 40 && r <= 65) return 100;
  if (r < 40) return clamp(((r - 20) / 20) * 100, 0, 100);
  if (r <= 70) return 100 - ((r - 65) / 5) * 50;
  return clamp(50 - ((r - 70) / 15) * 50, 0, 100);
}

/** Volume ratio → 0-100. 1.0 → 50, 2.0+ → 100, 0.5- → 0. */
export function volumeScore(ratio) {
  if (!isNum(ratio) || ratio <= 0) return null;
  return clamp(50 + Math.log2(ratio) * 50, 0, 100);
}

/** News score [-1, 1] → 0-100. */
export const newsLevelScore = (s) => (isNum(s) ? clamp((s + 1) * 50, 0, 100) : null);
/** Week-over-week change in news score → 0-100 (±0.5 saturates). */
export const newsChangeScore = (c) => (isNum(c) ? clamp(50 + c * 100, 0, 100) : null);

// ---------------------------------------------------------------------------
// Scoring a sector
// ---------------------------------------------------------------------------

/**
 * Scores all stocks in ONE sector (percentiles are within-sector).
 *
 * Input rows: {
 *   ticker,
 *   fundamentals: { forwardPE, peg, priceToBook, revenueGrowth, earningsGrowth,
 *                   roe, profitMargin, debtToEquity },
 *   technicals:   { price, sma50, sma200, rsi14, ret1m, ret3m, volRatio },
 *   fundamentalSentiment: 0..1 | null,
 *   news: { score: -1..1 | null, change: number | null },
 * }
 * Returns the rows with longScore, shortScore, components added.
 */
export function scoreSector(rows) {
  const f = (k) => rows.map((r) => r.fundamentals?.[k]);
  const t = (k) => rows.map((r) => r.technicals?.[k]);
  const pops = {
    forwardPE: f("forwardPE").map(cleanRatio),
    peg: f("peg").map(cleanRatio),
    priceToBook: f("priceToBook").map(cleanRatio),
    revenueGrowth: f("revenueGrowth"),
    earningsGrowth: f("earningsGrowth"),
    roe: f("roe"),
    profitMargin: f("profitMargin"),
    debtToEquity: f("debtToEquity").map((v) => (isNum(v) && v < 0 ? Number.POSITIVE_INFINITY : v)),
    ret1m: t("ret1m"),
    ret3m: t("ret3m"),
  };

  return rows.map((row, i) => {
    const missing = [];
    const pick = (name, score) => {
      if (!isNum(score)) missing.push(name);
      return score;
    };
    const fv = row.fundamentals || {};
    const tv = row.technicals || {};

    // Long components
    const valuation = meanOrNeutral([
      pick("forwardPE", percentileOrInf(pops.forwardPE, pops.forwardPE[i], false)),
      pick("peg", percentileOrInf(pops.peg, pops.peg[i], false)),
      pick("priceToBook", percentileOrInf(pops.priceToBook, pops.priceToBook[i], false)),
    ]);
    const growth = meanOrNeutral([
      pick("revenueGrowth", percentileRank(pops.revenueGrowth, fv.revenueGrowth, true)),
      pick("earningsGrowth", percentileRank(pops.earningsGrowth, fv.earningsGrowth, true)),
    ]);
    const quality = meanOrNeutral([
      pick("roe", percentileRank(pops.roe, fv.roe, true)),
      pick("profitMargin", percentileRank(pops.profitMargin, fv.profitMargin, true)),
      pick("debtToEquity", percentileOrInf(pops.debtToEquity, pops.debtToEquity[i], false)),
    ]);
    const fs = row.fundamentalSentiment;
    const sentiment = meanOrNeutral([pick("fundamentalSentiment", isNum(fs) ? fs * 100 : null)]);
    const longTrend = meanOrNeutral([pick("sma200", distanceScore(tv.price, tv.sma200, 10))]);

    // Short components
    const momentum = meanOrNeutral([
      pick("ret1m", percentileRank(pops.ret1m, tv.ret1m, true)),
      pick("ret3m", percentileRank(pops.ret3m, tv.ret3m, true)),
    ]);
    const lvl = pick("newsScore", newsLevelScore(row.news?.score));
    const chg = pick("newsChange", newsChangeScore(row.news?.change));
    const news = isNum(lvl) ? (isNum(chg) ? 0.7 * lvl + 0.3 * chg : lvl) : isNum(chg) ? chg : NEUTRAL;
    const shortTrend = meanOrNeutral([
      pick("sma50", distanceScore(tv.price, tv.sma50, 8)),
      pick("sma50vs200", distanceScore(tv.sma50, tv.sma200, 10)),
    ]);
    const rsiC = meanOrNeutral([pick("rsi14", rsiScore(tv.rsi14))]);
    const volume = meanOrNeutral([pick("volRatio", volumeScore(tv.volRatio))]);

    const long = { valuation, growth, quality, sentiment, trend: longTrend };
    const short = { momentum, news, trend: shortTrend, rsi: rsiC, volume };
    const longScore = weighted(long, LONG_WEIGHTS);
    const shortScore = weighted(short, SHORT_WEIGHTS);

    return {
      ...row,
      longScore: round(longScore, 2),
      shortScore: round(shortScore, 2),
      components: {
        long: roundAll(long),
        short: roundAll(short),
        missing: [...new Set(missing)],
      },
    };
  });
}

function weighted(parts, weights) {
  return Object.entries(weights).reduce((acc, [k, w]) => acc + (isNum(parts[k]) ? parts[k] : NEUTRAL) * w, 0);
}
const roundAll = (o) => Object.fromEntries(Object.entries(o).map(([k, v]) => [k, round(v, 1)]));

// ---------------------------------------------------------------------------
// Ranking and rank changes
// ---------------------------------------------------------------------------

/**
 * Assigns `${rankKey}` = 1..n within each sector by `scoreKey` descending.
 * Ties broken by ticker for a stable order. Mutates and returns rows.
 */
export function rankWithinSector(rows, scoreKey, rankKey) {
  const bySector = new Map();
  for (const r of rows) {
    if (!bySector.has(r.sector)) bySector.set(r.sector, []);
    bySector.get(r.sector).push(r);
  }
  for (const group of bySector.values()) {
    group
      .sort((a, b) => (b[scoreKey] ?? -Infinity) - (a[scoreKey] ?? -Infinity) || a.ticker.localeCompare(b.ticker))
      .forEach((r, i) => {
        r[rankKey] = i + 1;
      });
  }
  return rows;
}

/**
 * Movement badge for one stock relative to a top-N list.
 *   'new'     not in yesterday's data, or entered the top N today
 *   'dropped' was in the top N, is not any more (or has no rank today)
 *   'up' / 'down' / 'same' otherwise (lower rank number = better)
 */
export function rankChange(prevRank, rank, topN = 10) {
  const inTop = (r) => isNum(r) && r <= topN;
  if (!isNum(rank)) return inTop(prevRank) ? "dropped" : null;
  if (!isNum(prevRank)) return "new";
  if (inTop(rank) && !inTop(prevRank)) return "new";
  if (!inTop(rank) && inTop(prevRank)) return "dropped";
  if (rank < prevRank) return "up";
  if (rank > prevRank) return "down";
  return "same";
}

/**
 * Copies yesterday's ranks onto today's rows as prevLongRank/prevShortRank
 * and adds longMove/shortMove badges. Previous ranks only count when the
 * stock was in the same sector. Returns { rows, dropped } where `dropped`
 * lists stocks in yesterday's top N that fell out (per sector and list).
 */
export function applyRankChanges(todayRows, prevRows, topN = 10) {
  const prev = new Map((prevRows || []).map((r) => [r.ticker, r]));
  for (const r of todayRows) {
    const p = prev.get(r.ticker);
    const same = p && p.sector === r.sector;
    r.prevLongRank = same && isNum(p.longRank) ? p.longRank : null;
    r.prevShortRank = same && isNum(p.shortRank) ? p.shortRank : null;
    r.longMove = rankChange(r.prevLongRank, r.longRank, topN);
    r.shortMove = rankChange(r.prevShortRank, r.shortRank, topN);
  }
  const todayMap = new Map(todayRows.map((r) => [r.ticker, r]));
  const dropped = [];
  for (const p of prevRows || []) {
    const t = todayMap.get(p.ticker);
    for (const [key, list] of [["longRank", "long"], ["shortRank", "short"]]) {
      if (!isNum(p[key]) || p[key] > topN) continue;
      const nowRank = t && t.sector === p.sector ? t[key] : null;
      if (!isNum(nowRank) || nowRank > topN) {
        dropped.push({ ticker: p.ticker, sector: p.sector, list, prevRank: p[key], rank: nowRank ?? null });
      }
    }
  }
  return { rows: todayRows, dropped };
}
