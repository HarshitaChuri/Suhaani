import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import CycleRing from "../components/CycleRing";

const riskColor = { low: "--color-positive", moderate: "--color-secondary", high: "--color-primary" };

export default function Dashboard() {
  const { user } = useAuth();
  const assessment = user?.latestRiskAssessment;

  return (
    <div className="container" style={{ paddingTop: 56, paddingBottom: 80 }}>
      <h1 style={{ fontSize: 32, marginBottom: 8 }}>Hi, {user?.name?.split(" ")[0]}</h1>
      <p style={{ color: "var(--color-text-muted)", marginBottom: 40 }}>Here's your overview.</p>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 20 }}>
        <Card title="Risk screening">
          {assessment?.riskLevel ? (
            <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
              <CycleRing value={assessment.probability} colorVar={riskColor[assessment.riskLevel]} size={100} />
              <div>
                <p style={{ textTransform: "capitalize", fontWeight: 600 }}>{assessment.riskLevel} risk</p>
                <p style={{ fontSize: 13, color: "var(--color-text-muted)" }}>
                  Last checked {new Date(assessment.assessedAt).toLocaleDateString()}
                </p>
              </div>
            </div>
          ) : (
            <>
              <p style={{ color: "var(--color-text-muted)", marginBottom: 16 }}>
                You haven't run a screening yet.
              </p>
              <Link to="/screening" style={{ color: "var(--color-primary)", fontWeight: 500 }}>
                Start screening →
              </Link>
            </>
          )}
        </Card>

        <Card title="Cycle tracking">
          <p style={{ color: "var(--color-text-muted)" }}>Coming in Phase 3 — log your cycle and symptoms here.</p>
        </Card>

        <Card title="Ask the chatbot">
          <p style={{ color: "var(--color-text-muted)" }}>Coming in Phase 4 — get answers and recipe suggestions.</p>
        </Card>

        <Card title="Community">
          <p style={{ color: "var(--color-text-muted)" }}>Coming in Phase 5 — connect with others navigating PCOS.</p>
        </Card>
      </div>
    </div>
  );
}

function Card({ title, children }) {
  return (
    <div
      style={{
        background: "var(--color-surface)",
        borderRadius: "var(--radius)",
        boxShadow: "var(--shadow)",
        padding: 24,
      }}
    >
      <h3 style={{ fontSize: 18, marginBottom: 16 }}>{title}</h3>
      {children}
    </div>
  );
}
