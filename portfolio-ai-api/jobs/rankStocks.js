// Daily stock-ranking job. Runs from GitHub Actions (see
// .github/workflows/rank-stocks.yml), not on the Render web server, and
// writes straight to MongoDB.
//
//   node jobs/rankStocks.js                  full run: prices, fundamentals, news, signals
//   node jobs/rankStocks.js --limit 30       only 30 tickers, spread across sectors (testing)
//   node jobs/rankStocks.js --sentiment-only refresh news sentiment for the latest stored day
//                                            and re-score using that day's stored inputs
//   node jobs/rankStocks.js --dry-run        fetch and score, but write nothing
//
// Env: MONGO_URI (required), FINNHUB_API_KEY (optional, falls back to Yahoo),
// SENTIMENT_MODE=llm + OPENAI_API_KEY (optional, LLM headline scoring for
// the top ~60 candidates).
import "../config/env.js";
import fs from "fs";
import { fileURLToPath } from "url";
import mongoose from "mongoose";
import connectDB from "../config/db.js";
import DailyRanking from "../models/dailyRankingModel.js";
import JobRun from "../models/jobRunModel.js";
import {
  getPriceHistory,
  getFundamentals,
  getNews,
  getAnalystSignals,
  getSourceStatus,
} from "../services/marketData.js";
import {
  newsSentiment,
  fundamentalSentiment,
  llmModeEnabled,
  llmScoreHeadlines,
  scoreHeadline,
} from "../services/sentiment.js";
import { computeTechnicals, scoreSector, rankWithinSector, applyRankChanges, round } from "../services/scoring.js";

const KEEP_DAYS = 30;
const LLM_CANDIDATES = 60;
const CONCURRENCY = 4;
const TOP_N = 10;

// ---------------------------------------------------------------------------
// CLI
// ---------------------------------------------------------------------------

export function parseArgs(argv) {
  const opts = { limit: null, sentimentOnly: false, dryRun: false };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === "--limit") opts.limit = Number(argv[++i]);
    else if (a.startsWith("--limit=")) opts.limit = Number(a.split("=")[1]);
    else if (a === "--sentiment-only") opts.sentimentOnly = true;
    else if (a === "--dry-run") opts.dryRun = true;
  }
  if (opts.limit !== null && !(opts.limit > 0)) throw new Error("--limit must be a positive number");
  return opts;
}

/** Takes `limit` tickers round-robin across sectors so each sector gets some. */
export function sampleUniverse(universe, limit) {
  if (!limit || limit >= universe.length) return universe;
  const bySector = new Map();
  for (const u of universe) {
    if (!bySector.has(u.sector)) bySector.set(u.sector, []);
    bySector.get(u.sector).push(u);
  }
  const queues = [...bySector.values()];
  const out = [];
  for (let i = 0; out.length < limit; i++) {
    const q = queues[i % queues.length];
    if (q.length) out.push(q.shift());
    if (queues.every((x) => !x.length)) break;
  }
  return out;
}

function loadUniverse() {
  const url = new URL("../data/universe.json", import.meta.url);
  return JSON.parse(fs.readFileSync(url, "utf8"));
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** YYYY-MM-DD of a Date in US/Eastern (the exchange's calendar day). */
export const easternDate = (d) =>
  new Intl.DateTimeFormat("en-CA", { timeZone: "America/New_York" }).format(d);

export function shiftDate(ymd, days) {
  const d = new Date(`${ymd}T12:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

async function mapPool(items, limit, fn) {
  const results = new Array(items.length);
  let next = 0;
  const workers = Array.from({ length: Math.min(limit, items.length) }, async () => {
    while (next < items.length) {
      const i = next++;
      results[i] = await fn(items[i], i);
    }
  });
  await Promise.all(workers);
  return results;
}

const log = (...a) => console.log(new Date().toISOString().slice(11, 19), ...a);

/** Scores headlines (lexicon; LLM scores are passed in when available). */
function scoreArticles(articles, llmScores) {
  return articles.map((a, i) => ({
    ...a,
    score: llmScores && typeof llmScores[i] === "number" ? llmScores[i] : scoreHeadline(a.headline),
  }));
}

function newsFields(articles, now) {
  const ns = newsSentiment(articles, { now, scoredArticles: articles });
  return {
    news: { score: ns.current.score, change: ns.change, count: ns.current.count, priorScore: ns.prior.score },
    topHeadlines: ns.current.topHeadlines,
  };
}

/** Scores and ranks rows sector by sector. */
function scoreAndRank(rows) {
  const bySector = new Map();
  for (const r of rows) {
    if (!bySector.has(r.sector)) bySector.set(r.sector, []);
    bySector.get(r.sector).push(r);
  }
  const scored = [...bySector.values()].flatMap((group) => scoreSector(group));
  rankWithinSector(scored, "longScore", "longRank");
  rankWithinSector(scored, "shortScore", "shortRank");
  return scored;
}

/**
 * LLM mode: re-score the headlines of the top candidates (by short score,
 * then long score) and recompute their news fields. Returns the count.
 */
async function applyLlmSentiment(rows, now) {
  if (!llmModeEnabled()) return 0;
  const ranked = [...rows].sort((a, b) => b.shortScore + b.longScore * 0.5 - (a.shortScore + a.longScore * 0.5));
  const picks = ranked.filter((r) => r.articles?.length).slice(0, LLM_CANDIDATES);
  let n = 0;
  for (const r of picks) {
    const scores = await llmScoreHeadlines(r.ticker, r.articles.map((a) => a.headline));
    if (!scores) continue;
    r.articles = scoreArticles(r.articles, scores);
    Object.assign(r, newsFields(r.articles, now));
    r.sentimentSource = "llm";
    n += 1;
  }
  log(`LLM re-scored headlines for ${n} candidates`);
  return n;
}

function toDoc(r, date, now) {
  return {
    date,
    ticker: r.ticker,
    name: r.name,
    sector: r.sector,
    industry: r.industry,
    price: round(r.technicals?.price, 4),
    longScore: r.longScore,
    shortScore: r.shortScore,
    longRank: r.longRank,
    shortRank: r.shortRank,
    prevLongRank: r.prevLongRank,
    prevShortRank: r.prevShortRank,
    longMove: r.longMove,
    shortMove: r.shortMove,
    components: {
      ...r.components,
      inputs: {
        fundamentals: r.fundamentals,
        technicals: Object.fromEntries(Object.entries(r.technicals || {}).map(([k, v]) => [k, round(v, 4)])),
        fundamentalSentiment: r.fundamentalSentiment,
        signals: r.signals,
        news: r.news,
        sentimentSource: r.sentimentSource || "lexicon",
        dataSources: r.dataSources,
      },
    },
    topHeadlines: r.topHeadlines || [],
    sentimentUpdatedAt: now,
  };
}

async function writeDay(rows, date, now) {
  const ops = rows.map((r) => ({
    updateOne: {
      filter: { date, ticker: r.ticker },
      update: { $set: toDoc(r, date, now) },
      upsert: true,
    },
  }));
  if (!ops.length) return 0;
  const res = await DailyRanking.bulkWrite(ops, { ordered: false });
  return (res.upsertedCount || 0) + (res.matchedCount || 0);
}

async function previousDayRows(date) {
  const prev = await DailyRanking.findOne({ date: { $lt: date } }).sort({ date: -1 }).select("date").lean();
  if (!prev) return { prevDate: null, rows: [] };
  const rows = await DailyRanking.find({ date: prev.date })
    .select("ticker sector longRank shortRank")
    .lean();
  return { prevDate: prev.date, rows };
}

// ---------------------------------------------------------------------------
// Full run
// ---------------------------------------------------------------------------

async function fetchTicker(u, now) {
  const history = await getPriceHistory(u.ticker);
  if (history.length < 30) throw new Error(`only ${history.length} price bars`);
  let fundamentals = null;
  try {
    fundamentals = await getFundamentals(u.ticker);
  } catch (err) {
    log(`  ${u.ticker}: fundamentals unavailable (${err.message}); using neutral scores`);
  }
  const [news, signals] = await Promise.all([getNews(u.ticker, 14), getAnalystSignals(u.ticker, fundamentals)]);
  const fsig = fundamentalSentiment(signals);
  const articles = scoreArticles(news.articles);
  const { yahoo, price, marketCap, ...metrics } = fundamentals || {};
  return {
    ...u,
    lastBar: history[history.length - 1].date,
    technicals: computeTechnicals(history),
    fundamentals: fundamentals ? { ...metrics, marketCap } : {},
    fundamentalSentiment: fsig.signal,
    signals: { analyst: fsig.analyst, earnings: fsig.earnings, insider: fsig.insider },
    articles,
    ...newsFields(articles, now),
    dataSources: { news: news.source, ...signals.sources },
  };
}

async function runFull(opts, jobRun) {
  const universe = sampleUniverse(loadUniverse(), opts.limit);
  jobRun.counts.universe = universe.length;
  const now = new Date();
  log(`Full run for ${universe.length} tickers`);

  const failed = [];
  let done = 0;
  const fetched = await mapPool(universe, CONCURRENCY, async (u) => {
    try {
      const row = await fetchTicker(u, now);
      return row;
    } catch (err) {
      failed.push(u.ticker);
      log(`  ${u.ticker} failed: ${err.message}`);
      return null;
    } finally {
      done += 1;
      if (done % 25 === 0 || done === universe.length) log(`  fetched ${done}/${universe.length}`);
    }
  });
  let rows = fetched.filter(Boolean);
  jobRun.failedTickers = failed;
  jobRun.counts.failed = failed.length;
  if (!rows.length) throw new Error("no tickers could be fetched");

  // Trading day = latest bar date across the universe.
  const lastBar = rows.reduce((m, r) => (r.lastBar > m ? r.lastBar : m), rows[0].lastBar);
  const date = easternDate(lastBar);
  jobRun.date = date;
  // Stocks with stale data (halted / delisted) are left out of today's ranks.
  rows = rows.filter((r) => {
    const stale = easternDate(r.lastBar) < shiftDate(date, -5);
    if (stale) {
      failed.push(r.ticker);
      log(`  ${r.ticker}: stale price data (${easternDate(r.lastBar)}), skipped`);
    }
    return !stale;
  });
  jobRun.counts.failed = failed.length;

  rows = scoreAndRank(rows);
  const llmCount = await applyLlmSentiment(rows, now);
  if (llmCount) rows = scoreAndRank(rows);
  jobRun.counts.llmScored = llmCount;
  jobRun.counts.scored = rows.length;

  return finish(rows, date, now, opts, jobRun);
}

// ---------------------------------------------------------------------------
// Sentiment-only run
// ---------------------------------------------------------------------------

async function runSentimentOnly(opts, jobRun) {
  const latest = await DailyRanking.findOne().sort({ date: -1 }).select("date").lean();
  if (!latest) throw new Error("no stored rankings yet; run a full job first");
  const date = latest.date;
  jobRun.date = date;
  const now = new Date();

  let docs = await DailyRanking.find({ date }).lean();
  if (opts.limit) {
    docs = sampleUniverse(docs, opts.limit);
  }
  jobRun.counts.universe = docs.length;
  log(`Sentiment-only run for ${docs.length} tickers on ${date}`);

  const failed = [];
  let done = 0;
  const rows = await mapPool(docs, CONCURRENCY, async (d) => {
    const inputs = d.components?.inputs || {};
    const row = {
      ticker: d.ticker,
      name: d.name,
      sector: d.sector,
      industry: d.industry,
      technicals: inputs.technicals || { price: d.price },
      fundamentals: inputs.fundamentals || {},
      fundamentalSentiment: inputs.fundamentalSentiment ?? null,
      signals: inputs.signals,
      dataSources: inputs.dataSources || {},
      news: inputs.news,
      topHeadlines: d.topHeadlines,
      sentimentSource: inputs.sentimentSource,
    };
    try {
      const news = await getNews(d.ticker, 14);
      row.articles = scoreArticles(news.articles);
      Object.assign(row, newsFields(row.articles, now));
      row.sentimentSource = "lexicon";
      row.dataSources = { ...row.dataSources, news: news.source };
    } catch (err) {
      failed.push(d.ticker);
      log(`  ${d.ticker}: news refresh failed (${err.message}); keeping stored sentiment`);
    }
    done += 1;
    if (done % 25 === 0 || done === docs.length) log(`  refreshed ${done}/${docs.length}`);
    return row;
  });
  jobRun.failedTickers = failed;
  jobRun.counts.failed = failed.length;

  // With --limit we only touched some tickers; rank against the whole day.
  let all = rows;
  if (opts.limit) {
    const touched = new Set(rows.map((r) => r.ticker));
    const rest = (await DailyRanking.find({ date }).lean())
      .filter((d) => !touched.has(d.ticker))
      .map((d) => ({
        ticker: d.ticker,
        name: d.name,
        sector: d.sector,
        industry: d.industry,
        technicals: d.components?.inputs?.technicals || { price: d.price },
        fundamentals: d.components?.inputs?.fundamentals || {},
        fundamentalSentiment: d.components?.inputs?.fundamentalSentiment ?? null,
        signals: d.components?.inputs?.signals,
        dataSources: d.components?.inputs?.dataSources,
        news: d.components?.inputs?.news,
        topHeadlines: d.topHeadlines,
        sentimentSource: d.components?.inputs?.sentimentSource,
      }));
    all = rows.concat(rest);
  }

  all = scoreAndRank(all);
  const llmCount = await applyLlmSentiment(all, now);
  if (llmCount) all = scoreAndRank(all);
  jobRun.counts.llmScored = llmCount;
  jobRun.counts.scored = all.length;
  return finish(all, date, now, opts, jobRun);
}

// ---------------------------------------------------------------------------
// Shared tail: rank changes, write, prune
// ---------------------------------------------------------------------------

async function finish(rows, date, now, opts, jobRun) {
  const { prevDate, rows: prevRows } = await previousDayRows(date);
  const { dropped } = applyRankChanges(rows, prevRows, TOP_N);
  log(`Previous trading day: ${prevDate || "none"}; ${dropped.length} top-${TOP_N} drop-outs`);

  printSummary(rows);

  if (opts.dryRun) {
    log("Dry run: nothing written");
    return;
  }
  jobRun.counts.written = await writeDay(rows, date, now);
  const cutoff = shiftDate(date, -KEEP_DAYS);
  const pruned = await DailyRanking.deleteMany({ date: { $lt: cutoff } });
  jobRun.counts.pruned = pruned.deletedCount || 0;
  log(`Wrote ${jobRun.counts.written} rankings for ${date}; pruned ${jobRun.counts.pruned} older than ${cutoff}`);
}

function printSummary(rows) {
  const bySector = new Map();
  for (const r of rows) {
    if (!bySector.has(r.sector)) bySector.set(r.sector, []);
    bySector.get(r.sector).push(r);
  }
  for (const [sector, group] of [...bySector.entries()].sort()) {
    const top = (key, rank) =>
      [...group]
        .sort((a, b) => a[rank] - b[rank])
        .slice(0, 3)
        .map((r) => `${r.ticker} ${r[key]}`)
        .join(", ");
    log(`  ${sector}: long [${top("longScore", "longRank")}] short [${top("shortScore", "shortRank")}]`);
  }
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main() {
  const opts = parseArgs(process.argv.slice(2));
  if (!process.env.MONGO_URI) throw new Error("MONGO_URI is not set");
  if (!process.env.FINNHUB_API_KEY) log("FINNHUB_API_KEY not set: using Yahoo for news and analyst data");

  await connectDB();
  const started = Date.now();
  const jobRun = opts.dryRun
    ? { counts: {}, failedTickers: [] }
    : await JobRun.create({ type: opts.sentimentOnly ? "sentiment" : "full", startedAt: new Date(started) });

  let exitCode = 0;
  try {
    if (opts.sentimentOnly) await runSentimentOnly(opts, jobRun);
    else await runFull(opts, jobRun);
    jobRun.status = jobRun.counts.failed ? "partial" : "success";
  } catch (err) {
    console.error("Job failed:", err);
    jobRun.status = "failed";
    jobRun.error = String(err?.stack || err).slice(0, 2000);
    exitCode = 1;
  }
  jobRun.durationMs = Date.now() - started;
  jobRun.sources = getSourceStatus();
  const disabled = Object.keys(jobRun.sources.disabledFinnhubEndpoints);
  if (disabled.length) log(`Finnhub endpoints unavailable on this key: ${disabled.join(", ")}`);
  if (!opts.dryRun) {
    jobRun.markModified?.("counts");
    jobRun.markModified?.("sources");
    await jobRun.save();
  }
  log(`Done in ${Math.round(jobRun.durationMs / 1000)}s, status ${jobRun.status}`);
  await mongoose.disconnect();
  process.exit(exitCode);
}

// Run only when executed directly (tests import the helpers above).
if (process.argv[1] && fileURLToPath(import.meta.url) === fs.realpathSync(process.argv[1])) {
  main().catch(async (err) => {
    console.error(err);
    await mongoose.disconnect().catch(() => {});
    process.exit(1);
  });
}
