import express from "express";
import { getAllRecipes, getRecipeTags, filterRecipes } from "../controllers/recipeController.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

router.use(protect);

router.get("/", getAllRecipes);
router.get("/tags", getRecipeTags);
router.post("/filter", filterRecipes);

export default router;
