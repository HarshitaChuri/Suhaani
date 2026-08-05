import { useState, useEffect, useRef } from "react";
import api from "../api/client";
import { inputStyle, buttonStyle } from "./Login";
import { useSpeech } from "../hooks/useSpeech";

const LANGUAGES = [
  { code: "en", label: "English" },
  { code: "hi", label: "हिन्दी" },
  { code: "mr", label: "मराठी" },
];

export default function Chatbot() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [language, setLanguage] = useState("en");
  const [speakingId, setSpeakingId] = useState(null);
  const scrollRef = useRef(null);

  const {
    isListening,
    isRecognitionSupported,
    isSynthesisSupported,
    startListening,
    stopListening,
    speak,
    stopSpeaking,
  } = useSpeech(language);

  useEffect(() => {
    api.get("/chatbot/history")
      .then((res) => setMessages(res.data.messages))
      .catch(() => setError("Failed to load chat history."))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function sendMessage(text) {
    if (!text.trim() || sending) return;

    setError("");
    setInput("");
    setMessages((m) => [...m, { role: "user", content: text, _id: `temp-${Date.now()}` }]);
    setSending(true);

    try {
      const res = await api.post("/chatbot/message", { message: text, language });
      setMessages((m) => [...m, res.data.reply]);
    } catch (err) {
      setError(err.response?.data?.message || "The chatbot didn't respond. Please try again.");
    } finally {
      setSending(false);
    }
  }

  function handleSend(e) {
    e.preventDefault();
    sendMessage(input);
  }

  function handleMicClick() {
    if (isListening) {
      stopListening();
      return;
    }
    startListening(
      (transcript) => sendMessage(transcript),
      (err) => setError(typeof err === "string" ? err : "Couldn't hear that. Please try again.")
    );
  }

  function handleSpeakerClick(message) {
    if (speakingId === message._id) {
      stopSpeaking();
      setSpeakingId(null);
      return;
    }
    setSpeakingId(message._id);
    speak(message.content);
  }

  // Reset the speaking indicator once playback actually finishes
  useEffect(() => {
    if (!isSynthesisSupported) return;
    const interval = setInterval(() => {
      if (speakingId && !window.speechSynthesis.speaking) setSpeakingId(null);
    }, 300);
    return () => clearInterval(interval);
  }, [speakingId, isSynthesisSupported]);

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
    <div className="container animate-in" style={{ paddingTop: 48, paddingBottom: 40, maxWidth: 860 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20, flexWrap: "wrap", gap: 12 }}>
        <div>
          <h1 style={{ fontSize: 30, marginBottom: 6 }}>Ask Suhaani</h1>
          <p style={{ color: "var(--color-text-muted)", fontSize: 14 }}>Grounded in curated PCOS information. Not a substitute for medical advice.</p>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            title="Suhaani replies in this language"
            style={{ border: "1px solid var(--color-border)", borderRadius: "var(--radius-sm)", padding: "8px 12px", fontSize: 13, background: "var(--color-surface)" }}
          >
            {LANGUAGES.map((l) => (
              <option key={l.code} value={l.code}>{l.label}</option>
            ))}
          </select>
          {messages.length > 0 && (
            <button onClick={handleClear} style={{ background: "transparent", border: "1px solid var(--color-border)", borderRadius: "var(--radius-sm)", padding: "8px 14px", fontSize: 13 }}>
              Clear chat
            </button>
          )}
        </div>
      </div>

      <div
        style={{
          background: "var(--color-surface)",
          borderRadius: "var(--radius)",
          boxShadow: "var(--shadow)",
          height: "70vh",
          minHeight: 560,
          display: "flex",
          flexDirection: "column",
        }}
      >
        <div style={{ flex: 1, overflowY: "auto", padding: 24, display: "flex", flexDirection: "column", gap: 16 }}>
          {loading ? (
            <p style={{ color: "var(--color-text-muted)", textAlign: "center", marginTop: 40 }}>Loading...</p>
          ) : messages.length === 0 ? (
            <div style={{ textAlign: "center", marginTop: 80, color: "var(--color-text-muted)" }}>
              <p style={{ fontSize: 15 }}>Try asking things like:</p>
              <p style={{ fontSize: 13, marginTop: 8 }}>"Why are my periods irregular?" · "What should I eat?" · "Can I still get pregnant?"</p>
              {isRecognitionSupported && (
                <p style={{ fontSize: 12, marginTop: 16, color: "var(--color-secondary)" }}>🎤 Tap the mic to speak your question</p>
              )}
            </div>
          ) : (
            messages.map((m) => (
              <div key={m._id} style={{ display: "flex", justifyContent: m.role === "user" ? "flex-end" : "flex-start", gap: 6, alignItems: "flex-end" }}>
                {m.role === "assistant" && isSynthesisSupported && (
                  <button
                    onClick={() => handleSpeakerClick(m)}
                    title={speakingId === m._id ? "Stop" : "Read aloud"}
                    style={{
                      flexShrink: 0,
                      width: 30,
                      height: 30,
                      borderRadius: "50%",
                      border: "1px solid var(--color-border)",
                      background: speakingId === m._id ? "var(--color-primary)" : "var(--color-bg)",
                      color: speakingId === m._id ? "white" : "var(--color-text-muted)",
                      fontSize: 13,
                    }}
                  >
                    {speakingId === m._id ? "⏸" : "🔊"}
                  </button>
                )}
                <div
                  style={{
                    maxWidth: "72%",
                    padding: "12px 18px",
                    borderRadius: 16,
                    background: m.role === "user" ? "var(--gradient-primary)" : "var(--color-bg)",
                    color: m.role === "user" ? "white" : "var(--color-text)",
                    fontSize: 14,
                    lineHeight: 1.6,
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
              <div style={{ padding: "12px 18px", borderRadius: 16, background: "var(--color-bg)", fontSize: 14, color: "var(--color-text-muted)" }}>
                Thinking...
              </div>
            </div>
          )}
          <div ref={scrollRef} />
        </div>

        <form onSubmit={handleSend} style={{ display: "flex", gap: 10, padding: 18, borderTop: "1px solid var(--color-border)" }}>
          {isRecognitionSupported && (
            <button
              type="button"
              onClick={handleMicClick}
              title={isListening ? "Listening..." : "Tap to speak"}
              className={isListening ? "pulse-accent" : ""}
              style={{
                width: 46,
                flexShrink: 0,
                borderRadius: "var(--radius-sm)",
                border: `1px solid ${isListening ? "var(--color-primary)" : "var(--color-border)"}`,
                background: isListening ? "var(--color-primary)" : "transparent",
                color: isListening ? "white" : "var(--color-text)",
                fontSize: 17,
              }}
            >
              🎤
            </button>
          )}
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={isListening ? "Listening..." : "Ask a question..."}
            style={{ ...inputStyle, flex: 1 }}
          />
          <button type="submit" disabled={sending || !input.trim()} style={{ ...buttonStyle, padding: "12px 22px" }}>
            Send
          </button>
        </form>
      </div>

      {error && <p style={{ color: "#B3261E", fontSize: 14, marginTop: 12 }}>{error}</p>}
    </div>
  );
}
