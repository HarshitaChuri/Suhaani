import { useState, useEffect } from "react";
import api from "../api/client";

export default function Recipes() {
  const [allTags, setAllTags] = useState([]);
  const [selectedTags, setSelectedTags] = useState([]);
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    Promise.all([api.get("/recipes/tags"), api.get("/recipes")])
      .then(([tagsRes, recipesRes]) => {
        setAllTags(tagsRes.data.tags);
        setRecipes(recipesRes.data.recipes);
      })
      .catch(() => setError("Failed to load recipes."))
      .finally(() => setLoading(false));
  }, []);

  async function applyFilter(tags) {
    setSelectedTags(tags);
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

  return (
    <div className="container" style={{ paddingTop: 56, paddingBottom: 80 }}>
      <h1 style={{ fontSize: 32, marginBottom: 8 }}>PCOS-friendly recipes</h1>
      <p style={{ color: "var(--color-text-muted)", marginBottom: 32 }}>
        Filter by what matters for you right now — every recipe includes why it helps.
      </p>

      <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 32 }}>
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
        {selectedTags.length > 0 && (
          <button onClick={() => applyFilter([])} style={{ padding: "8px 16px", borderRadius: 999, border: "none", background: "transparent", color: "var(--color-text-muted)", fontSize: 13, textDecoration: "underline" }}>
            Clear filters
          </button>
        )}
      </div>

      {error && <p style={{ color: "#B3261E", fontSize: 14, marginBottom: 16 }}>{error}</p>}

      {loading ? (
        <p style={{ color: "var(--color-text-muted)" }}>Loading...</p>
      ) : recipes.length === 0 ? (
        <p style={{ color: "var(--color-text-muted)" }}>No recipes match those filters — try removing one.</p>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 20 }}>
          {recipes.map((recipe) => (
            <div key={recipe.id} style={{ background: "var(--color-surface)", borderRadius: "var(--radius)", boxShadow: "var(--shadow)", padding: 20 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", marginBottom: 10 }}>
                <h3 style={{ fontSize: 17 }}>{recipe.name}</h3>
                <span style={{ fontFamily: "var(--font-mono)", fontSize: 12, color: "var(--color-text-muted)", whiteSpace: "nowrap", marginLeft: 8 }}>{recipe.prepTime}</span>
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

              <p style={{ fontSize: 13, lineHeight: 1.5 }}>{recipe.whyItHelps}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
