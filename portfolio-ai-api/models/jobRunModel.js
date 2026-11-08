import mongoose from "mongoose";

// One document per run of jobs/rankStocks.js, so the API can show when the
// rankings were last refreshed and whether the last run failed.
const jobRunSchema = new mongoose.Schema(
  {
    type: { type: String, enum: ["full", "sentiment"], required: true },
    status: { type: String, enum: ["running", "success", "partial", "failed"], default: "running" },
    date: String, // trading day the run wrote, YYYY-MM-DD
    counts: {
      universe: { type: Number, default: 0 },
      scored: { type: Number, default: 0 },
      failed: { type: Number, default: 0 },
      written: { type: Number, default: 0 },
      pruned: { type: Number, default: 0 },
      llmScored: { type: Number, default: 0 },
    },
    failedTickers: { type: [String], default: [] },
    sources: { type: mongoose.Schema.Types.Mixed, default: {} }, // data-source status / limitations
    startedAt: { type: Date, default: Date.now },
    durationMs: Number,
    error: String,
  },
  { timestamps: true }
);

jobRunSchema.index({ type: 1, startedAt: -1 });

export default mongoose.models.JobRun || mongoose.model("JobRun", jobRunSchema);
