// Market data adapter for the stock-ranking job.
//
// Sources (all free tier):
//   - Yahoo Finance via `yahoo-finance2`: daily price history, fundamentals,
//     quotes, and fallback analyst / earnings / insider / news data.
//   - Finnhub (FINNHUB_API_KEY): quote fallback, /company-news,
//     /stock/recommendation, /stock/earnings, /stock/insider-sentiment.
//
// Every call goes through a per-source throttle (Finnhub ~1 req/s to stay
// under the free 60/min limit, Yahoo ~2 req/s) and is retried with
// exponential backoff on 429 / 5xx / network errors. Finnhub endpoints that
// answer 401/403 (premium-only or bad key) are disabled for the rest of the
// run and reported via getSourceStatus(), so one locked endpoint does not
// cost a failed request per ticker.
import YahooFinance from "yahoo-finance2";

const FINNHUB_BASE = "https://finnhub.io/api/v1";
const DAY_MS = 24 * 60 * 60 * 1000;

// ---------------------------------------------------------------------------
// Throttling and retry
// ---------------------------------------------------------------------------

/**
 * Returns a function that runs async tasks one after another, starting each
 * at least `minIntervalMs` after the previous one started.
 */
export function createThrottle(minIntervalMs) {
  let chain = Promise.resolve();
  let nextAt = 0;
  return function schedule(task) {
    const run = chain.then(async () => {
      const wait = nextAt - Date.now();
      if (wait > 0) await sleep(wait);
      nextAt = Date.now() + minIntervalMs;
    });
    chain = run.catch(() => {});
    return run.then(task);
  };
}

export const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

class HttpError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

function isRetryable(err) {
  const status = err?.status ?? err?.response?.status ?? err?.code;
  if (status === 429 || (typeof status === "number" && status >= 500)) return true;
  if (/too many requests|ECONNRESET|ETIMEDOUT|EAI_AGAIN|fetch failed|socket hang up/i.test(err?.message || "")) {
    return true;
  }
  return false;
}

/** Retries `fn` on retryable errors: 3 retries, 2s / 4s / 8s backoff. */
export async function withRetry(fn, { retries = 3, baseDelayMs = 2000 } = {}) {
  let attempt = 0;
  for (;;) {
    try {
      return await fn();
    } catch (err) {
      if (attempt >= retries || !isRetryable(err)) throw err;
      await sleep(baseDelayMs * 2 ** attempt);
      attempt += 1;
    }
  }
}

const finnhubThrottle = createThrottle(Number(process.env.FINNHUB_MIN_INTERVAL_MS) || 1100);
const yahooThrottle = createThrottle(Number(process.env.YAHOO_MIN_INTERVAL_MS) || 500);

// ---------------------------------------------------------------------------
// Source status (for reporting limitations in JobRun)
// ---------------------------------------------------------------------------

const disabledFinnhub = new Map(); // endpoint -> reason
const counters = { yahoo: 0, finnhub: 0, errors: 0 };

export function getSourceStatus() {
  return {
    finnhubConfigured: Boolean(process.env.FINNHUB_API_KEY),
    disabledFinnhubEndpoints: Object.fromEntries(disabledFinnhub),
    requests: { ...counters },
  };
}

// ---------------------------------------------------------------------------
// Yahoo
// ---------------------------------------------------------------------------

let yahooClient = null;
function yahoo() {
  if (!yahooClient) {
    yahooClient = new YahooFinance({ suppressNotices: ["yahooSurvey", "ripHistorical"] });
  }
  return yahooClient;
}

function yahooCall(fn) {
  return yahooThrottle(() =>
    withRetry(() => {
      counters.yahoo += 1;
      return fn(yahoo());
    })
  );
}

/** Yahoo uses BRK-B; Finnhub uses BRK.B. */
export const toYahooSymbol = (ticker) => ticker.replace(".", "-");
export const toFinnhubSymbol = (ticker) => ticker.replace("-", ".");

/**
 * Daily bars, oldest first: [{ date, close, volume }]. `days` is calendar
 * days of history (400 covers 200 trading days plus slack).
 */
export async function getPriceHistory(ticker, days = 400) {
  const result = await yahooCall((yf) =>
    yf.chart(toYahooSymbol(ticker), {
      period1: new Date(Date.now() - days * DAY_MS),
      interval: "1d",
    })
  );
  return (result?.quotes || [])
    .filter((q) => q && Number.isFinite(q.close ?? q.adjclose))
    .map((q) => ({
      date: new Date(q.date),
      close: q.adjclose ?? q.close,
      volume: Number.isFinite(q.volume) ? q.volume : null,
    }));
}

const num = (v) => (typeof v === "number" && Number.isFinite(v) ? v : null);

/**
 * Fundamentals plus Yahoo's analyst / earnings / insider modules (used when
 * Finnhub is unavailable). Any field Yahoo lacks is null.
 */
export async function getFundamentals(ticker) {
  const s = await yahooCall((yf) =>
    yf.quoteSummary(
      toYahooSymbol(ticker),
      {
        modules: [
          "price",
          "summaryDetail",
          "defaultKeyStatistics",
          "financialData",
          "recommendationTrend",
          "earningsHistory",
          "netSharePurchaseActivity",
        ],
      },
      { validateResult: false }
    )
  );
  const sd = s?.summaryDetail || {};
  const ks = s?.defaultKeyStatistics || {};
  const fd = s?.financialData || {};
  const pr = s?.price || {};
  // Yahoo reports debtToEquity as a percentage (84.3 means 0.843).
  const de = num(fd.debtToEquity);
  return {
    price: num(pr.regularMarketPrice) ?? num(fd.currentPrice),
    marketCap: num(pr.marketCap) ?? num(sd.marketCap),
    forwardPE: num(sd.forwardPE) ?? num(ks.forwardPE),
    peg: num(ks.pegRatio) ?? num(ks.trailingPegRatio),
    priceToBook: num(ks.priceToBook),
    revenueGrowth: num(fd.revenueGrowth),
    earningsGrowth: num(fd.earningsGrowth) ?? num(ks.earningsQuarterlyGrowth),
    roe: num(fd.returnOnEquity),
    profitMargin: num(fd.profitMargins) ?? num(ks.profitMargins),
    debtToEquity: de === null ? null : de / 100,
    yahoo: {
      recommendationTrend: (s?.recommendationTrend?.trend || []).map((t) => ({
        period: t.period,
        strongBuy: t.strongBuy,
        buy: t.buy,
        hold: t.hold,
        sell: t.sell,
        strongSell: t.strongSell,
      })),
      earningsHistory: (s?.earningsHistory?.history || []).map((h) => ({
        period: h.quarter ? new Date(h.quarter).toISOString().slice(0, 10) : h.period,
        actual: num(h.epsActual),
        estimate: num(h.epsEstimate),
        surprisePercent: num(h.surprisePercent) === null ? null : h.surprisePercent * 100,
      })),
      netSharePurchase: s?.netSharePurchaseActivity
        ? { netPercentInsiderShares: num(s.netSharePurchaseActivity.netPercentInsiderShares) }
        : null,
    },
  };
}

/** Yahoo news headlines as [{ headline, datetime: Date, source, url }]. */
export async function getYahooNews(ticker, count = 15) {
  const res = await yahooCall((yf) =>
    yf.search(toYahooSymbol(ticker), { newsCount: count, quotesCount: 0 }, { validateResult: false })
  );
  const sym = toYahooSymbol(ticker);
  return (res?.news || [])
    // Yahoo's search returns market-wide stories too; keep the ones that
    // actually tag this ticker.
    .filter((n) => !n.relatedTickers || n.relatedTickers.includes(sym))
    .map((n) => ({
      headline: n.title,
      datetime: new Date(n.providerPublishTime),
      source: n.publisher,
      url: n.link,
    }));
}

// ---------------------------------------------------------------------------
// Finnhub
// ---------------------------------------------------------------------------

/**
 * GET a Finnhub endpoint. Returns null (no request made) when there is no
 * API key or the endpoint was disabled earlier in this run.
 */
export async function finnhub(path, params = {}) {
  const key = process.env.FINNHUB_API_KEY;
  if (!key || disabledFinnhub.has(path)) return null;
  const qs = new URLSearchParams({ ...params, token: key });
  return finnhubThrottle(() =>
    withRetry(async () => {
      counters.finnhub += 1;
      const res = await fetch(`${FINNHUB_BASE}${path}?${qs}`);
      if (res.status === 401 || res.status === 403) {
        const body = await res.text().catch(() => "");
        disabledFinnhub.set(path, `HTTP ${res.status}: ${body.slice(0, 120)}`);
        return null;
      }
      if (!res.ok) throw new HttpError(res.status, `Finnhub ${path} HTTP ${res.status}`);
      return res.json();
    })
  );
}

const ymd = (d) => d.toISOString().slice(0, 10);

/** Finnhub company news between `from` and `to` (Dates). */
export async function getFinnhubNews(ticker, from, to = new Date()) {
  const data = await finnhub("/company-news", {
    symbol: toFinnhubSymbol(ticker),
    from: ymd(from),
    to: ymd(to),
  });
  if (!Array.isArray(data)) return null;
  return data.map((n) => ({
    headline: n.headline,
    datetime: new Date(n.datetime * 1000),
    source: n.source,
    url: n.url,
  }));
}

export async function getFinnhubRecommendation(ticker) {
  const data = await finnhub("/stock/recommendation", { symbol: toFinnhubSymbol(ticker) });
  return Array.isArray(data) ? data : null; // newest first
}

export async function getFinnhubEarnings(ticker) {
  const data = await finnhub("/stock/earnings", { symbol: toFinnhubSymbol(ticker), limit: 4 });
  if (!Array.isArray(data)) return null;
  return data.map((e) => ({
    period: e.period,
    actual: num(e.actual),
    estimate: num(e.estimate),
    surprisePercent: num(e.surprisePercent),
  }));
}

export async function getFinnhubInsiderSentiment(ticker) {
  const to = new Date();
  const from = new Date(Date.now() - 180 * DAY_MS);
  const data = await finnhub("/stock/insider-sentiment", {
    symbol: toFinnhubSymbol(ticker),
    from: ymd(from),
    to: ymd(to),
  });
  return Array.isArray(data?.data) ? data.data : null; // [{year, month, mspr, change}]
}

// ---------------------------------------------------------------------------
// Combined helpers used by the job
// ---------------------------------------------------------------------------

/** Latest price: Yahoo quote first, Finnhub /quote as fallback. */
export async function getQuote(ticker) {
  try {
    const q = await yahooCall((yf) =>
      yf.quote(toYahooSymbol(ticker), {}, { validateResult: false })
    );
    const price = num(q?.regularMarketPrice);
    if (price !== null) return { price, source: "yahoo" };
  } catch {
    // fall through to Finnhub
  }
  const fq = await finnhub("/quote", { symbol: toFinnhubSymbol(ticker) }).catch(() => null);
  const price = num(fq?.c);
  return price ? { price, source: "finnhub" } : null;
}

/**
 * News for the last `days` days (default 14, so the job can compare this
 * week with the previous one). Finnhub first; Yahoo search as fallback.
 */
export async function getNews(ticker, days = 14) {
  const from = new Date(Date.now() - days * DAY_MS);
  try {
    const fh = await getFinnhubNews(ticker, from);
    if (fh) return { source: "finnhub", articles: fh };
  } catch {
    counters.errors += 1;
  }
  try {
    const yn = await getYahooNews(ticker);
    return { source: "yahoo", articles: yn.filter((a) => a.datetime >= from) };
  } catch {
    counters.errors += 1;
    return { source: "none", articles: [] };
  }
}

/**
 * Analyst trend, earnings history, insider data. Finnhub when available,
 * otherwise the Yahoo modules already fetched with fundamentals.
 */
export async function getAnalystSignals(ticker, fundamentals) {
  const safe = (p) =>
    p.catch(() => {
      counters.errors += 1;
      return null;
    });
  const [rec, earn, insider] = await Promise.all([
    safe(getFinnhubRecommendation(ticker)),
    safe(getFinnhubEarnings(ticker)),
    safe(getFinnhubInsiderSentiment(ticker)),
  ]);
  const y = fundamentals?.yahoo || {};
  return {
    recommendations: rec?.length ? rec : y.recommendationTrend || [],
    earnings: earn?.length ? earn : y.earningsHistory || [],
    insider: insider?.length ? { mspr: insider } : y.netSharePurchase ? { yahoo: y.netSharePurchase } : null,
    sources: {
      recommendations: rec?.length ? "finnhub" : "yahoo",
      earnings: earn?.length ? "finnhub" : "yahoo",
      insider: insider?.length ? "finnhub" : y.netSharePurchase ? "yahoo" : "none",
    },
  };
}
