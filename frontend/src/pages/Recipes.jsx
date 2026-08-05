import { useState, useEffect } from "react";
import api from "../api/client";

export default function Recipes() {
  const [allTags, setAllTags] = useState([]);
  const [selectedTags, setSelectedTags] = useState([]);
  const [recipes, setRecipes] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [expandedId, setExpandedId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [surpriseRecipe, setSurpriseRecipe] = useState(null);

  useEffect(() => {
    Promise.all([api.get("/recipes/tags"), api.get("/recipes"), api.get("/auth/me")])
      .then(([tagsRes, recipesRes, meRes]) => {
        setAllTags(tagsRes.data.tags);
        setRecipes(recipesRes.data.recipes);
        setFavorites(meRes.data.user.favoriteRecipes || []);
      })
      .catch(() => setError("Failed to load recipes."))
      .finally(() => setLoading(false));
  }, []);

  async function applyFilter(tags) {
    setSelectedTags(tags);
    setShowFavoritesOnly(false);
    try {
      const res = await api.post("/recipes/filter", { tags });
      setRecipes(res.data.recipes);
    } catch {
      setError("Failed to filter recipes.");
    }
  }

  function toggleTag(tag) {
    const next = selectedTags.includes(tag) ? selectedTags.filter((t) => t !== tag) : [...selectedTags, tag];
    applyFilter(next);
  }

  async function handleToggleFavorite(recipeId, e) {
    e.stopPropagation();
    // Optimistic update
    setFavorites((prev) => (prev.includes(recipeId) ? prev.filter((id) => id !== recipeId) : [...prev, recipeId]));
    try {
      await api.post(`/recipes/${recipeId}/favorite`);
    } catch {
      // revert on failure
      setFavorites((prev) => (prev.includes(recipeId) ? prev.filter((id) => id !== recipeId) : [...prev, recipeId]));
    }
  }

  async function handleShowFavorites() {
    setShowFavoritesOnly(true);
    setSelectedTags([]);
    try {
      const res = await api.get("/recipes/favorites");
      setRecipes(res.data.recipes);
    } catch {
      setError("Failed to load favorites.");
    }
  }

  async function handleSurpriseMe() {
    try {
      const params = selectedTags.length ? `?tags=${selectedTags.join(",")}` : "";
      const res = await api.get(`/recipes/surprise${params}`);
      setSurpriseRecipe(res.data.recipe);
      setExpandedId(res.data.recipe.id);
    } catch {
      setError("Couldn't pick a surprise recipe.");
    }
  }

  const displayRecipes = surpriseRecipe
    ? [surpriseRecipe, ...recipes.filter((r) => r.id !== surpriseRecipe.id)]
    : recipes;

  return (
    <div className="container animate-in" style={{ paddingTop: 56, paddingBottom: 80 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 16, marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 32, marginBottom: 8 }}>PCOS-friendly recipes</h1>
          <p style={{ color: "var(--color-text-muted)" }}>Filter by what matters for you right now — every recipe includes why it helps.</p>
        </div>
        <button
          onClick={handleSurpriseMe}
          className="pulse-accent"
          style={{ background: "var(--gradient-primary)", color: "white", border: "none", borderRadius: "var(--radius-sm)", padding: "12px 22px", fontWeight: 600, fontSize: 14, whiteSpace: "nowrap" }}
        >
          🎲 Surprise me
        </button>
      </div>

      <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 32, alignItems: "center" }}>
        <button
          onClick={handleShowFavorites}
          style={{
            padding: "8px 16px",
            borderRadius: 999,
            border: `1px solid ${showFavoritesOnly ? "var(--color-primary)" : "var(--color-border)"}`,
            background: showFavoritesOnly ? "var(--color-primary)" : "var(--color-surface)",
            color: showFavoritesOnly ? "white" : "var(--color-text)",
            fontSize: 13,
          }}
        >
          ♥ My favorites ({favorites.length})
        </button>
        <span style={{ color: "var(--color-border)" }}>|</span>
        {allTags.map((tag) => {
          const active = selectedTags.includes(tag);
          return (
            <button
              key={tag}
              onClick={() => toggleTag(tag)}
              style={{
                padding: "8px 16px",
                borderRadius: 999,
                border: `1px solid ${active ? "var(--color-primary)" : "var(--color-border)"}`,
                background: active ? "var(--color-primary)" : "var(--color-surface)",
                color: active ? "white" : "var(--color-text)",
                fontSize: 13,
                textTransform: "capitalize",
              }}
            >
              {tag.replace("-", " ")}
            </button>
          );
        })}
        {(selectedTags.length > 0 || showFavoritesOnly) && (
          <button onClick={() => applyFilter([])} style={{ padding: "8px 16px", borderRadius: 999, border: "none", background: "transparent", color: "var(--color-text-muted)", fontSize: 13, textDecoration: "underline" }}>
            Clear filters
          </button>
        )}
      </div>

      {error && <p style={{ color: "#B3261E", fontSize: 14, marginBottom: 16 }}>{error}</p>}

      {loading ? (
        <p style={{ color: "var(--color-text-muted)" }}>Loading...</p>
      ) : displayRecipes.length === 0 ? (
        <p style={{ color: "var(--color-text-muted)" }}>
          {showFavoritesOnly ? "No favorites yet — tap the ♥ on a recipe to save it here." : "No recipes match those filters — try removing one."}
        </p>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 20, alignItems: "start" }}>
          {displayRecipes.map((recipe) => {
            const isExpanded = expandedId === recipe.id;
            const isFavorited = favorites.includes(recipe.id);
            const isSurprise = surpriseRecipe?.id === recipe.id;

            return (
              <div
                key={recipe.id}
                className="hover-lift"
                onClick={() => setExpandedId(isExpanded ? null : recipe.id)}
                style={{
                  background: "var(--color-surface)",
                  borderRadius: "var(--radius)",
                  boxShadow: "var(--shadow)",
                  padding: 20,
                  cursor: "pointer",
                  border: isSurprise ? "2px solid var(--color-secondary)" : "2px solid transparent",
                }}
              >
                {isSurprise && (
                  <p style={{ fontSize: 11, color: "var(--color-secondary)", fontWeight: 700, marginBottom: 8, textTransform: "uppercase", letterSpacing: 0.5 }}>
                    🎲 Today's surprise pick
                  </p>
                )}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", marginBottom: 10 }}>
                  <h3 style={{ fontSize: 17 }}>{recipe.name}</h3>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0, marginLeft: 8 }}>
                    <span style={{ fontFamily: "var(--font-mono)", fontSize: 12, color: "var(--color-text-muted)", whiteSpace: "nowrap" }}>{recipe.prepTime}</span>
                    <button
                      onClick={(e) => handleToggleFavorite(recipe.id, e)}
                      style={{ background: "none", border: "none", fontSize: 18, color: isFavorited ? "var(--color-primary)" : "var(--color-text-muted)" }}
                      title={isFavorited ? "Remove from favorites" : "Add to favorites"}
                    >
                      {isFavorited ? "♥" : "♡"}
                    </button>
                  </div>
                </div>

                <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 12 }}>
                  {recipe.tags.map((t) => (
                    <span key={t} style={{ fontSize: 11, background: "var(--color-bg)", color: "var(--color-text-muted)", padding: "3px 8px", borderRadius: 999, textTransform: "capitalize" }}>
                      {t.replace("-", " ")}
                    </span>
                  ))}
                </div>

                <p style={{ fontSize: 13, color: "var(--color-text-muted)", marginBottom: 12 }}>
                  {recipe.ingredients.join(", ")}
                </p>

                <p style={{ fontSize: 13, lineHeight: 1.5, marginBottom: isExpanded ? 16 : 0 }}>{recipe.whyItHelps}</p>

                {isExpanded && recipe.steps && (
                  <div style={{ paddingTop: 16, borderTop: "1px solid var(--color-border)" }}>
                    <p style={{ fontSize: 12, fontFamily: "var(--font-mono)", textTransform: "uppercase", letterSpacing: 0.5, color: "var(--color-text-muted)", marginBottom: 10 }}>
                      Steps
                    </p>
                    <ol style={{ paddingLeft: 20, display: "flex", flexDirection: "column", gap: 8 }}>
                      {recipe.steps.map((step, i) => (
                        <li key={i} style={{ fontSize: 13, lineHeight: 1.5 }}>{step}</li>
                      ))}
                    </ol>
                  </div>
                )}

                <p style={{ fontSize: 12, color: "var(--color-text-muted)", marginTop: 12, textAlign: "center" }}>
                  {isExpanded ? "Tap to collapse ▲" : "Tap for full recipe ▼"}
                </p>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
