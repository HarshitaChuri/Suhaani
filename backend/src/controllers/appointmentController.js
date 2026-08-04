import Appointment from "../models/Appointment.js";
import doctors from "../data/pcosDoctors.js";

export async function bookAppointment(req, res) {
  try {
    const { doctorId, date, timeSlot, mode, reasonForVisit } = req.body;

    if (!doctorId || !date || !timeSlot || !mode) {
      return res.status(400).json({ message: "doctorId, date, timeSlot, and mode are required" });
    }

    const doctor = doctors.find((d) => d.id === doctorId);
    if (!doctor) return res.status(404).json({ message: "Doctor not found" });
    if (!doctor.modes.includes(mode)) {
      return res.status(400).json({ message: `This doctor doesn't offer ${mode} consultations` });
    }

    const appointment = await Appointment.create({
      user: req.userId,
      doctorId,
      doctorName: doctor.name,
      doctorSpecialty: doctor.specialty,
      date,
      timeSlot,
      mode,
      reasonForVisit,
    });

    res.status(201).json({ appointment });
  } catch (err) {
    if (err.code === 11000) {
      // Unique index violation -- someone else booked this exact slot first
      return res.status(409).json({ message: "That slot was just booked by someone else. Please pick another." });
    }
    res.status(500).json({ message: "Failed to book appointment", error: err.message });
  }
}

export async function getMyAppointments(req, res) {
  try {
    const appointments = await Appointment.find({ user: req.userId }).sort({ date: -1, timeSlot: -1 });
    res.json({ appointments });
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch appointments", error: err.message });
  }
}

export async function cancelAppointment(req, res) {
  try {
    const appointment = await Appointment.findOne({ _id: req.params.id, user: req.userId });
    if (!appointment) return res.status(404).json({ message: "Appointment not found" });
    if (appointment.status !== "upcoming") {
      return res.status(400).json({ message: "Only upcoming appointments can be cancelled" });
    }

    appointment.status = "cancelled";
    await appointment.save();

    res.json({ appointment });
  } catch (err) {
    res.status(500).json({ message: "Failed to cancel appointment", error: err.message });
  }
}
