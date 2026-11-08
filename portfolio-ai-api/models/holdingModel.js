import mongoose from "mongoose";

const holdingSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    ticker: { type: String, required: true, uppercase: true, trim: true },
    name: { type: String, default: "" },
    shares: { type: Number, required: true, min: 0 },
    avgPrice: { type: Number, required: true, min: 0 },
    notes: { type: String, default: "", maxlength: 500 },
}, { timestamps: true });

holdingSchema.index({ userId: 1, ticker: 1 }, { unique: true });

export default mongoose.model("Holding", holdingSchema);
