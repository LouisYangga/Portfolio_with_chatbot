import { describe, it, expect } from "vitest";
import {
  sma, rsi, pctReturn, volumeRatio, computeTechnicals,
  percentileRank, rsiScore, volumeScore, distanceScore,
  scoreSector, rankWithinSector, rankChange, applyRankChanges, NEUTRAL,
} from "../services/scoring.js";
import { day1, day2 } from "./fixtures/rankings.js";

// Wilder RSI worked example (StockCharts "RSI" ChartSchool article).
const RSI_CLOSES = [
  44.34, 44.09, 44.15, 43.61, 44.33, 44.83, 45.1, 45.42, 45.84, 46.08, 45.89, 46.03, 45.61, 46.28, 46.28,
];

describe("technical indicators", () => {
  it("sma of the last n values", () => {
    expect(sma([1, 2, 3, 4, 5], 5)).toBe(3);
    expect(sma([1, 2, 3, 4, 5], 2)).toBe(4.5);
    expect(sma([1, 2], 3)).toBeNull();
  });

  it("rsi matches the Wilder worked example", () => {
    // The published table rounds its averages, so allow ±0.2.
    const near = (a, b) => expect(Math.abs(a - b)).toBeLessThan(0.2);
    near(rsi(RSI_CLOSES, 14), 70.53);
    near(rsi([...RSI_CLOSES, 46.0], 14), 66.32);
    near(rsi([...RSI_CLOSES, 46.0, 46.03], 14), 66.55);
    near(rsi([...RSI_CLOSES, 46.0, 46.03, 46.41], 14), 69.41);
  });

  it("rsi edge cases", () => {
    expect(rsi([1, 2, 3], 14)).toBeNull();
    const up = Array.from({ length: 20 }, (_, i) => i + 1);
    expect(rsi(up, 14)).toBe(100);
    expect(rsi(Array(20).fill(5), 14)).toBe(50);
  });

  it("returns and volume ratio", () => {
    expect(pctReturn([100, 105, 110], 2)).toBeCloseTo(0.1);
    expect(pctReturn([100], 5)).toBeNull();
    const vols = [...Array(40).fill(100), ...Array(20).fill(200)];
    expect(volumeRatio(vols, 20, 60)).toBeCloseTo(200 / (4000 / 60 + 4000 / 60), 5);
    expect(volumeRatio(vols.slice(0, 30))).toBeNull();
  });

  it("computeTechnicals handles short history", () => {
    const t = computeTechnicals([{ close: 10, volume: 1 }, { close: 11, volume: 1 }]);
    expect(t.price).toBe(11);
    expect(t.sma50).toBeNull();
    expect(t.rsi14).toBeNull();
  });
});

describe("percentile scoring", () => {
  const pop = [10, 20, 30, 40, 50];
  it("ranks within the population", () => {
    expect(percentileRank(pop, 10)).toBe(0);
    expect(percentileRank(pop, 30)).toBe(50);
    expect(percentileRank(pop, 50)).toBe(100);
    expect(percentileRank(pop, 10, false)).toBe(100);
  });
  it("ties share a score and nulls are ignored", () => {
    expect(percentileRank([5, 5, 5], 5)).toBe(50);
    expect(percentileRank([10, null, 30, undefined], 30)).toBe(100);
    expect(percentileRank(pop, null)).toBeNull();
    expect(percentileRank([7], 7)).toBe(NEUTRAL);
  });
  it("component transforms", () => {
    expect(rsiScore(50)).toBe(100);
    expect(rsiScore(70)).toBe(50);
    expect(rsiScore(85)).toBe(0);
    expect(rsiScore(30)).toBe(50);
    expect(rsiScore(null)).toBeNull();
    expect(volumeScore(1)).toBe(50);
    expect(volumeScore(2)).toBe(100);
    expect(distanceScore(110, 100, 10)).toBe(100);
    expect(distanceScore(100, 100)).toBe(50);
  });
});

const fullRow = (ticker, over = {}) => ({
  ticker,
  sector: "Tech",
  fundamentals: {
    forwardPE: 20, peg: 1.5, priceToBook: 4, revenueGrowth: 0.1, earningsGrowth: 0.1,
    roe: 0.2, profitMargin: 0.15, debtToEquity: 0.5, ...over.fundamentals,
  },
  technicals: {
    price: 100, sma50: 95, sma200: 90, rsi14: 55, ret1m: 0.02, ret3m: 0.05, volRatio: 1.1, ...over.technicals,
  },
  fundamentalSentiment: over.fundamentalSentiment ?? 0.6,
  news: over.news ?? { score: 0.2, change: 0.1 },
});

describe("scoreSector", () => {
  it("cheaper, faster-growing stock gets the higher long score", () => {
    const [a, b] = scoreSector([
      fullRow("CHEAP", { fundamentals: { forwardPE: 10, peg: 0.8, revenueGrowth: 0.3, earningsGrowth: 0.4 } }),
      fullRow("PRICY", { fundamentals: { forwardPE: 40, peg: 3, revenueGrowth: 0.02, earningsGrowth: -0.1 } }),
    ]);
    expect(a.longScore).toBeGreaterThan(b.longScore);
    expect(a.components.long.valuation).toBeGreaterThan(b.components.long.valuation);
  });

  it("negative P/E counts as the worst valuation, not the best", () => {
    const [loss, profit] = scoreSector([
      fullRow("LOSS", { fundamentals: { forwardPE: -5 } }),
      fullRow("PROFIT", { fundamentals: { forwardPE: 30 } }),
    ]);
    expect(loss.components.long.valuation).toBeLessThan(profit.components.long.valuation);
  });

  it("missing fundamentals score neutral 50 and are listed, without crashing", () => {
    const rows = scoreSector([
      { ticker: "EMPTY", sector: "Tech" },
      fullRow("FULL"),
      { ticker: "NULLS", sector: "Tech", fundamentals: { forwardPE: null, roe: undefined }, technicals: {}, news: null },
    ]);
    const empty = rows[0];
    expect(empty.components.long).toEqual({ valuation: 50, growth: 50, quality: 50, sentiment: 50, trend: 50 });
    expect(empty.components.short).toEqual({ momentum: 50, news: 50, trend: 50, rsi: 50, volume: 50 });
    expect(empty.longScore).toBe(50);
    expect(empty.shortScore).toBe(50);
    expect(empty.components.missing).toContain("forwardPE");
    expect(empty.components.missing).toContain("rsi14");
    expect(rows[2].longScore).toBe(50);
    expect(rows[1].components.missing).toEqual([]);
  });

  it("overbought RSI lowers the short score", () => {
    const [calm, hot] = scoreSector([
      fullRow("CALM", { technicals: { rsi14: 55 } }),
      fullRow("HOT", { technicals: { rsi14: 82 } }),
    ]);
    expect(calm.shortScore).toBeGreaterThan(hot.shortScore);
  });

  it("scores stay within 0-100", () => {
    const rows = scoreSector([
      fullRow("A", { technicals: { ret1m: 0.5, ret3m: 1, volRatio: 5, rsi14: 50, price: 200 }, news: { score: 1, change: 1 }, fundamentalSentiment: 1 }),
      fullRow("B", { technicals: { ret1m: -0.5, ret3m: -0.6, volRatio: 0.1, rsi14: 95, price: 50 }, news: { score: -1, change: -1 }, fundamentalSentiment: 0 }),
    ]);
    for (const r of rows) {
      expect(r.longScore).toBeGreaterThanOrEqual(0);
      expect(r.longScore).toBeLessThanOrEqual(100);
      expect(r.shortScore).toBeGreaterThanOrEqual(0);
      expect(r.shortScore).toBeLessThanOrEqual(100);
    }
  });
});

describe("rank changes across two days", () => {
  it("rankChange badges", () => {
    expect(rankChange(null, 3)).toBe("new");
    expect(rankChange(5, 2)).toBe("up");
    expect(rankChange(2, 5)).toBe("down");
    expect(rankChange(4, 4)).toBe("same");
    expect(rankChange(12, 8, 10)).toBe("new");
    expect(rankChange(8, 12, 10)).toBe("dropped");
    expect(rankChange(8, null, 10)).toBe("dropped");
    expect(rankChange(15, 20, 10)).toBe("down");
  });

  it("applies previous ranks, moves and drop-outs", () => {
    const today = day2.map((r) => ({ ...r }));
    rankWithinSector(today, "longScore", "longRank");
    rankWithinSector(today, "shortScore", "shortRank");
    const by = Object.fromEntries(today.map((r) => [r.ticker, r]));
    // Tech long: BBB 80, AAA 70, NEWB 65, CCC 60, DDD 50
    expect([by.BBB.longRank, by.AAA.longRank, by.NEWB.longRank, by.CCC.longRank, by.DDD.longRank]).toEqual([1, 2, 3, 4, 5]);

    const { dropped } = applyRankChanges(today, day1, 4);
    expect(by.AAA).toMatchObject({ prevLongRank: 1, longMove: "down", prevShortRank: 3, shortMove: "up" });
    expect(by.BBB).toMatchObject({ prevLongRank: 2, longMove: "up" });
    expect(by.CCC).toMatchObject({ prevLongRank: 3, longMove: "down", prevShortRank: 2, shortMove: "up" });
    expect(by.NEWB).toMatchObject({ prevLongRank: null, longMove: "new" });
    // DDD was 4th (in top 4), is now 5th -> dropped
    expect(by.DDD.longMove).toBe("dropped");
    // Changed sector: no previous rank in the new sector
    expect(by.MOVE).toMatchObject({ prevLongRank: null, longMove: "new" });

    const key = (d) => `${d.ticker}:${d.list}`;
    expect(dropped.map(key).sort()).toEqual(
      ["DDD:long", "MOVE:long", "MOVE:short"].sort()
    );
  });
});
