import { useState, useEffect, useRef } from "react";
import api from "../api/client";
import { inputStyle, buttonStyle } from "./Login";

export default function Chatbot() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const scrollRef = useRef(null);

  useEffect(() => {
    api.get("/chatbot/history")
      .then((res) => setMessages(res.data.messages))
      .catch(() => setError("Failed to load chat history."))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function handleSend(e) {
    e.preventDefault();
    const text = input.trim();
    if (!text || sending) return;

    setError("");
    setInput("");
    // Optimistically show the user's message immediately
    setMessages((m) => [...m, { role: "user", content: text, _id: `temp-${Date.now()}` }]);
    setSending(true);

    try {
      const res = await api.post("/chatbot/message", { message: text });
      setMessages((m) => [...m, res.data.reply]);
    } catch (err) {
      setError(err.response?.data?.message || "The chatbot didn't respond. Please try again.");
    } finally {
      setSending(false);
    }
  }

  async function handleClear() {
    if (!confirm("Clear your entire chat history?")) return;
    try {
      await api.delete("/chatbot/history");
      setMessages([]);
    } catch {
      setError("Failed to clear history.");
    }
  }

  return (
    <div className="container" style={{ paddingTop: 56, paddingBottom: 40, maxWidth: 720 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 32, marginBottom: 8 }}>Ask about PCOS</h1>
          <p style={{ color: "var(--color-text-muted)" }}>Get answers grounded in curated PCOS information. Not a substitute for medical advice.</p>
        </div>
        {messages.length > 0 && (
          <button onClick={handleClear} style={{ background: "transparent", border: "1px solid var(--color-border)", borderRadius: "var(--radius-sm)", padding: "8px 14px", fontSize: 13 }}>
            Clear chat
          </button>
        )}
      </div>

      <div
        style={{
          background: "var(--color-surface)",
          borderRadius: "var(--radius)",
          boxShadow: "var(--shadow)",
          height: 480,
          display: "flex",
          flexDirection: "column",
        }}
      >
        <div style={{ flex: 1, overflowY: "auto", padding: 20, display: "flex", flexDirection: "column", gap: 14 }}>
          {loading ? (
            <p style={{ color: "var(--color-text-muted)", textAlign: "center", marginTop: 40 }}>Loading...</p>
          ) : messages.length === 0 ? (
            <div style={{ textAlign: "center", marginTop: 60, color: "var(--color-text-muted)" }}>
              <p style={{ fontSize: 14 }}>Try asking things like:</p>
              <p style={{ fontSize: 13, marginTop: 8 }}>"Why are my periods irregular?" · "What should I eat?" · "Can I still get pregnant?"</p>
            </div>
          ) : (
            messages.map((m) => (
              <div key={m._id} style={{ display: "flex", justifyContent: m.role === "user" ? "flex-end" : "flex-start" }}>
                <div
                  style={{
                    maxWidth: "75%",
                    padding: "10px 16px",
                    borderRadius: 16,
                    background: m.role === "user" ? "var(--color-primary)" : "var(--color-bg)",
                    color: m.role === "user" ? "white" : "var(--color-text)",
                    fontSize: 14,
                    lineHeight: 1.5,
                    whiteSpace: "pre-wrap",
                  }}
                >
                  {m.content}
                </div>
              </div>
            ))
          )}
          {sending && (
            <div style={{ display: "flex", justifyContent: "flex-start" }}>
              <div style={{ padding: "10px 16px", borderRadius: 16, background: "var(--color-bg)", fontSize: 14, color: "var(--color-text-muted)" }}>
                Thinking...
              </div>
            </div>
          )}
          <div ref={scrollRef} />
        </div>

        <form onSubmit={handleSend} style={{ display: "flex", gap: 10, padding: 16, borderTop: "1px solid var(--color-border)" }}>
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask a question..."
            style={{ ...inputStyle, flex: 1 }}
          />
          <button type="submit" disabled={sending || !input.trim()} style={{ ...buttonStyle, padding: "12px 20px" }}>
            Send
          </button>
        </form>
      </div>

      {error && <p style={{ color: "#B3261E", fontSize: 14, marginTop: 12 }}>{error}</p>}
    </div>
  );
}
