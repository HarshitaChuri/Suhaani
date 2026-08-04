import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <header style={{ borderBottom: "1px solid var(--color-border)", background: "var(--color-surface)" }}>
      <nav
        className="container"
        style={{ display: "flex", alignItems: "center", justifyContent: "space-between", height: 72 }}
      >
        <Link to="/" style={{ fontFamily: "var(--font-display)", fontSize: 22, color: "var(--color-primary)" }}>
          bloom
        </Link>

        {user ? (
          <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
            <Link to="/dashboard">Dashboard</Link>
            <Link to="/cycles">Cycles</Link>
            <Link to="/screening">Screening</Link>
            <Link to="/chat">Chat</Link>
            <Link to="/recipes">Recipes</Link>
            <button
              onClick={() => { logout(); navigate("/login"); }}
              style={{
                background: "transparent",
                border: "1px solid var(--color-border)",
                borderRadius: "var(--radius-sm)",
                padding: "8px 16px",
                fontSize: 14,
              }}
            >
              Log out
            </button>
          </div>
        ) : (
          <div style={{ display: "flex", gap: 16 }}>
            <Link to="/login">Log in</Link>
            <Link
              to="/register"
              style={{
                background: "var(--color-primary)",
                color: "white",
                padding: "8px 18px",
                borderRadius: "var(--radius-sm)",
              }}
            >
              Get started
            </Link>
          </div>
        )}
      </nav>
    </header>
  );
}
