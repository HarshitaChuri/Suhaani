import { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import api from "../api/client";
import { buttonStyle } from "./Login";

function nextNDays(n) {
  const days = [];
  const today = new Date();
  for (let i = 0; i < n; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    days.push(d);
  }
  return days;
}

function toDateKey(date) {
  return date.toISOString().slice(0, 10);
}

export default function Consultations() {
  const [searchParams] = useSearchParams();
  const [tab, setTab] = useState(searchParams.get("tab") === "appointments" ? "appointments" : "find");

  return (
    <div className="container" style={{ paddingTop: 56, paddingBottom: 80, maxWidth: 900 }}>
      <h1 style={{ fontSize: 32, marginBottom: 8 }}>Doctor consultations</h1>
      <p style={{ color: "var(--color-text-muted)", marginBottom: 24 }}>
        Find a PCOS specialist and book a real time slot — online or in person.
      </p>

      <div style={{ display: "flex", gap: 8, marginBottom: 28, borderBottom: "1px solid var(--color-border)" }}>
        <TabButton active={tab === "find"} onClick={() => setTab("find")} label="Find a doctor" />
        <TabButton active={tab === "appointments"} onClick={() => setTab("appointments")} label="My appointments" />
      </div>

      {tab === "find" ? <FindDoctor /> : <MyAppointments />}
    </div>
  );
}

function TabButton({ active, onClick, label }) {
  return (
    <button
      onClick={onClick}
      style={{
        background: "none",
        border: "none",
        padding: "10px 4px",
        fontSize: 14,
        fontWeight: active ? 600 : 400,
        color: active ? "var(--color-primary)" : "var(--color-text-muted)",
        borderBottom: active ? "2px solid var(--color-primary)" : "2px solid transparent",
        marginRight: 20,
      }}
    >
      {label}
    </button>
  );
}

function FindDoctor() {
  const [doctors, setDoctors] = useState([]);
  const [filters, setFilters] = useState({ specialties: [], cities: [] });
  const [specialty, setSpecialty] = useState("");
  const [mode, setMode] = useState("");
  const [loading, setLoading] = useState(true);
  const [selectedDoctor, setSelectedDoctor] = useState(null);

  const loadDoctors = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (specialty) params.set("specialty", specialty);
    if (mode) params.set("mode", mode);
    const res = await api.get(`/doctors?${params}`);
    setDoctors(res.data.doctors);
    setLoading(false);
  }, [specialty, mode]);

  useEffect(() => {
    api.get("/doctors/filters").then((res) => setFilters(res.data));
  }, []);

  useEffect(() => {
    loadDoctors();
  }, [loadDoctors]);

  if (selectedDoctor) {
    return <BookingFlow doctor={selectedDoctor} onBack={() => setSelectedDoctor(null)} />;
  }

  return (
    <div>
      <div style={{ display: "flex", gap: 10, marginBottom: 20, flexWrap: "wrap" }}>
        <select value={specialty} onChange={(e) => setSpecialty(e.target.value)} style={selectStyle}>
          <option value="">All specialties</option>
          {filters.specialties.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
        <select value={mode} onChange={(e) => setMode(e.target.value)} style={selectStyle}>
          <option value="">Online or offline</option>
          <option value="online">Online only</option>
          <option value="offline">In-person only</option>
        </select>
      </div>

      {loading ? (
        <p style={{ color: "var(--color-text-muted)" }}>Loading...</p>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {doctors.map((doc) => (
            <div key={doc.id} style={{ background: "var(--color-surface)", borderRadius: "var(--radius)", boxShadow: "var(--shadow)", padding: 20, display: "flex", justifyContent: "space-between", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
              <div style={{ display: "flex", gap: 14 }}>
                <div style={{ width: 48, height: 48, borderRadius: "50%", background: "var(--color-bg)", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "var(--font-display)", fontSize: 18, color: "var(--color-primary)", flexShrink: 0 }}>
                  {doc.name.replace("Dr. ", "")[0]}
                </div>
                <div>
                  <p style={{ fontWeight: 600 }}>{doc.name}</p>
                  <p style={{ fontSize: 13, color: "var(--color-text-muted)" }}>{doc.specialty} · {doc.experienceYears} yrs exp · {doc.city}</p>
                  <p style={{ fontSize: 13, marginTop: 4, maxWidth: 420 }}>{doc.bio}</p>
                  <div style={{ display: "flex", gap: 6, marginTop: 8 }}>
                    {doc.modes.map((m) => (
                      <span key={m} style={{ fontSize: 11, background: "var(--color-bg)", color: "var(--color-text-muted)", padding: "3px 8px", borderRadius: 999, textTransform: "capitalize" }}>{m}</span>
                    ))}
                    <span style={{ fontSize: 11, color: "var(--color-secondary)" }}>★ {doc.rating}</span>
                  </div>
                </div>
              </div>
              <div style={{ textAlign: "right" }}>
                <p style={{ fontFamily: "var(--font-mono)", fontSize: 16, marginBottom: 8 }}>₹{doc.consultationFee}</p>
                <button onClick={() => setSelectedDoctor(doc)} style={buttonStyle}>Book</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function BookingFlow({ doctor, onBack }) {
  const days = nextNDays(10);
  const [selectedDate, setSelectedDate] = useState(days[0]);
  const [slots, setSlots] = useState([]);
  const [loadingSlots, setLoadingSlots] = useState(true);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [mode, setMode] = useState(doctor.modes[0]);
  const [reason, setReason] = useState("");
  const [booking, setBooking] = useState(false);
  const [error, setError] = useState("");
  const [confirmed, setConfirmed] = useState(null);

  const loadSlots = useCallback(async () => {
    setLoadingSlots(true);
    setSelectedSlot(null);
    try {
      const res = await api.get(`/doctors/${doctor.id}/availability?date=${toDateKey(selectedDate)}`);
      setSlots(res.data.slots);
    } catch {
      setSlots([]);
    } finally {
      setLoadingSlots(false);
    }
  }, [doctor.id, selectedDate]);

  useEffect(() => {
    loadSlots();
  }, [loadSlots]);

  async function handleConfirm() {
    setError("");
    setBooking(true);
    try {
      const res = await api.post("/appointments", {
        doctorId: doctor.id,
        date: toDateKey(selectedDate),
        timeSlot: selectedSlot,
        mode,
        reasonForVisit: reason,
      });
      setConfirmed(res.data.appointment);
    } catch (err) {
      setError(err.response?.data?.message || "Booking failed. Please try another slot.");
      loadSlots(); // slot may have just been taken -- refresh
    } finally {
      setBooking(false);
    }
  }

  if (confirmed) {
    return (
      <div style={{ background: "var(--color-surface)", borderRadius: "var(--radius)", boxShadow: "var(--shadow)", padding: 32, textAlign: "center" }}>
        <p style={{ fontSize: 40, marginBottom: 12 }}>✓</p>
        <h2 style={{ fontSize: 22, marginBottom: 8 }}>Appointment confirmed</h2>
        <p style={{ color: "var(--color-text-muted)" }}>
          {doctor.name} · {new Date(confirmed.date).toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" })} at {confirmed.timeSlot}
        </p>
        <button onClick={onBack} style={{ ...buttonStyle, marginTop: 20 }}>Back to doctors</button>
      </div>
    );
  }

  return (
    <div>
      <button onClick={onBack} style={{ background: "none", border: "none", color: "var(--color-text-muted)", fontSize: 13, marginBottom: 16 }}>← Back to doctors</button>

      <div style={{ background: "var(--color-surface)", borderRadius: "var(--radius)", boxShadow: "var(--shadow)", padding: 24 }}>
        <p style={{ fontWeight: 600, fontSize: 18 }}>{doctor.name}</p>
        <p style={{ fontSize: 13, color: "var(--color-text-muted)", marginBottom: 20 }}>{doctor.specialty} · ₹{doctor.consultationFee} per session</p>

        <p style={labelStyle}>Choose a date</p>
        <div style={{ display: "flex", gap: 8, overflowX: "auto", paddingBottom: 8, marginBottom: 20 }}>
          {days.map((d) => {
            const active = toDateKey(d) === toDateKey(selectedDate);
            return (
              <button
                key={toDateKey(d)}
                onClick={() => setSelectedDate(d)}
                style={{
                  flexShrink: 0,
                  minWidth: 56,
                  padding: "8px 4px",
                  borderRadius: "var(--radius-sm)",
                  border: `1px solid ${active ? "var(--color-primary)" : "var(--color-border)"}`,
                  background: active ? "var(--color-primary)" : "transparent",
                  color: active ? "white" : "var(--color-text)",
                  textAlign: "center",
                }}
              >
                <div style={{ fontSize: 11 }}>{d.toLocaleDateString(undefined, { weekday: "short" })}</div>
                <div style={{ fontSize: 14, fontWeight: 600 }}>{d.getDate()}</div>
              </button>
            );
          })}
        </div>

        <p style={labelStyle}>Choose a time</p>
        {loadingSlots ? (
          <p style={{ fontSize: 13, color: "var(--color-text-muted)", marginBottom: 20 }}>Loading availability...</p>
        ) : slots.length === 0 ? (
          <p style={{ fontSize: 13, color: "var(--color-text-muted)", marginBottom: 20 }}>No slots available this day — try another date.</p>
        ) : (
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 20 }}>
            {slots.map((slot) => (
              <button
                key={slot}
                onClick={() => setSelectedSlot(slot)}
                style={{
                  padding: "8px 14px",
                  borderRadius: "var(--radius-sm)",
                  border: `1px solid ${selectedSlot === slot ? "var(--color-primary)" : "var(--color-border)"}`,
                  background: selectedSlot === slot ? "var(--color-primary)" : "transparent",
                  color: selectedSlot === slot ? "white" : "var(--color-text)",
                  fontSize: 13,
                }}
              >
                {slot}
              </button>
            ))}
          </div>
        )}

        {doctor.modes.length > 1 && (
          <>
            <p style={labelStyle}>Consultation mode</p>
            <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
              {doctor.modes.map((m) => (
                <button
                  key={m}
                  onClick={() => setMode(m)}
                  style={{
                    padding: "8px 16px",
                    borderRadius: "var(--radius-sm)",
                    border: `1px solid ${mode === m ? "var(--color-primary)" : "var(--color-border)"}`,
                    background: mode === m ? "var(--color-primary)" : "transparent",
                    color: mode === m ? "white" : "var(--color-text)",
                    fontSize: 13,
                    textTransform: "capitalize",
                  }}
                >
                  {m}
                </button>
              ))}
            </div>
          </>
        )}

        <p style={labelStyle}>Reason for visit (optional)</p>
        <textarea
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          rows={3}
          placeholder="Briefly describe what you'd like to discuss..."
          style={{ width: "100%", border: "1px solid var(--color-border)", borderRadius: "var(--radius-sm)", padding: 12, fontFamily: "var(--font-body)", fontSize: 14, resize: "vertical", marginBottom: 20 }}
        />

        {error && <p style={{ color: "#B3261E", fontSize: 14, marginBottom: 12 }}>{error}</p>}

        <button onClick={handleConfirm} disabled={!selectedSlot || booking} style={{ ...buttonStyle, width: "100%" }}>
          {booking ? "Booking..." : selectedSlot ? `Confirm ${selectedSlot} on ${selectedDate.toLocaleDateString(undefined, { month: "short", day: "numeric" })}` : "Select a time slot"}
        </button>
      </div>
    </div>
  );
}

function MyAppointments() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    const res = await api.get("/appointments/my");
    setAppointments(res.data.appointments);
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function handleCancel(id) {
    if (!confirm("Cancel this appointment?")) return;
    await api.patch(`/appointments/${id}/cancel`);
    load();
  }

  if (loading) return <p style={{ color: "var(--color-text-muted)" }}>Loading...</p>;
  if (appointments.length === 0) return <p style={{ color: "var(--color-text-muted)" }}>No appointments booked yet.</p>;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      {appointments.map((appt) => (
        <div key={appt._id} style={{ background: "var(--color-surface)", borderRadius: "var(--radius)", boxShadow: "var(--shadow)", padding: 18, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 10 }}>
          <div>
            <p style={{ fontWeight: 600 }}>{appt.doctorName}</p>
            <p style={{ fontSize: 13, color: "var(--color-text-muted)" }}>
              {appt.doctorSpecialty} · {new Date(appt.date).toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" })} at {appt.timeSlot} · {appt.mode}
            </p>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <StatusBadge status={appt.status} />
            {appt.status === "upcoming" && (
              <button onClick={() => handleCancel(appt._id)} style={{ background: "none", border: "1px solid var(--color-border)", borderRadius: "var(--radius-sm)", padding: "6px 12px", fontSize: 12 }}>
                Cancel
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

function StatusBadge({ status }) {
  const colors = { upcoming: "--color-positive", completed: "--color-text-muted", cancelled: "--color-primary" };
  return (
    <span style={{ fontSize: 11, padding: "3px 10px", borderRadius: 999, background: `var(${colors[status]})`, color: "white", textTransform: "capitalize" }}>
      {status}
    </span>
  );
}

const selectStyle = {
  border: "1px solid var(--color-border)",
  borderRadius: "var(--radius-sm)",
  padding: "8px 12px",
  fontSize: 13,
  background: "var(--color-surface)",
};

const labelStyle = {
  fontSize: 12,
  fontFamily: "var(--font-mono)",
  color: "var(--color-text-muted)",
  marginBottom: 8,
  textTransform: "uppercase",
  letterSpacing: 0.5,
};
