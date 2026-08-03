import axios from "axios";
import Prediction from "../models/Prediction.js";
import User from "../models/User.js";

// Calls the FastAPI ML microservice with screening inputs and stores the result
export async function runScreening(req, res) {
  try {
    const inputFeatures = req.body;

    if (!inputFeatures || Object.keys(inputFeatures).length === 0) {
      return res.status(400).json({ message: "Screening inputs are required" });
    }

    // Call the ML microservice
    const mlResponse = await axios.post(
      `${process.env.ML_SERVICE_URL}/predict/screening`,
      inputFeatures,
      { timeout: 10000 }
    );

    const { risk_level, probability, model_used } = mlResponse.data;

    const prediction = await Prediction.create({
      user: req.userId,
      inputFeatures,
      riskLevel: risk_level,
      probability,
      modelUsed: model_used,
    });

    // Update the user's denormalized latest result for quick dashboard access
    await User.findByIdAndUpdate(req.userId, {
      latestRiskAssessment: {
        riskLevel: risk_level,
        probability,
        assessedAt: new Date(),
      },
    });

    res.status(201).json({ prediction });
  } catch (err) {
    if (err.code === "ECONNREFUSED") {
      return res.status(503).json({ message: "ML service is unavailable. Is it running?" });
    }
    res.status(500).json({ message: "Screening failed", error: err.message });
  }
}

export async function getMyPredictions(req, res) {
  try {
    const predictions = await Prediction.find({ user: req.userId }).sort({ createdAt: -1 });
    res.json({ predictions });
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch predictions", error: err.message });
  }
}
