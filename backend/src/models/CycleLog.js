import mongoose from "mongoose";

const cycleLogSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    periodStartDate: { type: Date, required: true },
    periodEndDate: { type: Date }, // optional, filled in once the period ends
    flow: { type: String, enum: ["light", "medium", "heavy", null], default: null },
    mood: [{ type: String }], // e.g. ["irritable", "low energy"]
    painLevel: { type: Number, min: 0, max: 10, default: 0 },
    symptoms: [{ type: String }], // e.g. ["bloating", "acne", "headache"]
    notes: { type: String, maxlength: 500 },
  },
  { timestamps: true }
);

// Fast lookup of a user's logs sorted by date
cycleLogSchema.index({ user: 1, periodStartDate: -1 });

export default mongoose.model("CycleLog", cycleLogSchema);
