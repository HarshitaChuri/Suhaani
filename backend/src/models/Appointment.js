import mongoose from "mongoose";

const appointmentSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    doctorId: { type: String, required: true }, // references the mocked doctor dataset, not a Mongo doc
    doctorName: { type: String, required: true }, // denormalized so we don't need to re-join mock data on every read
    doctorSpecialty: { type: String, required: true },
    date: { type: String, required: true }, // YYYY-MM-DD
    timeSlot: { type: String, required: true }, // e.g. "10:30"
    mode: { type: String, enum: ["online", "offline"], required: true },
    reasonForVisit: { type: String, maxlength: 500 },
    status: { type: String, enum: ["upcoming", "completed", "cancelled"], default: "upcoming" },
  },
  { timestamps: true }
);

// Prevents double-booking the same doctor/date/slot at the DB level, not
// just in application logic -- a second request racing the first one will
// fail here even if both passed the earlier availability check.
appointmentSchema.index({ doctorId: 1, date: 1, timeSlot: 1 }, { unique: true, partialFilterExpression: { status: "upcoming" } });

export default mongoose.model("Appointment", appointmentSchema);
