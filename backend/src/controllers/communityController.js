import Post from "../models/Post.js";
import Comment from "../models/Comment.js";
import User from "../models/User.js";

async function resolveDisplayName(userId, isAnonymous) {
  if (isAnonymous) return "Anonymous";
  const user = await User.findById(userId).select("name");
  return user?.name?.split(" ")[0] || "Member"; // first name only, even when not anonymous -- keeps it lightweight, not a full identity reveal
}

export async function createPost(req, res) {
  try {
    const { content, tag, isAnonymous } = req.body;
    if (!content || !content.trim()) {
      return res.status(400).json({ message: "Post content is required" });
    }

    const authorDisplayName = await resolveDisplayName(req.userId, !!isAnonymous);

    const post = await Post.create({
      user: req.userId,
      authorDisplayName,
      isAnonymous: !!isAnonymous,
      content: content.trim(),
      tag: tag || "general",
    });

    res.status(201).json({ post });
  } catch (err) {
    res.status(500).json({ message: "Failed to create post", error: err.message });
  }
}

// Cursor-free pagination via skip/limit -- fine at this scale; would move to
// cursor-based if the community grew into the tens of thousands of posts.
export async function getFeed(req, res) {
  try {
    const { tag, sort = "recent", page = 1, limit = 15 } = req.query;
    const filter = tag ? { tag } : {};

    const sortOption = sort === "popular" ? { likesCount: -1, createdAt: -1 } : { createdAt: -1 };

    // likesCount doesn't exist as a stored field, so for "popular" we sort
    // in-memory after fetching -- acceptable at this scale, would need a
    // denormalized counter + DB-level sort if this became high-traffic.
    let posts = await Post.find(filter)
      .sort({ createdAt: -1 })
      .skip((Number(page) - 1) * Number(limit))
      .limit(Number(limit))
      .lean();

    if (sort === "popular") {
      posts = posts.sort((a, b) => b.likes.length - a.likes.length);
    }

    const postsWithMeta = posts.map((p) => ({
      ...p,
      likeCount: p.likes.length,
      likedByMe: p.likes.some((id) => id.toString() === req.userId),
      isOwnPost: p.user.toString() === req.userId,
    }));

    res.json({ posts: postsWithMeta });
  } catch (err) {
    res.status(500).json({ message: "Failed to load feed", error: err.message });
  }
}

export async function toggleLikePost(req, res) {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: "Post not found" });

    const alreadyLiked = post.likes.some((id) => id.toString() === req.userId);
    if (alreadyLiked) {
      post.likes = post.likes.filter((id) => id.toString() !== req.userId);
    } else {
      post.likes.push(req.userId);
    }
    await post.save();

    res.json({ likeCount: post.likes.length, likedByMe: !alreadyLiked });
  } catch (err) {
    res.status(500).json({ message: "Failed to update like", error: err.message });
  }
}

export async function deletePost(req, res) {
  try {
    const post = await Post.findOneAndDelete({ _id: req.params.id, user: req.userId });
    if (!post) return res.status(404).json({ message: "Post not found or not yours" });

    await Comment.deleteMany({ post: post._id }); // clean up orphaned comments
    res.json({ message: "Post deleted" });
  } catch (err) {
    res.status(500).json({ message: "Failed to delete post", error: err.message });
  }
}

export async function getComments(req, res) {
  try {
    const comments = await Comment.find({ post: req.params.id }).sort({ createdAt: 1 }).lean();
    const commentsWithMeta = comments.map((c) => ({
      ...c,
      likeCount: c.likes.length,
      likedByMe: c.likes.some((id) => id.toString() === req.userId),
    }));
    res.json({ comments: commentsWithMeta });
  } catch (err) {
    res.status(500).json({ message: "Failed to load comments", error: err.message });
  }
}

export async function addComment(req, res) {
  try {
    const { content, isAnonymous } = req.body;
    if (!content || !content.trim()) {
      return res.status(400).json({ message: "Comment content is required" });
    }

    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: "Post not found" });

    const authorDisplayName = await resolveDisplayName(req.userId, !!isAnonymous);

    const comment = await Comment.create({
      post: post._id,
      user: req.userId,
      authorDisplayName,
      isAnonymous: !!isAnonymous,
      content: content.trim(),
    });

    post.commentCount += 1;
    await post.save();

    res.status(201).json({ comment });
  } catch (err) {
    res.status(500).json({ message: "Failed to add comment", error: err.message });
  }
}

export async function toggleLikeComment(req, res) {
  try {
    const comment = await Comment.findById(req.params.id);
    if (!comment) return res.status(404).json({ message: "Comment not found" });

    const alreadyLiked = comment.likes.some((id) => id.toString() === req.userId);
    if (alreadyLiked) {
      comment.likes = comment.likes.filter((id) => id.toString() !== req.userId);
    } else {
      comment.likes.push(req.userId);
    }
    await comment.save();

    res.json({ likeCount: comment.likes.length, likedByMe: !alreadyLiked });
  } catch (err) {
    res.status(500).json({ message: "Failed to update like", error: err.message });
  }
}

export async function deleteComment(req, res) {
  try {
    const comment = await Comment.findOneAndDelete({ _id: req.params.id, user: req.userId });
    if (!comment) return res.status(404).json({ message: "Comment not found or not yours" });

    await Post.findByIdAndUpdate(comment.post, { $inc: { commentCount: -1 } });
    res.json({ message: "Comment deleted" });
  } catch (err) {
    res.status(500).json({ message: "Failed to delete comment", error: err.message });
  }
}
