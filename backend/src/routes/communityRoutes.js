import express from "express";
import {
  createPost,
  getFeed,
  toggleLikePost,
  deletePost,
  getComments,
  addComment,
  toggleLikeComment,
  deleteComment,
} from "../controllers/communityController.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

router.use(protect);

router.post("/posts", createPost);
router.get("/posts", getFeed);
router.delete("/posts/:id", deletePost);
router.post("/posts/:id/like", toggleLikePost);

router.get("/posts/:id/comments", getComments);
router.post("/posts/:id/comments", addComment);
router.delete("/comments/:id", deleteComment);
router.post("/comments/:id/like", toggleLikeComment);

export default router;
