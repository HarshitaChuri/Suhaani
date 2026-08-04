// Curated PCOS-friendly recipes with tags for the filter tool.
// Tags map loosely to common PCOS dietary goals: low-glycemic, high-protein,
// anti-inflammatory, high-fiber -- these support insulin sensitivity and
// hormone balance, per general PCOS nutrition guidance (see knowledge base).

const recipes = [
  {
    id: "r001",
    name: "Greek Yogurt Berry Bowl",
    tags: ["breakfast", "high-protein", "low-glycemic", "quick"],
    prepTime: "5 min",
    ingredients: ["Greek yogurt", "Mixed berries", "Chia seeds", "A drizzle of honey", "Almonds"],
    whyItHelps: "High protein and fiber keep blood sugar stable through the morning, and berries add anti-inflammatory antioxidants without a big sugar spike.",
  },
  {
    id: "r002",
    name: "Veggie & Chickpea Buddha Bowl",
    tags: ["lunch", "dinner", "high-fiber", "vegetarian", "anti-inflammatory"],
    prepTime: "25 min",
    ingredients: ["Chickpeas", "Quinoa", "Roasted sweet potato", "Spinach", "Tahini dressing"],
    whyItHelps: "Chickpeas and quinoa are both high in fiber and protein, which slows digestion and helps avoid post-meal blood sugar spikes.",
  },
  {
    id: "r003",
    name: "Baked Salmon with Greens",
    tags: ["dinner", "high-protein", "anti-inflammatory", "low-glycemic"],
    prepTime: "20 min",
    ingredients: ["Salmon fillet", "Olive oil", "Garlic", "Sautéed spinach or kale", "Lemon"],
    whyItHelps: "Salmon is rich in omega-3 fatty acids, which have anti-inflammatory effects -- helpful given PCOS is linked to chronic low-grade inflammation.",
  },
  {
    id: "r004",
    name: "Cinnamon Overnight Oats",
    tags: ["breakfast", "high-fiber", "low-glycemic", "quick"],
    prepTime: "5 min (+ overnight)",
    ingredients: ["Rolled oats", "Milk of choice", "Cinnamon", "Chia seeds", "Sliced banana"],
    whyItHelps: "Cinnamon has been studied for a modest insulin-sensitizing effect, and oats' soluble fiber helps slow sugar absorption.",
  },
  {
    id: "r005",
    name: "Lentil & Spinach Soup",
    tags: ["lunch", "dinner", "high-fiber", "vegetarian", "anti-inflammatory"],
    prepTime: "30 min",
    ingredients: ["Red lentils", "Spinach", "Onion", "Garlic", "Cumin", "Vegetable broth"],
    whyItHelps: "Lentils are a strong plant-based protein and fiber source, supporting stable blood sugar and gut health.",
  },
  {
    id: "r006",
    name: "Grilled Chicken & Avocado Salad",
    tags: ["lunch", "dinner", "high-protein", "low-glycemic"],
    prepTime: "20 min",
    ingredients: ["Grilled chicken breast", "Avocado", "Mixed greens", "Cherry tomatoes", "Olive oil & lemon dressing"],
    whyItHelps: "A high-protein, low-carb combination that's satiating without spiking blood sugar -- good for a midday meal that won't cause an afternoon energy crash.",
  },
  {
    id: "r007",
    name: "Turmeric Golden Milk",
    tags: ["snack", "anti-inflammatory", "quick"],
    prepTime: "5 min",
    ingredients: ["Milk of choice", "Turmeric", "Black pepper (boosts absorption)", "Cinnamon", "Honey"],
    whyItHelps: "Turmeric's active compound (curcumin) has anti-inflammatory properties studied in PCOS-adjacent contexts, though effects are modest and this isn't a treatment on its own.",
  },
  {
    id: "r008",
    name: "Egg & Veggie Scramble",
    tags: ["breakfast", "high-protein", "low-glycemic", "quick"],
    prepTime: "10 min",
    ingredients: ["Eggs", "Bell peppers", "Spinach", "Onion", "Olive oil"],
    whyItHelps: "A near-zero-carb, protein-rich breakfast that keeps morning blood sugar and insulin response flat.",
  },
];

export default recipes;
