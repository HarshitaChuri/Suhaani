import CycleLog from "../models/CycleLog.js";

const DAY_MS = 1000 * 60 * 60 * 24;

export async function createLog(req, res) {
  try {
    const { periodStartDate, periodEndDate, flow, mood, painLevel, symptoms, notes } = req.body;

    if (!periodStartDate) {
      return res.status(400).json({ message: "periodStartDate is required" });
    }

    const log = await CycleLog.create({
      user: req.userId,
      periodStartDate,
      periodEndDate,
      flow,
      mood,
      painLevel,
      symptoms,
      notes,
    });

    res.status(201).json({ log });
  } catch (err) {
    res.status(500).json({ message: "Failed to create cycle log", error: err.message });
  }
}

export async function updateLog(req, res) {
  try {
    const log = await CycleLog.findOneAndUpdate(
      { _id: req.params.id, user: req.userId }, // scoped to the logged-in user, can't edit others' logs
      req.body,
      { new: true, runValidators: true }
    );

    if (!log) return res.status(404).json({ message: "Log not found" });
    res.json({ log });
  } catch (err) {
    res.status(500).json({ message: "Failed to update cycle log", error: err.message });
  }
}

export async function deleteLog(req, res) {
  try {
    const log = await CycleLog.findOneAndDelete({ _id: req.params.id, user: req.userId });
    if (!log) return res.status(404).json({ message: "Log not found" });
    res.json({ message: "Deleted" });
  } catch (err) {
    res.status(500).json({ message: "Failed to delete cycle log", error: err.message });
  }
}

export async function getMyLogs(req, res) {
  try {
    const logs = await CycleLog.find({ user: req.userId }).sort({ periodStartDate: -1 });
    res.json({ logs });
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch cycle logs", error: err.message });
  }
}

/**
 * Predicts the next period start date and average cycle length from the
 * user's logged history. Needs at least 2 logged periods to compute an
 * average gap; with only 0-1 logs, returns nulls so the frontend can show
 * a "log more cycles for predictions" message instead of a guess.
 */
export async function getPrediction(req, res) {
  try {
    const logs = await CycleLog.find({ user: req.userId }).sort({ periodStartDate: 1 });

    if (logs.length < 2) {
      return res.json({
        avgCycleLength: null,
        predictedNextStart: null,
        loggedCycles: logs.length,
        message: "Log at least 2 periods to get a prediction.",
      });
    }

    const gaps = [];
    for (let i = 1; i < logs.length; i++) {
      const prev = new Date(logs[i - 1].periodStartDate);
      const curr = new Date(logs[i].periodStartDate);
      gaps.push(Math.round((curr - prev) / DAY_MS));
    }

    const avgCycleLength = Math.round(gaps.reduce((a, b) => a + b, 0) / gaps.length);

    const lastStart = new Date(logs[logs.length - 1].periodStartDate);
    const predictedNextStart = new Date(lastStart.getTime() + avgCycleLength * DAY_MS);

    res.json({
      avgCycleLength,
      predictedNextStart,
      loggedCycles: logs.length,
      message: null,
    });
  } catch (err) {
    res.status(500).json({ message: "Failed to compute prediction", error: err.message });
  }
}
