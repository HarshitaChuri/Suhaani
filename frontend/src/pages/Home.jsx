import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Home() {
  const { user } = useAuth();

  return (
    <div className="container" style={{ paddingTop: 100, paddingBottom: 100, maxWidth: 720 }}>
      <p style={{ fontFamily: "var(--font-mono)", color: "var(--color-secondary)", fontSize: 13, letterSpacing: 1, textTransform: "uppercase", marginBottom: 16 }}>
        Early screening · cycle tracking · care, together
      </p>
      <h1 style={{ fontSize: 48, lineHeight: 1.15, marginBottom: 24 }}>
        Understand your cycle before the diagnosis does.
      </h1>
      <p style={{ fontSize: 18, color: "var(--color-text-muted)", marginBottom: 40, lineHeight: 1.6 }}>
        A free, non-invasive PCOS screening tool built on real clinical research —
        plus cycle tracking, a symptom chatbot, and a community that gets it.
      </p>
      <Link
        to={user ? "/dashboard" : "/register"}
        style={{
          display: "inline-block",
          background: "var(--color-primary)",
          color: "white",
          padding: "14px 28px",
          borderRadius: "var(--radius-sm)",
          fontWeight: 500,
        }}
      >
        {user ? "Go to dashboard" : "Get started, it's free"}
      </Link>
    </div>
  );
}
