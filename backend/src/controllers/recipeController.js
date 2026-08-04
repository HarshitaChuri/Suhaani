import recipes from "../data/pcosRecipes.js";

export function getAllRecipes(req, res) {
  res.json({ recipes });
}

// Returns all unique tags so the frontend can render filter chips dynamically
// rather than hardcoding them, keeping the two in sync as recipes are added.
export function getRecipeTags(req, res) {
  const tags = [...new Set(recipes.flatMap((r) => r.tags))].sort();
  res.json({ tags });
}

export function filterRecipes(req, res) {
  const { tags } = req.body;

  if (!Array.isArray(tags) || tags.length === 0) {
    return res.json({ recipes });
  }

  // Rank by number of matching tags (best match first) rather than a strict
  // all-or-nothing filter, so users still get useful partial matches.
  const ranked = recipes
    .map((recipe) => ({
      recipe,
      matchCount: recipe.tags.filter((t) => tags.includes(t)).length,
    }))
    .filter((r) => r.matchCount > 0)
    .sort((a, b) => b.matchCount - a.matchCount)
    .map((r) => r.recipe);

  res.json({ recipes: ranked });
}
