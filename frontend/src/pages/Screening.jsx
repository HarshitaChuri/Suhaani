import { useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/client";
import CycleRing from "../components/CycleRing";
import { inputStyle, buttonStyle } from "./Login";

const initialForm = {
  age: "",
  weight_kg: "",
  height_cm: "",
  cycle_regular: true,
  cycle_length_days: "",
  pregnant: false,
  num_abortions: "0",
  hip_inch: "",
  waist_inch: "",
  weight_gain: false,
  hair_growth_excess: false,
  skin_darkening: false,
  hair_loss: false,
  pimples: false,
  fast_food_frequent: false,
  exercise_regular: false,
};

const checkboxFields = [
  ["weight_gain", "Recent weight gain"],
  ["pimples", "Persistent acne / pimples"],
  ["hair_growth_excess", "Excess facial/body hair growth"],
  ["hair_loss", "Hair thinning or hair loss"],
  ["skin_darkening", "Skin darkening (neck, underarms)"],
  ["fast_food_frequent", "Frequent fast food consumption"],
  ["exercise_regular", "Exercise regularly"],
  ["pregnant", "Currently pregnant"],
];

const riskColor = { low: "--color-positive", moderate: "--color-secondary", high: "--color-primary" };

export default function Screening() {
  const [form, setForm] = useState(initialForm);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  function updateField(key, value) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    setResult(null);
    try {
      const payload = {
        age: Number(form.age),
        weight_kg: Number(form.weight_kg),
        height_cm: Number(form.height_cm),
        cycle_regular: form.cycle_regular,
        cycle_length_days: Number(form.cycle_length_days),
        pregnant: form.pregnant,
        num_abortions: Number(form.num_abortions || 0),
        hip_inch: Number(form.hip_inch),
        waist_inch: Number(form.waist_inch),
        weight_gain: form.weight_gain,
        hair_growth_excess: form.hair_growth_excess,
        skin_darkening: form.skin_darkening,
        hair_loss: form.hair_loss,
        pimples: form.pimples,
        fast_food_frequent: form.fast_food_frequent,
        exercise_regular: form.exercise_regular,
      };
      const res = await api.post("/predictions/screening", payload);
      setResult(res.data.prediction);
    } catch (err) {
      setError(err.response?.data?.message || "Screening failed. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="container" style={{ maxWidth: 640, paddingTop: 56, paddingBottom: 80 }}>
      <h1 style={{ fontSize: 32, marginBottom: 8 }}>Symptom screening</h1>
      <p style={{ color: "var(--color-text-muted)", marginBottom: 32 }}>
        This non-invasive screening uses body measurements, cycle info, and symptoms —
        no ultrasound or blood test needed. It's a starting point, not a diagnosis.
      </p>

      {!result ? (
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <FieldGroup title="Basics">
            <div style={{ display: "flex", gap: 12 }}>
              <input type="number" placeholder="Age" value={form.age} onChange={(e) => updateField("age", e.target.value)} required style={{ ...inputStyle, flex: 1 }} />
              <input type="number" placeholder="Weight (kg)" value={form.weight_kg} onChange={(e) => updateField("weight_kg", e.target.value)} required style={{ ...inputStyle, flex: 1 }} />
              <input type="number" placeholder="Height (cm)" value={form.height_cm} onChange={(e) => updateField("height_cm", e.target.value)} required style={{ ...inputStyle, flex: 1 }} />
            </div>
          </FieldGroup>

          <FieldGroup title="Body measurements">
            <div style={{ display: "flex", gap: 12 }}>
              <input type="number" placeholder="Hip (inches)" value={form.hip_inch} onChange={(e) => updateField("hip_inch", e.target.value)} required style={{ ...inputStyle, flex: 1 }} />
              <input type="number" placeholder="Waist (inches)" value={form.waist_inch} onChange={(e) => updateField("waist_inch", e.target.value)} required style={{ ...inputStyle, flex: 1 }} />
            </div>
          </FieldGroup>

          <FieldGroup title="Cycle info">
            <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
              <select
                value={form.cycle_regular ? "regular" : "irregular"}
                onChange={(e) => updateField("cycle_regular", e.target.value === "regular")}
                style={{ ...inputStyle, flex: 1 }}
              >
                <option value="regular">Cycle is regular</option>
                <option value="irregular">Cycle is irregular</option>
              </select>
              <input type="number" placeholder="Avg cycle length (days)" value={form.cycle_length_days} onChange={(e) => updateField("cycle_length_days", e.target.value)} required style={{ ...inputStyle, flex: 1 }} />
            </div>
            <input type="number" placeholder="Number of past pregnancy losses (0 if none)" value={form.num_abortions} onChange={(e) => updateField("num_abortions", e.target.value)} style={{ ...inputStyle, marginTop: 12 }} />
          </FieldGroup>

          <FieldGroup title="Symptoms & lifestyle">
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              {checkboxFields.map(([key, label]) => (
                <label key={key} style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 14 }}>
                  <input type="checkbox" checked={form[key]} onChange={(e) => updateField(key, e.target.checked)} />
                  {label}
                </label>
              ))}
            </div>
          </FieldGroup>

          {error && <p style={{ color: "#B3261E", fontSize: 14 }}>{error}</p>}

          <button type="submit" disabled={submitting} style={{ ...buttonStyle, marginTop: 4 }}>
            {submitting ? "Analyzing..." : "Get my results"}
          </button>
        </form>
      ) : (
        <div
          style={{
            background: "var(--color-surface)",
            borderRadius: "var(--radius)",
            boxShadow: "var(--shadow)",
            padding: 32,
            textAlign: "center",
          }}
        >
          <CycleRing value={result.probability} label="risk score" colorVar={riskColor[result.riskLevel]} size={180} />
          <h2 style={{ marginTop: 20, textTransform: "capitalize" }}>{result.riskLevel} risk</h2>
          <p style={{ color: "var(--color-text-muted)", marginTop: 12, maxWidth: 440, marginInline: "auto" }}>
            This is a screening estimate based on symptoms and measurements, not a medical
            diagnosis. Please consult a doctor for confirmation, especially for moderate or
            high results.
          </p>

          {(result.riskLevel === "moderate" || result.riskLevel === "high") && (
            <Link
              to="/consultations"
              style={{
                display: "inline-block",
                marginTop: 20,
                background: "var(--color-primary)",
                color: "white",
                padding: "12px 24px",
                borderRadius: "var(--radius-sm)",
                fontWeight: 500,
              }}
            >
              Book a doctor consultation →
            </Link>
          )}

          <div>
            <button onClick={() => { setResult(null); setForm(initialForm); }} style={{ ...buttonStyle, marginTop: 16, background: "transparent", color: "var(--color-primary)", border: "1px solid var(--color-primary)" }}>
              Take screening again
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function FieldGroup({ title, children }) {
  return (
    <div>
      <p style={{ fontFamily: "var(--font-mono)", fontSize: 12, letterSpacing: 0.5, textTransform: "uppercase", color: "var(--color-text-muted)", marginBottom: 10 }}>
        {title}
      </p>
      {children}
    </div>
  );
}
