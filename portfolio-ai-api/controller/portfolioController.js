import mongoose from "mongoose";
import Holding from "../models/holdingModel.js";
import { getQuotes, normalizeTicker, TICKER_RE } from "../services/quotes.js";
import { enrichHolding, summarize } from "../services/portfolioMath.js";

function parseNumbers(body, { partial = false } = {}) {
    const out = {};
    for (const field of ["shares", "avgPrice"]) {
        if (body[field] === undefined) {
            if (!partial) return { error: `${field} is required` };
            continue;
        }
        const n = Number(body[field]);
        if (!Number.isFinite(n) || n < 0) return { error: `${field} must be a non-negative number` };
        out[field] = n;
    }
    if (body.notes !== undefined) out.notes = String(body.notes).slice(0, 500);
    return { values: out };
}

export async function listHoldings(req, res) {
    try {
        const holdings = await Holding.find({ userId: req.user.userId }).sort({ ticker: 1 }).lean();
        const quotes = await getQuotes(holdings.map((h) => h.ticker));
        const rows = holdings.map((h) => enrichHolding(h, quotes.get(h.ticker)));
        return res.json({ holdings: rows, summary: summarize(rows), asOf: new Date().toISOString() });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: "Failed to load portfolio" });
    }
}

export async function addHolding(req, res) {
    const ticker = normalizeTicker(req.body?.ticker).replace(".", "-"); // store BRK.B as BRK-B, like data/universe.json
    if (!TICKER_RE.test(ticker)) return res.status(400).json({ error: "Invalid ticker" });
    const { values, error } = parseNumbers(req.body || {});
    if (error) return res.status(400).json({ error });

    try {
        const quote = (await getQuotes([ticker])).get(ticker);
        if (!quote) return res.status(400).json({ error: `Could not find a US stock with ticker ${ticker}` });

        const holding = await Holding.create({ userId: req.user.userId, ticker, name: quote.name, ...values });
        return res.status(201).json({ holding: enrichHolding(holding.toObject(), quote) });
    } catch (err) {
        if (err?.code === 11000) {
            return res.status(409).json({ error: `${ticker} is already in your portfolio — edit it instead` });
        }
        console.error(err);
        return res.status(500).json({ error: "Failed to add holding" });
    }
}

export async function updateHolding(req, res) {
    if (!mongoose.isValidObjectId(req.params.id)) return res.status(404).json({ error: "Holding not found" });
    const { values, error } = parseNumbers(req.body || {}, { partial: true });
    if (error) return res.status(400).json({ error });

    try {
        const holding = await Holding.findOneAndUpdate(
            { _id: req.params.id, userId: req.user.userId },
            { $set: values },
            { new: true, runValidators: true }
        ).lean();
        if (!holding) return res.status(404).json({ error: "Holding not found" });
        const quote = (await getQuotes([holding.ticker])).get(holding.ticker);
        return res.json({ holding: enrichHolding(holding, quote) });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: "Failed to update holding" });
    }
}

export async function deleteHolding(req, res) {
    if (!mongoose.isValidObjectId(req.params.id)) return res.status(404).json({ error: "Holding not found" });
    try {
        const result = await Holding.deleteOne({ _id: req.params.id, userId: req.user.userId });
        if (!result.deletedCount) return res.status(404).json({ error: "Holding not found" });
        return res.status(204).end();
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: "Failed to delete holding" });
    }
}
