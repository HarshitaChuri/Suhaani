import ChatMessage from "../models/ChatMessage.js";
import { retrieveRelevantChunks } from "../utils/retrieval.js";
import { askGemini } from "../utils/gemini.js";

export async function sendMessage(req, res) {
  try {
    const { message } = req.body;
    if (!message || !message.trim()) {
      return res.status(400).json({ message: "Message text is required" });
    }

    // Save the user's message first
    await ChatMessage.create({ user: req.userId, role: "user", content: message });

    // Pull recent history for conversational context
    const history = await ChatMessage.find({ user: req.userId })
      .sort({ createdAt: -1 })
      .limit(8)
      .lean();
    history.reverse();

    const contextChunks = retrieveRelevantChunks(message);
    const reply = await askGemini(message, contextChunks, history);

    const savedReply = await ChatMessage.create({ user: req.userId, role: "assistant", content: reply });

    res.status(201).json({
      reply: savedReply,
      sourcesUsed: contextChunks.map((c) => c.topic), // transparency: what grounded this answer
    });
  } catch (err) {
    if (err.response?.status === 400) {
      return res.status(502).json({ message: "The chatbot service rejected the request. Check GEMINI_API_KEY." });
    }
    res.status(500).json({ message: "Chatbot failed to respond", error: err.message });
  }
}

export async function getHistory(req, res) {
  try {
    const messages = await ChatMessage.find({ user: req.userId }).sort({ createdAt: 1 });
    res.json({ messages });
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch chat history", error: err.message });
  }
}

export async function clearHistory(req, res) {
  try {
    await ChatMessage.deleteMany({ user: req.userId });
    res.json({ message: "Chat history cleared" });
  } catch (err) {
    res.status(500).json({ message: "Failed to clear history", error: err.message });
  }
}
