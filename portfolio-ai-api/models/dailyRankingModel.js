import mongoose from "mongoose";

// One document per ticker per trading day, written by jobs/rankStocks.js.
// Ranks are within the stock's GICS sector (1 = best).
const headlineSchema = new mongoose.Schema(
  {
    headline: String,
    url: String,
    source: String,
    datetime: Date,
    score: Number, // -1..1
  },
  { _id: false }
);

const dailyRankingSchema = new mongoose.Schema(
  {
    date: { type: String, required: true }, // trading day, YYYY-MM-DD (US/Eastern)
    ticker: { type: String, required: true },
    name: String,
    sector: { type: String, required: true },
    industry: String,
    price: Number,

    longScore: Number, // 0-100
    shortScore: Number, // 0-100
    longRank: Number,
    shortRank: Number,
    prevLongRank: { type: Number, default: null },
    prevShortRank: { type: Number, default: null },
    longMove: { type: String, enum: ["new", "up", "down", "same", "dropped", null], default: null },
    shortMove: { type: String, enum: ["new", "up", "down", "same", "dropped", null], default: null },

    // { long: {valuation, growth, quality, sentiment, trend},
    //   short: {momentum, news, trend, rsi, volume},
    //   missing: [metric names that scored a neutral 50],
    //   inputs: raw metrics used (fundamentals, technicals, news, signals) }
    components: { type: mongoose.Schema.Types.Mixed, default: {} },
    topHeadlines: { type: [headlineSchema], default: [] },
    sentimentUpdatedAt: Date,
  },
  { timestamps: true }
);

dailyRankingSchema.index({ date: 1, ticker: 1 }, { unique: true });
dailyRankingSchema.index({ date: 1, sector: 1 });

export default mongoose.models.DailyRanking || mongoose.model("DailyRanking", dailyRankingSchema);
