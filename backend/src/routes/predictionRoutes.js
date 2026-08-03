import express from "express";
import { runScreening, getMyPredictions } from "../controllers/predictionController.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

router.post("/screening", protect, runScreening);
router.get("/my-predictions", protect, getMyPredictions);

export default router;
