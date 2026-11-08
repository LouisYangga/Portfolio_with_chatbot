import { describe, it, expect } from "vitest";
import {
  scoreHeadline, aggregateHeadlines, newsSentiment,
  analystSignal, earningsSignal, insiderSignal, fundamentalSentiment,
} from "../services/sentiment.js";

const NOW = new Date("2026-11-06T21:00:00Z");
const daysAgo = (d) => new Date(NOW.getTime() - d * 86400000);

describe("headline scoring", () => {
  it.each([
    ["Apple beats estimates as iPhone sales surge", 1],
    ["Analyst upgrades Nvidia to Buy, raises price target", 1],
    ["Company raises full-year guidance after strong quarter", 1],
    ["Intel misses estimates and cuts guidance", -1],
    ["Boeing downgraded on weak outlook", -1],
    ["Tesla shares plunge after recall of 2 million vehicles", -1],
    ["SEC opens probe into accounting fraud at firm", -1],
  ])("%s", (headline, sign) => {
    expect(Math.sign(scoreHeadline(headline))).toBe(sign);
  });

  it("neutral market headlines score near 0", () => {
    expect(Math.abs(scoreHeadline("Microsoft stock: what to know ahead of shareholder meeting"))).toBeLessThan(0.3);
    expect(scoreHeadline("")).toBe(0);
    expect(scoreHeadline(null)).toBe(0);
  });

  it("scores are bounded to [-1, 1]", () => {
    const s = scoreHeadline("beats beats upgrade surge soar record rally outperform bullish");
    expect(s).toBeLessThanOrEqual(1);
  });
});

describe("aggregation", () => {
  it("recent headlines weigh more than old ones", () => {
    const recentGood = aggregateHeadlines(
      [{ headline: "Stock surges after earnings beat", datetime: daysAgo(0) },
       { headline: "Stock plunges on weak outlook", datetime: daysAgo(6) }],
      { now: NOW }
    );
    expect(recentGood.score).toBeGreaterThan(0);
  });

  it("few headlines are shrunk toward zero (volume adjustment)", () => {
    const one = aggregateHeadlines([{ headline: "Stock surges", datetime: daysAgo(0) }], { now: NOW });
    const many = aggregateHeadlines(
      Array.from({ length: 12 }, () => ({ headline: "Stock surges", datetime: daysAgo(0) })),
      { now: NOW }
    );
    expect(many.score).toBeGreaterThan(one.score);
    expect(one.rawMean).toBeCloseTo(many.rawMean, 5);
  });

  it("returns up to 3 driving headlines and handles no news", () => {
    const agg = aggregateHeadlines(
      ["Stock surges", "Stock plunges", "Firm beats estimates", "Quarterly report released", "Upgrade to buy"].map(
        (h, i) => ({ headline: h, datetime: daysAgo(i * 0.5) })
      ),
      { now: NOW }
    );
    expect(agg.topHeadlines).toHaveLength(3);
    expect(agg.topHeadlines.every((h) => h.score !== 0)).toBe(true);
    expect(aggregateHeadlines([], { now: NOW })).toEqual({ score: null, count: 0, rawMean: null, topHeadlines: [] });
  });

  it("week-over-week change", () => {
    const ns = newsSentiment(
      [
        { headline: "Stock surges on upgrade", datetime: daysAgo(1) },
        { headline: "Stock plunges after downgrade", datetime: daysAgo(10) },
      ],
      { now: NOW }
    );
    expect(ns.current.count).toBe(1);
    expect(ns.prior.count).toBe(1);
    expect(ns.change).toBeGreaterThan(0);
    expect(newsSentiment([], { now: NOW }).change).toBeNull();
  });
});

describe("analyst / earnings / insider signals", () => {
  it("analyst signal from recommendation counts", () => {
    expect(analystSignal([{ strongBuy: 10, buy: 0, hold: 0, sell: 0, strongSell: 0 }])).toBe(1);
    expect(analystSignal([{ strongBuy: 0, buy: 0, hold: 10, sell: 0, strongSell: 0 }])).toBe(0.5);
    // improving trend scores above the flat level
    const improving = analystSignal([
      { buy: 8, hold: 2 }, { buy: 6, hold: 4 }, { buy: 5, hold: 5 }, { buy: 4, hold: 6 },
    ]);
    expect(improving).toBeGreaterThan(analystSignal([{ buy: 8, hold: 2 }]));
    expect(analystSignal([])).toBeNull();
  });

  it("earnings signal from surprises", () => {
    expect(earningsSignal([{ surprisePercent: 5 }, { surprisePercent: 8 }])).toBeGreaterThan(0.8);
    expect(earningsSignal([{ surprisePercent: -5 }, { surprisePercent: -8 }])).toBeLessThan(0.2);
    expect(earningsSignal([{ surprisePercent: null }])).toBeNull();
  });

  it("insider signal from Finnhub MSPR or Yahoo net purchase", () => {
    expect(insiderSignal({ mspr: [{ mspr: 100 }, { mspr: 100 }] })).toBe(1);
    expect(insiderSignal({ mspr: [{ mspr: -50 }] })).toBe(0.25);
    expect(insiderSignal({ yahoo: { netPercentInsiderShares: 0 } })).toBe(0.5);
    expect(insiderSignal(null)).toBeNull();
  });

  it("combined signal uses whatever is available", () => {
    expect(fundamentalSentiment({}).signal).toBeNull();
    const onlyEarn = fundamentalSentiment({ earnings: [{ surprisePercent: 10 }] });
    expect(onlyEarn.signal).toBe(onlyEarn.earnings);
  });
});
