import express from "express";
import { bookAppointment, getMyAppointments, cancelAppointment } from "../controllers/appointmentController.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

router.use(protect);

router.post("/", bookAppointment);
router.get("/my", getMyAppointments);
router.patch("/:id/cancel", cancelAppointment);

export default router;
