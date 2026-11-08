const round = (n, d = 2) => (n == null || !Number.isFinite(n) ? null : Math.round(n * 10 ** d) / 10 ** d);

/** Enrich one holding with market value and gain/loss. `quote` may be undefined. */
export function enrichHolding(h, quote) {
    const cost = h.shares * h.avgPrice;
    const price = quote?.price ?? null;
    const value = price == null ? null : h.shares * price;
    const pl = value == null ? null : value - cost;
    const dayChange = price != null && quote?.previousClose ? (price - quote.previousClose) * h.shares : null;
    return {
        id: h._id.toString(),
        ticker: h.ticker,
        name: quote?.name || h.name || h.ticker,
        shares: h.shares,
        avgPrice: h.avgPrice,
        notes: h.notes,
        price,
        changePercent: round(quote?.changePercent),
        cost: round(cost),
        value: round(value),
        pl: round(pl),
        plPercent: pl == null || cost === 0 ? null : round((pl / cost) * 100),
        dayChange: round(dayChange),
        stale: Boolean(quote?.stale),
    };
}

/** Totals across holdings; holdings without a price are excluded from value/P&L. */
export function summarize(rows) {
    const priced = rows.filter((r) => r.value != null);
    const cost = priced.reduce((s, r) => s + r.shares * r.avgPrice, 0);
    const value = priced.reduce((s, r) => s + r.value, 0);
    const dayChange = priced.reduce((s, r) => s + (r.dayChange || 0), 0);
    const pl = value - cost;
    return {
        totalCost: round(cost),
        totalValue: round(value),
        totalPl: round(pl),
        totalPlPercent: cost ? round((pl / cost) * 100) : null,
        dayChange: round(dayChange),
        unpriced: rows.length - priced.length,
    };
}
