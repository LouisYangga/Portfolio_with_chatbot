// News and analyst sentiment for the stock-ranking job.
//
// Headline scoring is lexicon based (the `sentiment` npm package, AFINN-165)
// plus finance-specific words and phrases that AFINN does not know or gets
// wrong ("beats", "downgrade", "guidance cut"). Each headline gets a score in
// [-1, 1]. A ticker's news score is a recency-weighted mean (half-life 2 days)
// shrunk toward 0 when there are only a few headlines, so one lucky headline
// does not top a sector.
//
// Optional: SENTIMENT_MODE=llm re-scores headlines with OpenAI, but only for
// the candidates the job passes in (top ~60), to keep cost bounded.
//
// Analyst trend, earnings surprises and insider buying are folded into a
// separate 0-1 "fundamental sentiment" signal used by the long score.
import Sentiment from "sentiment";

const analyzer = new Sentiment();
const DAY_MS = 24 * 60 * 60 * 1000;

// Single words, AFINN scale (-5..5). Overrides AFINN where finance meaning differs.
export const FINANCE_WORDS = {
  beat: 3, beats: 3, topped: 2, tops: 2, surpass: 3, surpasses: 3, exceeds: 2,
  miss: -3, misses: -3, missed: -3,
  upgrade: 3, upgrades: 3, upgraded: 3,
  downgrade: -3, downgrades: -3, downgraded: -3,
  outperform: 2, overweight: 2, underperform: -2, underweight: -2,
  bullish: 2, bearish: -2,
  rally: 2, rallies: 2, surge: 3, surges: 3, soar: 3, soars: 3, jumps: 2, climbs: 1, gains: 1,
  plunge: -3, plunges: -3, tumble: -3, tumbles: -3, slump: -2, slumps: -2, sinks: -2, slides: -1, falls: -1,
  record: 1, buyback: 2, repurchase: 1, dividend: 1,
  layoffs: -2, recall: -2, recalls: -2, lawsuit: -2, probe: -2, investigation: -2, subpoena: -2,
  fraud: -4, bankruptcy: -4, delisting: -3, default: -3, writedown: -2, impairment: -2,
  dilution: -2, halts: -2, warns: -2, warning: -2,
  // Words AFINN rates that are neutral in market headlines.
  share: 0, shares: 0, stock: 0, stocks: 0, top: 0, like: 0, interest: 0, target: 0,
};

// Multi-word phrases, matched on the lowercased headline before word scoring.
export const FINANCE_PHRASES = [
  [/\b(raises?|raised|boosts?|lifts?|hikes?) (its |full[- ]year |annual )?(guidance|outlook|forecast)\b/, 3],
  [/\b(cuts?|lowers?|lowered|slashes?|trims?) (its |full[- ]year |annual )?(guidance|outlook|forecast)\b/, -3],
  [/\bguidance (cut|lowered|slashed)\b/, -3],
  [/\b(strong|upbeat|solid) (guidance|outlook|forecast)\b/, 2],
  [/\b(weak|soft|disappointing|downbeat) (guidance|outlook|forecast)\b/, -3],
  [/\bbeats? (estimates|expectations|forecasts|consensus)\b/, 1],
  [/\b(miss(es)?|missed) (estimates|expectations|forecasts|consensus)\b/, -1],
  [/\b(price target|pt) (raised|increased|hiked)\b|\braises? (price )?target\b/, 2],
  [/\b(price target|pt) (cut|lowered|reduced)\b|\b(cuts?|lowers?) (price )?target\b/, -2],
  [/\b(dividend|payout) (hike|increase|raise)\b|\b(raises?|hikes?) (its )?dividend\b/, 2],
  [/\b(dividend|payout) cut\b|\b(cuts?|suspends?) (its )?dividend\b/, -3],
  [/\b(52-week|all-time|record) high\b/, 2],
  [/\b(52-week|all-time) low\b/, -2],
  [/\bsell[- ]off\b/, -2],
  [/\bshort seller\b/, -2],
  [/\bbuy rating\b/, 2],
  [/\bsell rating\b/, -2],
];

const clamp = (x, lo, hi) => Math.min(hi, Math.max(lo, x));

/**
 * Scores one headline. Returns a number in [-1, 1]: sum of word and phrase
 * scores divided by 5 (one strong word saturates), then clamped.
 */
export function scoreHeadline(text) {
  if (!text || typeof text !== "string") return 0;
  const lower = text.toLowerCase();
  let phraseScore = 0;
  for (const [re, s] of FINANCE_PHRASES) if (re.test(lower)) phraseScore += s;
  const { score } = analyzer.analyze(lower, { extras: FINANCE_WORDS });
  return clamp((score + phraseScore) / 5, -1, 1);
}

/**
 * Aggregates scored articles. `articles`: [{ headline, datetime, score? }].
 * Returns { score in [-1,1] or null, count, rawMean, topHeadlines }.
 *   weight = 0.5 ^ (ageDays / halfLifeDays)
 *   score  = weightedMean * n / (n + shrinkK)   (volume adjustment)
 */
export function aggregateHeadlines(articles, { now = new Date(), halfLifeDays = 2, shrinkK = 3 } = {}) {
  const items = (articles || []).filter((a) => a && a.headline);
  if (!items.length) return { score: null, count: 0, rawMean: null, topHeadlines: [] };
  let wSum = 0;
  let sSum = 0;
  const scored = items.map((a) => {
    const s = typeof a.score === "number" ? a.score : scoreHeadline(a.headline);
    const ageDays = Math.max(0, (now - new Date(a.datetime)) / DAY_MS);
    const w = 0.5 ** (ageDays / halfLifeDays);
    wSum += w;
    sSum += w * s;
    return { ...a, score: s, weight: w };
  });
  const rawMean = wSum > 0 ? sSum / wSum : 0;
  const n = items.length;
  const score = rawMean * (n / (n + shrinkK));
  const topHeadlines = scored
    .filter((a) => a.score !== 0)
    .sort((a, b) => Math.abs(b.score * b.weight) - Math.abs(a.score * a.weight))
    .slice(0, 3)
    .map((a) => ({
      headline: a.headline,
      url: a.url || null,
      source: a.source || null,
      datetime: new Date(a.datetime),
      score: round(a.score, 3),
    }));
  return { score: round(score, 4), count: n, rawMean: round(rawMean, 4), topHeadlines };
}

/**
 * Splits two weeks of articles into this week and the week before and
 * returns { current, prior, change } (change = current - prior score, or
 * null when either week has no news).
 */
export function newsSentiment(articles, { now = new Date(), windowDays = 7, scoredArticles } = {}) {
  const list = scoredArticles || articles || [];
  const cutoff = new Date(now - windowDays * DAY_MS);
  const priorCutoff = new Date(now - 2 * windowDays * DAY_MS);
  const cur = list.filter((a) => new Date(a.datetime) >= cutoff);
  const prev = list.filter((a) => new Date(a.datetime) < cutoff && new Date(a.datetime) >= priorCutoff);
  const current = aggregateHeadlines(cur, { now });
  // Prior week is aged from its own end so both windows weigh the same way.
  const prior = aggregateHeadlines(prev, { now: cutoff });
  const change = current.score !== null && prior.score !== null ? round(current.score - prior.score, 4) : null;
  return { current, prior, change };
}

// ---------------------------------------------------------------------------
// Analyst / earnings / insider signals (each 0..1, null when no data)
// ---------------------------------------------------------------------------

function recScore(r) {
  const sb = r.strongBuy || 0, b = r.buy || 0, h = r.hold || 0, s = r.sell || 0, ss = r.strongSell || 0;
  const total = sb + b + h + s + ss;
  if (!total) return null;
  // -2..2 mapped to 0..1
  return ((2 * sb + b - s - 2 * ss) / total + 2) / 4;
}

/**
 * Analyst signal from monthly recommendation counts (newest first, Finnhub
 * shape or Yahoo `trend`). Level of the latest month plus a small bonus or
 * penalty for the change vs ~3 months earlier.
 */
export function analystSignal(recommendations) {
  const recs = (recommendations || []).filter(Boolean);
  if (!recs.length) return null;
  const latest = recScore(recs[0]);
  if (latest === null) return null;
  const older = recs.length > 1 ? recScore(recs[Math.min(3, recs.length - 1)]) : null;
  const trend = older === null ? 0 : latest - older;
  return round(clamp(latest + trend * 2, 0, 1), 4);
}

/**
 * Earnings signal from the last up to 4 quarters: share of beats (60%) and
 * average surprise % (40%, ±10% saturates).
 */
export function earningsSignal(earnings) {
  const rows = (earnings || []).filter((e) => e && typeof e.surprisePercent === "number").slice(-4);
  if (!rows.length) return null;
  const beatRate = rows.filter((e) => e.surprisePercent > 0).length / rows.length;
  const avg = rows.reduce((a, e) => a + e.surprisePercent, 0) / rows.length;
  const surprise = clamp((avg + 10) / 20, 0, 1);
  return round(0.6 * beatRate + 0.4 * surprise, 4);
}

/**
 * Insider signal. Finnhub: mean monthly MSPR (-100..100) over the period
 * → 0..1. Yahoo fallback: net % of insider shares bought over 6 months
 * (±10% saturates).
 */
export function insiderSignal(insider) {
  if (!insider) return null;
  if (Array.isArray(insider.mspr) && insider.mspr.length) {
    const vals = insider.mspr.map((m) => m.mspr).filter((v) => typeof v === "number");
    if (!vals.length) return null;
    const avg = vals.reduce((a, b) => a + b, 0) / vals.length;
    return round(clamp((avg + 100) / 200, 0, 1), 4);
  }
  const pct = insider.yahoo?.netPercentInsiderShares;
  if (typeof pct === "number") return round(clamp((pct + 0.1) / 0.2, 0, 1), 4);
  return null;
}

/**
 * Combined 0..1 signal: weighted mean of the available parts
 * (analyst 50%, earnings 30%, insider 20%), null when none are available.
 */
export function fundamentalSentiment({ recommendations, earnings, insider } = {}) {
  const parts = [
    [analystSignal(recommendations), 0.5],
    [earningsSignal(earnings), 0.3],
    [insiderSignal(insider), 0.2],
  ];
  const have = parts.filter(([v]) => v !== null);
  const analyst = parts[0][0], earn = parts[1][0], ins = parts[2][0];
  if (!have.length) return { signal: null, analyst, earnings: earn, insider: ins };
  const wSum = have.reduce((a, [, w]) => a + w, 0);
  const signal = have.reduce((a, [v, w]) => a + v * w, 0) / wSum;
  return { signal: round(signal, 4), analyst, earnings: earn, insider: ins };
}

// ---------------------------------------------------------------------------
// Optional LLM headline scoring
// ---------------------------------------------------------------------------

let openaiClient = null;
async function getOpenAI() {
  if (!openaiClient) {
    const { OpenAI } = await import("openai");
    openaiClient = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  }
  return openaiClient;
}

export const llmModeEnabled = () =>
  (process.env.SENTIMENT_MODE || "").toLowerCase() === "llm" && Boolean(process.env.OPENAI_API_KEY);

/**
 * Scores headlines for one ticker with the chat model. Returns an array of
 * numbers in [-1, 1] (same order), or null on any failure so the caller can
 * keep the lexicon scores.
 */
export async function llmScoreHeadlines(ticker, headlines) {
  if (!headlines.length) return [];
  try {
    const client = await getOpenAI();
    const numbered = headlines.map((h, i) => `${i + 1}. ${h}`).join("\n");
    const res = await client.chat.completions.create({
      model: process.env.OPENAI_CHAT_MODEL || "gpt-4o-mini",
      temperature: 0,
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content:
            "You rate how each news headline affects the short-term outlook for the given stock. " +
            'Reply with JSON {"scores": [numbers]} with one score per headline in order, each from -1 (very negative) to 1 (very positive); 0 if irrelevant.',
        },
        { role: "user", content: `Stock: ${ticker}\nHeadlines:\n${numbered}` },
      ],
    });
    const parsed = JSON.parse(res.choices[0].message.content);
    const scores = parsed.scores;
    if (!Array.isArray(scores) || scores.length !== headlines.length) return null;
    return scores.map((s) => clamp(Number(s) || 0, -1, 1));
  } catch (err) {
    console.warn(`LLM sentiment failed for ${ticker}: ${err.message}`);
    return null;
  }
}

function round(x, dp) {
  const f = 10 ** dp;
  return Math.round(x * f) / f;
}
