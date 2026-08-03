import express from "express";
import { createLog, updateLog, deleteLog, getMyLogs, getPrediction } from "../controllers/cycleController.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

router.use(protect); // every cycle route requires auth

router.post("/", createLog);
router.get("/", getMyLogs);
router.get("/prediction", getPrediction);
router.put("/:id", updateLog);
router.delete("/:id", deleteLog);

export default router;
