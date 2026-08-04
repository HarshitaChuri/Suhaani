import express from "express";
import { sendMessage, getHistory, clearHistory } from "../controllers/chatController.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

router.use(protect);

router.post("/message", sendMessage);
router.get("/history", getHistory);
router.delete("/history", clearHistory);

export default router;
