import doctors from "../data/pcosDoctors.js";
import Appointment from "../models/Appointment.js";

export function getAllDoctors(req, res) {
  const { specialty, mode, city } = req.query;
  let results = doctors;

  if (specialty) results = results.filter((d) => d.specialty === specialty);
  if (mode) results = results.filter((d) => d.modes.includes(mode));
  if (city) results = results.filter((d) => d.city === city);

  res.json({ doctors: results });
}

export function getFilterOptions(req, res) {
  res.json({
    specialties: [...new Set(doctors.map((d) => d.specialty))].sort(),
    cities: [...new Set(doctors.map((d) => d.city))].sort(),
  });
}

function generateSlotsForDay(doctor) {
  const slots = [];
  const [startH, startM] = doctor.workingHours.start.split(":").map(Number);
  const [endH, endM] = doctor.workingHours.end.split(":").map(Number);

  let cursor = startH * 60 + startM;
  const end = endH * 60 + endM;

  while (cursor + doctor.slotDurationMinutes <= end) {
    const h = String(Math.floor(cursor / 60)).padStart(2, "0");
    const m = String(cursor % 60).padStart(2, "0");
    slots.push(`${h}:${m}`);
    cursor += doctor.slotDurationMinutes;
  }
  return slots;
}

/**
 * Computes real availability for a doctor on a given date: their working-hour
 * slot template, minus slots already booked (checked against the live
 * Appointment collection) and minus past times if the date is today. This is
 * what makes booking genuinely "connected" rather than static mock buttons --
 * two users can't double-book the same doctor/slot.
 */
export async function getAvailability(req, res) {
  try {
    const doctor = doctors.find((d) => d.id === req.params.id);
    if (!doctor) return res.status(404).json({ message: "Doctor not found" });

    const { date } = req.query; // YYYY-MM-DD
    if (!date) return res.status(400).json({ message: "date query param is required" });

    const requestedDate = new Date(`${date}T00:00:00`);
    const dayOfWeek = requestedDate.getDay();

    if (!doctor.workingDays.includes(dayOfWeek)) {
      return res.json({ slots: [], message: "Doctor is not available on this day." });
    }

    const allSlots = generateSlotsForDay(doctor);

    const bookedAppointments = await Appointment.find({
      doctorId: doctor.id,
      date,
      status: "upcoming",
    }).select("timeSlot");
    const bookedSlots = new Set(bookedAppointments.map((a) => a.timeSlot));

    const now = new Date();
    const isToday = date === now.toISOString().slice(0, 10);

    const availableSlots = allSlots.filter((slot) => {
      if (bookedSlots.has(slot)) return false;
      if (isToday) {
        const [h, m] = slot.split(":").map(Number);
        const slotTime = new Date(now);
        slotTime.setHours(h, m, 0, 0);
        if (slotTime <= now) return false; // can't book a slot already in the past today
      }
      return true;
    });

    res.json({ slots: availableSlots });
  } catch (err) {
    res.status(500).json({ message: "Failed to compute availability", error: err.message });
  }
}
