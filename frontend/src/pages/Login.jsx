import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      await login(email, password);
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Log in failed. Check your details and try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="container" style={{ maxWidth: 420, paddingTop: 80 }}>
      <h1 style={{ fontSize: 32, marginBottom: 8 }}>Welcome back</h1>
      <p style={{ color: "var(--color-text-muted)", marginBottom: 32 }}>
        Log in to see your dashboard and cycle history.
      </p>

      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          style={inputStyle}
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          style={inputStyle}
        />
        {error && <p style={{ color: "#B3261E", fontSize: 14 }}>{error}</p>}
        <button type="submit" disabled={submitting} style={buttonStyle}>
          {submitting ? "Logging in..." : "Log in"}
        </button>
      </form>

      <p style={{ marginTop: 24, fontSize: 14, color: "var(--color-text-muted)" }}>
        New here? <Link to="/register" style={{ color: "var(--color-primary)" }}>Create an account</Link>
      </p>
    </div>
  );
}

const inputStyle = {
  padding: "12px 16px",
  borderRadius: "var(--radius-sm)",
  border: "1px solid var(--color-border)",
  fontSize: 15,
  fontFamily: "var(--font-body)",
};

const buttonStyle = {
  padding: "12px 16px",
  borderRadius: "var(--radius-sm)",
  border: "none",
  background: "var(--gradient-primary)",
  color: "white",
  fontSize: 15,
  fontWeight: 600,
};

export { inputStyle, buttonStyle };
