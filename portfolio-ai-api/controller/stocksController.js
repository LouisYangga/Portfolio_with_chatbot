import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import { SECTORS } from "../config/sectors.js";
import User from "../models/userModel.js";
import DailyRanking from "../models/dailyRankingModel.js";
import JobRun from "../models/jobRunModel.js";
import { LONG_WEIGHTS, SHORT_WEIGHTS } from "../services/scoring.js";
import { normalizeTicker } from "../services/quotes.js";

const TOP_N = 20;
const universe = JSON.parse(readFileSync(fileURLToPath(new URL("../data/universe.json", import.meta.url)), "utf8"));

const LABELS = {
    valuation: "Valuation", growth: "Growth", quality: "Quality", sentiment: "Analyst & insider",
    trend: "Trend", momentum: "Momentum", news: "News sentiment", rsi: "RSI", volume: "Volume",
};

export function listSectors(req, res) {
    res.json({ sectors: SECTORS });
}

export function searchStocks(req, res) {
    const q = String(req.query.q || "").trim().toUpperCase();
    if (!q) return res.json({ results: [] });
    const exact = [], prefix = [], byName = [];
    for (const s of universe) {
        if (s.ticker === q) exact.push(s);
        else if (s.ticker.startsWith(q)) prefix.push(s);
        else if (q.length >= 2 && s.name.toUpperCase().includes(q)) byName.push(s);
    }
    res.json({ results: [...exact, ...prefix, ...byName].slice(0, 10) });
}

/** Latest US trading day whose ranking job should have finished (job starts 21:30 UTC, may take ~75 min). Ignores holidays. */
export function expectedRankingDate(now = new Date()) {
    const d = new Date(now);
    if (d.getUTCHours() * 60 + d.getUTCMinutes() < 23 * 60 + 30) d.setUTCDate(d.getUTCDate() - 1);
    while ([0, 6].includes(d.getUTCDay())) d.setUTCDate(d.getUTCDate() - 1);
    return d.toISOString().slice(0, 10);
}

/** Rank rows by score across the selected sectors (1 = best). Returns Map ticker -> rank. */
function combinedRanks(rows, scoreKey) {
    return new Map(
        rows
            .filter((r) => typeof r[scoreKey] === "number")
            .sort((a, b) => b[scoreKey] - a[scoreKey] || a.ticker.localeCompare(b.ticker))
            .map((r, i) => [r.ticker, i + 1])
    );
}

function changeFor(prevRank, rank) {
    if (prevRank == null) return { type: "new" };
    if (prevRank > rank) return { type: "up", by: prevRank - rank };
    if (prevRank < rank) return { type: "down", by: rank - prevRank };
    return { type: "same" };
}

export async function getRankings(req, res) {
    const horizon = req.query.horizon === "short" ? "short" : "long";
    const scoreKey = `${horizon}Score`;
    const weights = horizon === "short" ? SHORT_WEIGHTS : LONG_WEIGHTS;

    try {
        let sectors = String(req.query.sectors || "").split(",").map((s) => s.trim()).filter((s) => SECTORS.includes(s));
        if (!sectors.length) {
            const user = await User.findById(req.user.userId).lean();
            sectors = user?.preferences?.sectors?.length ? user.preferences.sectors : SECTORS;
        }

        const [latest] = await DailyRanking.find({}, { date: 1 }).sort({ date: -1 }).limit(1).lean();
        if (!latest) return res.json({ horizon, sectors, date: null, picks: [], droppedOut: [] });

        const [prev] = await DailyRanking.find({ date: { $lt: latest.date } }, { date: 1 }).sort({ date: -1 }).limit(1).lean();
        const [today, yesterday, lastRun] = await Promise.all([
            DailyRanking.find({ date: latest.date, sector: { $in: sectors } }).lean(),
            prev ? DailyRanking.find({ date: prev.date, sector: { $in: sectors } }, { ticker: 1, name: 1, longScore: 1, shortScore: 1 }).lean() : [],
            JobRun.findOne({ status: { $in: ["success", "partial"] } }).sort({ startedAt: -1 }).lean(),
        ]);

        const ranks = combinedRanks(today, scoreKey);
        const prevRanks = prev ? combinedRanks(yesterday, scoreKey) : new Map();
        const byTicker = new Map(today.map((r) => [r.ticker, r]));

        const picks = [...ranks.entries()].filter(([, rank]) => rank <= TOP_N).map(([ticker, rank]) => {
            const r = byTicker.get(ticker);
            const prevRank = prevRanks.get(ticker) ?? null;
            const comps = r.components?.[horizon] || {};
            return {
                rank,
                prevRank,
                change: prev ? changeFor(prevRank != null && prevRank <= TOP_N ? prevRank : null, rank) : null,
                ticker,
                name: r.name,
                sector: r.sector,
                industry: r.industry,
                price: r.price,
                score: r[scoreKey],
                components: Object.entries(weights).map(([key, weight]) => ({
                    key, label: LABELS[key] || key, weight, score: comps[key] ?? null,
                })),
                topHeadlines: (r.topHeadlines || []).slice(0, 3).map((h) => ({
                    headline: h.headline, url: h.url, source: h.source, sentiment: h.score ?? 0,
                })),
            };
        });

        const shown = new Set(picks.map((p) => p.ticker));
        const droppedOut = yesterday
            .filter((r) => (prevRanks.get(r.ticker) ?? Infinity) <= TOP_N && !shown.has(r.ticker))
            .map((r) => ({ ticker: r.ticker, name: r.name, prevRank: prevRanks.get(r.ticker) }))
            .sort((a, b) => a.prevRank - b.prevRank);

        return res.json({
            horizon,
            sectors,
            date: latest.date,
            previousDate: prev?.date || null,
            updatedAt: lastRun?.updatedAt || null,
            stale: latest.date < expectedRankingDate(),
            picks,
            droppedOut,
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: "Failed to load rankings" });
    }
}

export async function getStock(req, res) {
    const ticker = normalizeTicker(req.params.ticker);
    try {
        const row = await DailyRanking.findOne({ ticker }).sort({ date: -1 }).lean();
        const info = universe.find((s) => s.ticker === ticker);
        if (!row && !info) return res.status(404).json({ error: "Stock not found" });
        return res.json({ stock: { ...info, ...row } });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: "Failed to load stock" });
    }
}
