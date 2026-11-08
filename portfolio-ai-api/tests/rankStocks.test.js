import { describe, it, expect } from "vitest";
import { parseArgs, sampleUniverse, shiftDate, easternDate } from "../jobs/rankStocks.js";
import universe from "../data/universe.json" with { type: "json" };

describe("job helpers", () => {
  it("parses flags", () => {
    expect(parseArgs(["--limit", "30", "--sentiment-only"])).toEqual({ limit: 30, sentimentOnly: true, dryRun: false });
    expect(parseArgs([])).toEqual({ limit: null, sentimentOnly: false, dryRun: false });
    expect(() => parseArgs(["--limit", "abc"])).toThrow();
  });

  it("samples across all sectors", () => {
    const s = sampleUniverse(universe, 30);
    expect(s).toHaveLength(30);
    expect(new Set(s.map((u) => u.sector)).size).toBe(11);
  });

  it("universe is the S&P 500 with 11 GICS sectors", () => {
    expect(universe.length).toBeGreaterThan(490);
    expect(new Set(universe.map((u) => u.sector)).size).toBe(11);
    for (const u of universe) expect(u).toMatchObject({ ticker: expect.any(String), name: expect.any(String), sector: expect.any(String) });
  });

  it("date helpers", () => {
    expect(shiftDate("2026-03-01", -1)).toBe("2026-02-28");
    expect(easternDate(new Date("2026-11-06T14:30:00Z"))).toBe("2026-11-06");
    expect(easternDate(new Date("2026-11-07T02:00:00Z"))).toBe("2026-11-06");
  });
});
