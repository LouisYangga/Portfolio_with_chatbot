import mongoose from "mongoose";

// Short-lived quote cache in Mongo (Render free tier loses in-memory state on sleep).
const quoteCacheSchema = new mongoose.Schema({
    ticker: { type: String, required: true, unique: true },
    name: String,
    price: Number,
    changePercent: Number,
    previousClose: Number,
    currency: String,
    updatedAt: { type: Date, default: Date.now, expires: 60 * 60 }, // TTL cleanup after 1h
});

export default mongoose.model("QuoteCache", quoteCacheSchema);
