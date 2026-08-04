import express from "express";
import { getAllDoctors, getFilterOptions, getAvailability } from "../controllers/doctorController.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

router.use(protect);

router.get("/", getAllDoctors);
router.get("/filters", getFilterOptions);
router.get("/:id/availability", getAvailability);

export default router;
