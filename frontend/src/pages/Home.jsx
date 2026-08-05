import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const FEATURES = [
  { icon: "🩺", title: "Early screening", desc: "A research-backed model estimates your risk in minutes." },
  { icon: "🌙", title: "Cycle tracking", desc: "Log periods and symptoms, see patterns, get predictions." },
  { icon: "💬", title: "Ask Suhaani", desc: "A chatbot grounded in real PCOS knowledge, in your language." },
  { icon: "🍲", title: "PCOS-friendly recipes", desc: "Filtered by what actually helps your symptoms." },
  { icon: "🤝", title: "Community", desc: "Share, ask, or vent — anonymously if you'd rather." },
  { icon: "📅", title: "Book a doctor", desc: "Real appointment slots with PCOS specialists." },
];

export default function Home() {
  const { user } = useAuth();

  return (
    <div>
      <div style={{ background: "var(--gradient-soft)", borderBottom: "1px solid var(--color-border)" }}>
        <div className="container" style={{ paddingTop: 100, paddingBottom: 90, maxWidth: 760 }}>
          <p className="animate-in" style={{ fontFamily: "var(--font-mono)", color: "var(--color-secondary)", fontSize: 13, letterSpacing: 1, textTransform: "uppercase", marginBottom: 16, fontWeight: 600 }}>
            Early screening · cycle tracking · care, together
          </p>
          <h1
            className="animate-in-delay-1"
            style={{
              fontSize: 52,
              lineHeight: 1.12,
              marginBottom: 24,
              background: "var(--gradient-primary)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            Understand your cycle before the diagnosis does.
          </h1>
          <p className="animate-in-delay-2" style={{ fontSize: 18, color: "var(--color-text-muted)", marginBottom: 40, lineHeight: 1.6, maxWidth: 560 }}>
            A free, non-invasive PCOS screening tool built on real clinical research —
            plus cycle tracking, a symptom chatbot, and a community that gets it. Meet Suhaani.
          </p>
          <div className="animate-in-delay-3">
            <Link
              to={user ? "/dashboard" : "/register"}
              className="pulse-accent"
              style={{
                display: "inline-block",
                background: "var(--gradient-primary)",
                color: "white",
                padding: "16px 32px",
                borderRadius: "var(--radius-sm)",
                fontWeight: 600,
                fontSize: 16,
              }}
            >
              {user ? "Go to dashboard" : "Get started, it's free"}
            </Link>
          </div>
        </div>
      </div>

      <div className="container" style={{ paddingTop: 64, paddingBottom: 90 }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 20 }}>
          {FEATURES.map((f, i) => (
            <div
              key={f.title}
              className={`hover-lift animate-in-delay-${Math.min(i + 1, 3)}`}
              style={{
                background: "var(--color-surface)",
                borderRadius: "var(--radius)",
                boxShadow: "var(--shadow)",
                padding: 24,
              }}
            >
              <div style={{ fontSize: 28, marginBottom: 12 }}>{f.icon}</div>
              <h3 style={{ fontSize: 16, marginBottom: 6 }}>{f.title}</h3>
              <p style={{ fontSize: 13, color: "var(--color-text-muted)", lineHeight: 1.5 }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
