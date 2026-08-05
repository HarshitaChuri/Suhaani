import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import CycleRing from "../components/CycleRing";

const riskColor = { low: "--color-positive", moderate: "--color-secondary", high: "--color-primary" };

export default function Dashboard() {
  const { user } = useAuth();
  const assessment = user?.latestRiskAssessment;

  return (
    <div className="container animate-in" style={{ paddingTop: 56, paddingBottom: 80 }}>
      <h1 style={{ fontSize: 32, marginBottom: 8 }}>Hi, {user?.name?.split(" ")[0]}</h1>
      <p style={{ color: "var(--color-text-muted)", marginBottom: 40 }}>Here's your overview.</p>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 20 }}>
        <Card title="Risk screening">
          {assessment?.riskLevel ? (
            <>
              <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
                <CycleRing value={assessment.probability} colorVar={riskColor[assessment.riskLevel]} size={100} />
                <div>
                  <p style={{ textTransform: "capitalize", fontWeight: 600 }}>{assessment.riskLevel} risk</p>
                  <p style={{ fontSize: 13, color: "var(--color-text-muted)" }}>
                    Last checked {new Date(assessment.assessedAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
              {(assessment.riskLevel === "moderate" || assessment.riskLevel === "high") && (
                <Link to="/consultations" style={{ display: "block", marginTop: 14, color: "var(--color-primary)", fontWeight: 500, fontSize: 13 }}>
                  Book a consultation →
                </Link>
              )}
            </>
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

        <Card title="Doctor consultations">
          <p style={{ color: "var(--color-text-muted)", marginBottom: 16 }}>
            Find a PCOS specialist and book a real appointment slot.
          </p>
          <Link to="/consultations" style={{ color: "var(--color-primary)", fontWeight: 500 }}>
            Browse doctors →
          </Link>
        </Card>

        <Card title="Cycle tracking">
          <p style={{ color: "var(--color-text-muted)", marginBottom: 16 }}>
            Log periods and symptoms to see patterns and get predictions.
          </p>
          <Link to="/cycles" style={{ color: "var(--color-primary)", fontWeight: 500 }}>
            Open tracker →
          </Link>
        </Card>

        <Card title="Ask Suhaani">
          <p style={{ color: "var(--color-text-muted)", marginBottom: 16 }}>
            Get answers to PCOS questions — now with voice, in Hindi or Marathi too.
          </p>
          <Link to="/chat" style={{ color: "var(--color-primary)", fontWeight: 500 }}>
            Start chatting →
          </Link>
        </Card>

        <Card title="Recipes">
          <p style={{ color: "var(--color-text-muted)", marginBottom: 16 }}>
            Filter PCOS-friendly recipes by what you need right now.
          </p>
          <Link to="/recipes" style={{ color: "var(--color-primary)", fontWeight: 500 }}>
            Browse recipes →
          </Link>
        </Card>

        <Card title="Community">
          <p style={{ color: "var(--color-text-muted)", marginBottom: 16 }}>
            Share, ask, or vent — post anonymously if you'd rather.
          </p>
          <Link to="/community" style={{ color: "var(--color-primary)", fontWeight: 500 }}>
            Visit community →
          </Link>
        </Card>
      </div>
    </div>
  );
}

function Card({ title, children }) {
  return (
    <div
      className="hover-lift"
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
