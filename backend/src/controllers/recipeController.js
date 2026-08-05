import recipes from "../data/pcosRecipes.js";
import User from "../models/User.js";

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

export async function toggleFavorite(req, res) {
  try {
    const recipe = recipes.find((r) => r.id === req.params.id);
    if (!recipe) return res.status(404).json({ message: "Recipe not found" });

    const user = await User.findById(req.userId);
    const alreadyFavorited = user.favoriteRecipes.includes(req.params.id);

    if (alreadyFavorited) {
      user.favoriteRecipes = user.favoriteRecipes.filter((id) => id !== req.params.id);
    } else {
      user.favoriteRecipes.push(req.params.id);
    }
    await user.save();

    res.json({ favorited: !alreadyFavorited, favoriteRecipes: user.favoriteRecipes });
  } catch (err) {
    res.status(500).json({ message: "Failed to update favorite", error: err.message });
  }
}

export async function getFavorites(req, res) {
  try {
    const user = await User.findById(req.userId);
    const favoriteRecipeObjects = recipes.filter((r) => user.favoriteRecipes.includes(r.id));
    res.json({ recipes: favoriteRecipeObjects });
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch favorites", error: err.message });
  }
}

// "Surprise me" -- picks a random recipe, optionally scoped to the same tag
// filters the user currently has active, so it's a genuine "help me decide"
// tool rather than a fully unrelated random pick.
export function surpriseMe(req, res) {
  const { tags } = req.query;
  let pool = recipes;

  if (tags) {
    const tagList = tags.split(",");
    const filtered = recipes.filter((r) => r.tags.some((t) => tagList.includes(t)));
    if (filtered.length > 0) pool = filtered;
  }

  const pick = pool[Math.floor(Math.random() * pool.length)];
  res.json({ recipe: pick });
}
