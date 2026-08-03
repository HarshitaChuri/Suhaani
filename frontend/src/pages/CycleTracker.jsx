import { useState, useEffect, useCallback } from "react";
import api from "../api/client";
import CycleCalendar from "../components/CycleCalendar";
import { inputStyle, buttonStyle } from "./Login";

const MOOD_OPTIONS = ["Happy", "Irritable", "Anxious", "Low energy", "Calm"];
const SYMPTOM_OPTIONS = ["Bloating", "Acne", "Headache", "Cramps", "Tender breasts", "Fatigue"];

const initialForm = {
  periodStartDate: "",
  periodEndDate: "",
  flow: "medium",
  mood: [],
  painLevel: 0,
  symptoms: [],
  notes: "",
};

export default function CycleTracker() {
  const [logs, setLogs] = useState([]);
  const [prediction, setPrediction] = useState(null);
  const [form, setForm] = useState(initialForm);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [logsRes, predictionRes] = await Promise.all([
        api.get("/cycles"),
        api.get("/cycles/prediction"),
      ]);
      setLogs(logsRes.data.logs);
      setPrediction(predictionRes.data);
    } catch (err) {
      setError("Failed to load cycle data.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  function toggleArrayField(key, value) {
    setForm((f) => {
      const arr = f[key].includes(value) ? f[key].filter((v) => v !== value) : [...f[key], value];
      return { ...f, [key]: arr };
    });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      const payload = { ...form, periodEndDate: form.periodEndDate || undefined };
      await api.post("/cycles", payload);
      setForm(initialForm);
      setShowForm(false);
      await loadData();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to log period.");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(id) {
    if (!confirm("Delete this log?")) return;
    try {
      await api.delete(`/cycles/${id}`);
      await loadData();
    } catch (err) {
      setError("Failed to delete log.");
    }
  }

  return (
    <div className="container" style={{ paddingTop: 56, paddingBottom: 80 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 32 }}>
        <div>
          <h1 style={{ fontSize: 32, marginBottom: 8 }}>Cycle tracking</h1>
          <p style={{ color: "var(--color-text-muted)" }}>Log your periods and symptoms to see patterns over time.</p>
        </div>
        <button onClick={() => setShowForm((s) => !s)} style={buttonStyle}>
          {showForm ? "Cancel" : "+ Log period"}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} style={{ background: "var(--color-surface)", borderRadius: "var(--radius)", boxShadow: "var(--shadow)", padding: 24, marginBottom: 32, display: "flex", flexDirection: "column", gap: 16 }}>
          <div style={{ display: "flex", gap: 12 }}>
            <div style={{ flex: 1 }}>
              <label style={labelStyle}>Period start date</label>
              <input type="date" required value={form.periodStartDate} onChange={(e) => setForm((f) => ({ ...f, periodStartDate: e.target.value }))} style={inputStyle} />
            </div>
            <div style={{ flex: 1 }}>
              <label style={labelStyle}>Period end date (optional)</label>
              <input type="date" value={form.periodEndDate} onChange={(e) => setForm((f) => ({ ...f, periodEndDate: e.target.value }))} style={inputStyle} />
            </div>
          </div>

          <div>
            <label style={labelStyle}>Flow</label>
            <select value={form.flow} onChange={(e) => setForm((f) => ({ ...f, flow: e.target.value }))} style={inputStyle}>
              <option value="light">Light</option>
              <option value="medium">Medium</option>
              <option value="heavy">Heavy</option>
            </select>
          </div>

          <div>
            <label style={labelStyle}>Pain level: {form.painLevel}/10</label>
            <input type="range" min="0" max="10" value={form.painLevel} onChange={(e) => setForm((f) => ({ ...f, painLevel: Number(e.target.value) }))} style={{ width: "100%" }} />
          </div>

          <ChipGroup label="Mood" options={MOOD_OPTIONS} selected={form.mood} onToggle={(v) => toggleArrayField("mood", v)} />
          <ChipGroup label="Symptoms" options={SYMPTOM_OPTIONS} selected={form.symptoms} onToggle={(v) => toggleArrayField("symptoms", v)} />

          <div>
            <label style={labelStyle}>Notes (optional)</label>
            <textarea value={form.notes} onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))} rows={3} style={{ ...inputStyle, width: "100%", resize: "vertical" }} />
          </div>

          {error && <p style={{ color: "#B3261E", fontSize: 14 }}>{error}</p>}

          <button type="submit" disabled={submitting} style={buttonStyle}>
            {submitting ? "Saving..." : "Save log"}
          </button>
        </form>
      )}

      {loading ? (
        <p style={{ color: "var(--color-text-muted)" }}>Loading...</p>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: 24, alignItems: "start" }}>
          <CycleCalendar logs={logs} predictedNextStart={prediction?.predictedNextStart} />

          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            <div style={{ background: "var(--color-surface)", borderRadius: "var(--radius)", boxShadow: "var(--shadow)", padding: 20 }}>
              <h3 style={{ fontSize: 16, marginBottom: 12 }}>Prediction</h3>
              {prediction?.predictedNextStart ? (
                <>
                  <p style={{ fontFamily: "var(--font-mono)", fontSize: 20, color: "var(--color-primary)" }}>
                    {new Date(prediction.predictedNextStart).toLocaleDateString(undefined, { month: "long", day: "numeric" })}
                  </p>
                  <p style={{ fontSize: 13, color: "var(--color-text-muted)", marginTop: 4 }}>
                    Based on an average {prediction.avgCycleLength}-day cycle across {prediction.loggedCycles} logged periods.
                  </p>
                </>
              ) : (
                <p style={{ color: "var(--color-text-muted)", fontSize: 14 }}>{prediction?.message}</p>
              )}
            </div>

            <div style={{ background: "var(--color-surface)", borderRadius: "var(--radius)", boxShadow: "var(--shadow)", padding: 20, maxHeight: 320, overflowY: "auto" }}>
              <h3 style={{ fontSize: 16, marginBottom: 12 }}>History</h3>
              {logs.length === 0 ? (
                <p style={{ color: "var(--color-text-muted)", fontSize: 14 }}>No logs yet.</p>
              ) : (
                logs.map((log) => (
                  <div key={log._id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0", borderBottom: "1px solid var(--color-border)" }}>
                    <div>
                      <p style={{ fontSize: 14, fontWeight: 500 }}>{new Date(log.periodStartDate).toLocaleDateString()}</p>
                      <p style={{ fontSize: 12, color: "var(--color-text-muted)", textTransform: "capitalize" }}>{log.flow} flow · pain {log.painLevel}/10</p>
                    </div>
                    <button onClick={() => handleDelete(log._id)} style={{ background: "transparent", border: "none", color: "var(--color-text-muted)", fontSize: 13 }}>
                      Delete
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function ChipGroup({ label, options, selected, onToggle }) {
  return (
    <div>
      <label style={labelStyle}>{label}</label>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
        {options.map((opt) => {
          const active = selected.includes(opt);
          return (
            <button
              type="button"
              key={opt}
              onClick={() => onToggle(opt)}
              style={{
                padding: "6px 14px",
                borderRadius: 999,
                border: `1px solid ${active ? "var(--color-primary)" : "var(--color-border)"}`,
                background: active ? "var(--color-primary)" : "transparent",
                color: active ? "white" : "var(--color-text)",
                fontSize: 13,
              }}
            >
              {opt}
            </button>
          );
        })}
      </div>
    </div>
  );
}

const labelStyle = {
  display: "block",
  fontSize: 12,
  fontFamily: "var(--font-mono)",
  color: "var(--color-text-muted)",
  marginBottom: 6,
  textTransform: "uppercase",
  letterSpacing: 0.5,
};
