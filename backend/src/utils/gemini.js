import axios from "axios";

const GEMINI_MODEL = process.env.GEMINI_MODEL || "gemini-3.5-flash";
const GEMINI_URL = "https://generativelanguage.googleapis.com/v1beta/interactions";

const SYSTEM_INSTRUCTIONS = `You are Suhaani, a supportive assistant inside a PCOS (Polycystic Ovary Syndrome) care app. Your role:
- Answer questions about PCOS symptoms, causes, diagnosis, treatment, and lifestyle, using the provided context below as your primary source.
- If the context below doesn't fully cover the question, supplement with your own general, well-established medical knowledge about PCOS to give a complete and genuinely useful answer -- don't refuse or say you don't have information just because the specific context chunk is thin. Being unhelpfully narrow is worse than giving accurate general knowledge.
- Be warm, clear, and non-judgmental -- many users are dealing with a sensitive, sometimes embarrassing topic.
- You are NOT a doctor. Never diagnose an individual, never tell someone what medication or dosage to take, and never assess an individual's personal situation as if you have their full medical picture.
- If a question needs individual medical judgment (e.g. "should I take X medication", "is this an emergency", "what's wrong with me"), say clearly that a doctor should be consulted -- but you CAN and SHOULD answer general educational questions about PCOS confidently (e.g. "what causes PCOS", "is PCOS curable", "how common is PCOS").
- Keep answers concise -- 2-4 short paragraphs max, not an essay.
- Only if a question is entirely outside PCOS/reproductive health topics should you decline and redirect back to what you can help with.`;

const LANGUAGE_NAMES = {
  en: "English",
  hi: "Hindi (हिन्दी)",
  mr: "Marathi (मराठी)",
};

/**
 * Calls Gemini's Interactions API (the current recommended endpoint, as of
 * mid-2026 -- Google is retiring the older generateContent endpoint pattern
 * and "standard" API keys in favor of "auth" keys) with the retrieved
 * knowledge base context + the user's question. Context grounding happens
 * by injecting the retrieved chunks directly into the prompt (the RAG
 * pattern) rather than fine-tuning.
 *
 * `language` (e.g. "en", "hi", "mr") lets the same knowledge base and
 * retrieval logic serve replies in the user's preferred language, without
 * needing separate translated knowledge base content -- Gemini translates
 * and phrases the answer itself, grounded in the (English) retrieved context.
 */
export async function askGemini(userMessage, contextChunks, chatHistory = [], language = "en") {
  const contextText = contextChunks.length
    ? contextChunks.map((c) => `[${c.topic}]\n${c.content}`).join("\n\n")
    : "No specific matching entry found in the curated knowledge base for this question -- answer using your own general medical knowledge about PCOS instead, following the same tone and safety guidelines above.";

  const historyText = chatHistory
    .slice(-6) // last few turns only, keeps prompt small and cheap
    .map((m) => `${m.role === "user" ? "User" : "Assistant"}: ${m.content}`)
    .join("\n");

  const languageName = LANGUAGE_NAMES[language] || "English";
  const languageInstruction =
    language !== "en"
      ? `\nIMPORTANT: Respond entirely in ${languageName}, in a natural, warm, conversational tone -- not a literal word-for-word translation.`
      : "";

  const prompt = `${SYSTEM_INSTRUCTIONS}${languageInstruction}

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
        max_output_tokens: 1024, // generous headroom -- on Gemini 3.x, thinking tokens
        thinking_level: "low",   // share this same budget, so without both of these
      },                          // set, short conversational replies can get cut off
    },
    {
      headers: {
        "Content-Type": "application/json",
        "x-goog-api-key": process.env.GEMINI_API_KEY, // auth keys go in a header, not ?key=
      },
      timeout: 30000,
    }
  );

  // Interactions API response shape: steps[] contains typed steps; the
  // actual answer lives in the step with type "model_output".
  const outputStep = response.data?.steps?.find((s) => s.type === "model_output");
  const textBlock = outputStep?.content?.find((c) => c.type === "text");
  const reply = textBlock?.text;

  if (!reply) throw new Error("Gemini returned no usable response");

  return reply.trim();
}

