import YahooFinance from "yahoo-finance2";
import QuoteCache from "../models/quoteCacheModel.js";

const FRESH_MS = 5 * 60 * 1000; // quotes younger than this are served from cache
const yf = new YahooFinance({ suppressNotices: ["yahooSurvey"] });

export const TICKER_RE = /^[A-Z][A-Z0-9.\-]{0,9}$/;
export const normalizeTicker = (t) => String(t || "").trim().toUpperCase();

// Class shares: we store BRK-B (Yahoo style); Finnhub wants BRK.B.
const toYahoo = (t) => t.replace(".", "-");

async function fetchFromYahoo(tickers) {
    const fromYahoo = new Map(tickers.map((t) => [toYahoo(t), t]));
    const rows = await yf.quote([...fromYahoo.keys()], { return: "array" });
    return rows
        .filter((q) => typeof q?.regularMarketPrice === "number")
        .map((q) => ({
            ticker: fromYahoo.get(q.symbol) || q.symbol,
            name: q.longName || q.shortName || q.symbol,
            price: q.regularMarketPrice,
            changePercent: q.regularMarketChangePercent ?? null,
            previousClose: q.regularMarketPreviousClose ?? null,
            currency: q.currency || "USD",
        }));
}

async function fetchFromFinnhub(ticker) {
    const key = process.env.FINNHUB_API_KEY;
    if (!key) return null;
    const res = await fetch(`https://finnhub.io/api/v1/quote?symbol=${encodeURIComponent(ticker.replace("-", "."))}&token=${key}`);
    if (!res.ok) return null;
    const q = await res.json();
    if (!q || !q.c) return null; // Finnhub returns zeros for unknown symbols
    return { ticker, name: ticker, price: q.c, changePercent: q.dp ?? null, previousClose: q.pc ?? null, currency: "USD" };
}

/**
 * Returns a Map ticker -> quote. Unknown tickers are simply absent.
 * Serves cached quotes when fresh; falls back to stale cache if providers fail.
 */
export async function getQuotes(tickers) {
    const wanted = [...new Set(tickers.map(normalizeTicker).filter((t) => TICKER_RE.test(t)))];
    const out = new Map();
    if (!wanted.length) return out;

    const cached = await QuoteCache.find({ ticker: { $in: wanted } }).lean();
    const now = Date.now();
    for (const c of cached) {
        if (now - new Date(c.updatedAt).getTime() < FRESH_MS) out.set(c.ticker, c);
    }

    let missing = wanted.filter((t) => !out.has(t));
    if (missing.length) {
        let fresh = [];
        try {
            fresh = await fetchFromYahoo(missing);
        } catch (err) {
            console.warn("Yahoo quote fetch failed:", err.message);
        }
        const got = new Set(fresh.map((q) => q.ticker));
        for (const t of missing.filter((t) => !got.has(t))) {
            try {
                const q = await fetchFromFinnhub(t);
                if (q) fresh.push(q);
            } catch (err) {
                console.warn(`Finnhub quote fetch failed for ${t}:`, err.message);
            }
        }
        if (fresh.length) {
            await QuoteCache.bulkWrite(fresh.map((q) => ({
                updateOne: { filter: { ticker: q.ticker }, update: { $set: { ...q, updatedAt: new Date() } }, upsert: true },
            })));
        }
        for (const q of fresh) out.set(q.ticker, { ...q, updatedAt: new Date() });
        missing = wanted.filter((t) => !out.has(t));
    }

    // Last resort: serve a stale cached quote rather than nothing.
    for (const c of cached) {
        if (!out.has(c.ticker)) out.set(c.ticker, { ...c, stale: true });
    }
    return out;
}
