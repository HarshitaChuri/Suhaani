import knowledgeBase from "../data/pcosKnowledgeBase.js";

const STOPWORDS = new Set([
  "a", "an", "the", "is", "are", "was", "were", "i", "my", "me", "you", "your",
  "do", "does", "did", "what", "why", "how", "can", "should", "it", "to", "of",
  "for", "in", "on", "and", "or", "with", "have", "has", "this", "that",
]);

function tokenize(text) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter((word) => word.length > 1 && !STOPWORDS.has(word));
}

/**
 * Scores each knowledge base entry against the query using simple term
 * overlap across the entry's keywords + content, weighted toward keyword
 * matches (curated, high-signal) over content matches (broader, lower-signal).
 * Not a real vector embedding search -- but for a ~12-entry curated KB at
 * this scale, keyword overlap performs comparably and needs zero extra
 * infrastructure (no vector DB, no embedding API calls/cost).
 */
export function retrieveRelevantChunks(query, topK = 3) {
  const queryTokens = new Set(tokenize(query));
  if (queryTokens.size === 0) return [];

  const scored = knowledgeBase.map((entry) => {
    const keywordTokens = tokenize(entry.keywords.join(" "));
    const contentTokens = tokenize(entry.content);

    let score = 0;
    queryTokens.forEach((qt) => {
      if (keywordTokens.includes(qt)) score += 3; // keyword match = strong signal
      if (contentTokens.includes(qt)) score += 1; // content match = weak signal
    });

    // Direct substring match on a full keyword phrase is a very strong signal
    entry.keywords.forEach((phrase) => {
      if (query.toLowerCase().includes(phrase)) score += 5;
    });

    return { entry, score };
  });

  const strongMatches = scored
    .filter((s) => s.score >= 2) // require more than one incidental content-word overlap
    .sort((a, b) => b.score - a.score)
    .slice(0, topK)
    .map((s) => s.entry);

  if (strongMatches.length > 0) return strongMatches;

  // No strong match -- return nothing rather than a misleading weak/incidental
  // match; Gemini's prompt already handles "no context found" gracefully.
  return [];
}
