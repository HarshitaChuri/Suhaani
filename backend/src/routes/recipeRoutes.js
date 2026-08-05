import express from "express";
import { getAllRecipes, getRecipeTags, filterRecipes, toggleFavorite, getFavorites, surpriseMe } from "../controllers/recipeController.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

router.use(protect);

router.get("/", getAllRecipes);
router.get("/tags", getRecipeTags);
router.get("/favorites", getFavorites);
router.get("/surprise", surpriseMe);
router.post("/filter", filterRecipes);
router.post("/:id/favorite", toggleFavorite);

export default router;
