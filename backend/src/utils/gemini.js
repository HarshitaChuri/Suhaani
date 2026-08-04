import axios from "axios";

const GEMINI_MODEL = process.env.GEMINI_MODEL || "gemini-3.5-flash";
const GEMINI_URL = "https://generativelanguage.googleapis.com/v1beta/interactions";

const SYSTEM_INSTRUCTIONS = `You are a supportive assistant inside a PCOS (Polycystic Ovary Syndrome) care app. Your role:
- Answer questions about PCOS symptoms, lifestyle, and general information using ONLY the provided context below.
- Be warm, clear, and non-judgmental -- many users are dealing with a sensitive, sometimes embarrassing topic.
- You are NOT a doctor. Never diagnose. Never tell someone what medication to take or what dosage.
- If a question needs medical judgment (e.g. "should I take X medication", "is this an emergency"), say clearly that a doctor should be consulted, don't guess.
- Keep answers concise -- 2-4 short paragraphs max, not an essay.
- If the provided context doesn't cover the question, say so honestly rather than inventing an answer, and suggest consulting a doctor.`;

/**
 * Calls Gemini's Interactions API (the current recommended endpoint, as of
 * mid-2026 -- Google is retiring the older generateContent endpoint pattern
 * and "standard" API keys in favor of "auth" keys) with the retrieved
 * knowledge base context + the user's question. Context grounding happens
 * by injecting the retrieved chunks directly into the prompt (the RAG
 * pattern) rather than fine-tuning.
 */
export async function askGemini(userMessage, contextChunks, chatHistory = []) {
  const contextText = contextChunks.length
    ? contextChunks.map((c) => `[${c.topic}]\n${c.content}`).join("\n\n")
    : "No specific matching information found in the knowledge base.";

  const historyText = chatHistory
    .slice(-6) // last few turns only, keeps prompt small and cheap
    .map((m) => `${m.role === "user" ? "User" : "Assistant"}: ${m.content}`)
    .join("\n");

  const prompt = `${SYSTEM_INSTRUCTIONS}

CONTEXT (curated PCOS knowledge base, use this to answer):
${contextText}

${historyText ? `RECENT CONVERSATION:\n${historyText}\n` : ""}
USER QUESTION: ${userMessage}`;

  const response = await axios.post(
    GEMINI_URL,
    {
      model: GEMINI_MODEL,
      input: prompt,
      generation_config: {
        max_output_tokens: 1024,
        thinking_level: "low",
      },
    },
    {
      headers: {
        "Content-Type": "application/json",
        "x-goog-api-key": process.env.GEMINI_API_KEY,
      },
      timeout: 15000,
    }
  );

  const outputStep = response.data?.steps?.find((s) => s.type === "model_output");
  const textBlock = outputStep?.content?.find((c) => c.type === "text");
  const reply = textBlock?.text;

  if (!reply) throw new Error("Gemini returned no usable response");

  return reply.trim();
}