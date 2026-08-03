import mongoose from "mongoose";

const predictionSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    inputFeatures: { type: mongoose.Schema.Types.Mixed, required: true }, // raw form data sent to the model
    riskLevel: { type: String, enum: ["low", "moderate", "high"], required: true },
    probability: { type: Number, required: true }, // 0-1 confidence score from the model
    modelUsed: { type: String, default: "random_forest_screening_v1" },
  },
  { timestamps: true }
);

export default mongoose.model("Prediction", predictionSchema);
