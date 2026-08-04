import { useState, useEffect, useCallback } from "react";
import api from "../api/client";
import { buttonStyle } from "./Login";

const TAGS = [
  { value: "general", label: "General", color: "--color-text-muted" },
  { value: "question", label: "Question", color: "--color-secondary" },
  { value: "vent", label: "Vent", color: "--color-primary" },
  { value: "win", label: "Win", color: "--color-positive" },
  { value: "advice", label: "Advice", color: "--color-primary-light" },
];

export default function Community() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [sort, setSort] = useState("recent");
  const [filterTag, setFilterTag] = useState("");

  const [composerOpen, setComposerOpen] = useState(false);
  const [content, setContent] = useState("");
  const [tag, setTag] = useState("general");
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [posting, setPosting] = useState(false);

  const loadFeed = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ sort });
      if (filterTag) params.set("tag", filterTag);
      const res = await api.get(`/community/posts?${params}`);
      setPosts(res.data.posts);
    } catch {
      setError("Failed to load community feed.");
    } finally {
      setLoading(false);
    }
  }, [sort, filterTag]);

  useEffect(() => {
    loadFeed();
  }, [loadFeed]);

  async function handlePost(e) {
    e.preventDefault();
    if (!content.trim()) return;
    setPosting(true);
    try {
      await api.post("/community/posts", { content, tag, isAnonymous });
      setContent("");
      setTag("general");
      setIsAnonymous(false);
      setComposerOpen(false);
      await loadFeed();
    } catch {
      setError("Failed to post.");
    } finally {
      setPosting(false);
    }
  }

  async function handleLike(postId) {
    setPosts((prev) =>
      prev.map((p) =>
        p._id === postId
          ? { ...p, likedByMe: !p.likedByMe, likeCount: p.likeCount + (p.likedByMe ? -1 : 1) }
          : p
      )
    );
    try {
      await api.post(`/community/posts/${postId}/like`);
    } catch {
      loadFeed();
    }
  }

  async function handleDelete(postId) {
    if (!confirm("Delete this post?")) return;
    try {
      await api.delete(`/community/posts/${postId}`);
      setPosts((prev) => prev.filter((p) => p._id !== postId));
    } catch {
      setError("Failed to delete post.");
    }
  }

  return (
    <div className="container" style={{ paddingTop: 56, paddingBottom: 80, maxWidth: 680 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 32, marginBottom: 8 }}>Community</h1>
          <p style={{ color: "var(--color-text-muted)" }}>A space to share, ask, and vent — anonymously if you want.</p>
        </div>
        <button onClick={() => setComposerOpen((s) => !s)} style={buttonStyle}>
          {composerOpen ? "Cancel" : "+ New post"}
        </button>
      </div>

      {composerOpen && (
        <form onSubmit={handlePost} style={{ background: "var(--color-surface)", borderRadius: "var(--radius)", boxShadow: "var(--shadow)", padding: 20, marginBottom: 24 }}>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="What's on your mind?"
            rows={4}
            maxLength={2000}
            style={{ width: "100%", border: "1px solid var(--color-border)", borderRadius: "var(--radius-sm)", padding: 12, fontFamily: "var(--font-body)", fontSize: 14, resize: "vertical", marginBottom: 12 }}
          />
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {TAGS.map((t) => (
                <button
                  type="button"
                  key={t.value}
                  onClick={() => setTag(t.value)}
                  style={{
                    padding: "5px 12px",
                    borderRadius: 999,
                    fontSize: 12,
                    border: `1px solid ${tag === t.value ? `var(${t.color})` : "var(--color-border)"}`,
                    background: tag === t.value ? `var(${t.color})` : "transparent",
                    color: tag === t.value ? "white" : "var(--color-text-muted)",
                  }}
                >
                  {t.label}
                </button>
              ))}
            </div>
            <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, color: "var(--color-text-muted)" }}>
              <input type="checkbox" checked={isAnonymous} onChange={(e) => setIsAnonymous(e.target.checked)} />
              Post anonymously
            </label>
          </div>
          <button type="submit" disabled={posting || !content.trim()} style={{ ...buttonStyle, marginTop: 16, width: "100%" }}>
            {posting ? "Posting..." : "Post"}
          </button>
        </form>
      )}

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <FilterChip active={filterTag === ""} onClick={() => setFilterTag("")} label="All" />
          {TAGS.map((t) => (
            <FilterChip key={t.value} active={filterTag === t.value} onClick={() => setFilterTag(t.value)} label={t.label} />
          ))}
        </div>
        <select value={sort} onChange={(e) => setSort(e.target.value)} style={{ border: "1px solid var(--color-border)", borderRadius: "var(--radius-sm)", padding: "6px 10px", fontSize: 13 }}>
          <option value="recent">Most recent</option>
          <option value="popular">Most liked</option>
        </select>
      </div>

      {error && <p style={{ color: "#B3261E", fontSize: 14, marginBottom: 16 }}>{error}</p>}

      {loading ? (
        <p style={{ color: "var(--color-text-muted)" }}>Loading...</p>
      ) : posts.length === 0 ? (
        <p style={{ color: "var(--color-text-muted)" }}>No posts yet — be the first to share something.</p>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {posts.map((post) => (
            <PostCard key={post._id} post={post} onLike={handleLike} onDelete={handleDelete} />
          ))}
        </div>
      )}
    </div>
  );
}

function FilterChip({ active, onClick, label }) {
  return (
    <button
      onClick={onClick}
      style={{
        padding: "6px 14px",
        borderRadius: 999,
        fontSize: 13,
        border: `1px solid ${active ? "var(--color-primary)" : "var(--color-border)"}`,
        background: active ? "var(--color-primary)" : "var(--color-surface)",
        color: active ? "white" : "var(--color-text)",
      }}
    >
      {label}
    </button>
  );
}

function PostCard({ post, onLike, onDelete }) {
  const [commentsOpen, setCommentsOpen] = useState(false);
  const [comments, setComments] = useState([]);
  const [loadingComments, setLoadingComments] = useState(false);
  const [newComment, setNewComment] = useState("");
  const [commentAnon, setCommentAnon] = useState(false);
  const [commentCount, setCommentCount] = useState(post.commentCount);

  const tagMeta = TAGS.find((t) => t.value === post.tag) || TAGS[0];

  async function toggleComments() {
    const opening = !commentsOpen;
    setCommentsOpen(opening);
    if (opening && comments.length === 0) {
      setLoadingComments(true);
      try {
        const res = await api.get(`/community/posts/${post._id}/comments`);
        setComments(res.data.comments);
      } catch {
        // silently fail open -- comments section will just show empty
      } finally {
        setLoadingComments(false);
      }
    }
  }

  async function handleAddComment(e) {
    e.preventDefault();
    if (!newComment.trim()) return;
    try {
      const res = await api.post(`/community/posts/${post._id}/comments`, {
        content: newComment,
        isAnonymous: commentAnon,
      });
      setComments((c) => [...c, res.data.comment]);
      setCommentCount((c) => c + 1);
      setNewComment("");
    } catch {
      // no-op, keep it simple for a resume project
    }
  }

  async function handleLikeComment(commentId) {
    setComments((prev) =>
      prev.map((c) =>
        c._id === commentId
          ? { ...c, likedByMe: !c.likedByMe, likeCount: c.likeCount + (c.likedByMe ? -1 : 1) }
          : c
      )
    );
    try {
      await api.post(`/community/comments/${commentId}/like`);
    } catch {
      // optimistic update stands even if this fails silently -- acceptable for a like toggle
    }
  }

  return (
    <div style={{ background: "var(--color-surface)", borderRadius: "var(--radius)", boxShadow: "var(--shadow)", padding: 20 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", marginBottom: 10 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 32, height: 32, borderRadius: "50%", background: "var(--color-bg)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 600, color: "var(--color-primary)" }}>
            {post.authorDisplayName[0]}
          </div>
          <div>
            <p style={{ fontSize: 14, fontWeight: 500 }}>{post.authorDisplayName}</p>
            <p style={{ fontSize: 11, color: "var(--color-text-muted)" }}>{new Date(post.createdAt).toLocaleDateString()}</p>
          </div>
        </div>
        <span style={{ fontSize: 11, padding: "3px 10px", borderRadius: 999, background: `var(${tagMeta.color})`, color: "white" }}>
          {tagMeta.label}
        </span>
      </div>

      <p style={{ fontSize: 14, lineHeight: 1.6, marginBottom: 14, whiteSpace: "pre-wrap" }}>{post.content}</p>

      <div style={{ display: "flex", gap: 20, fontSize: 13, color: "var(--color-text-muted)" }}>
        <button onClick={() => onLike(post._id)} style={{ background: "none", border: "none", color: post.likedByMe ? "var(--color-primary)" : "var(--color-text-muted)", fontWeight: post.likedByMe ? 600 : 400 }}>
          {post.likedByMe ? "♥" : "♡"} {post.likeCount}
        </button>
        <button onClick={toggleComments} style={{ background: "none", border: "none", color: "var(--color-text-muted)" }}>
          💬 {commentCount}
        </button>
        {post.isOwnPost && (
          <button onClick={() => onDelete(post._id)} style={{ background: "none", border: "none", color: "var(--color-text-muted)", marginLeft: "auto" }}>
            Delete
          </button>
        )}
      </div>

      {commentsOpen && (
        <div style={{ marginTop: 16, paddingTop: 16, borderTop: "1px solid var(--color-border)" }}>
          {loadingComments ? (
            <p style={{ fontSize: 13, color: "var(--color-text-muted)" }}>Loading comments...</p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 14 }}>
              {comments.length === 0 ? (
                <p style={{ fontSize: 13, color: "var(--color-text-muted)" }}>No comments yet.</p>
              ) : (
                comments.map((c) => (
                  <div key={c._id} style={{ display: "flex", justifyContent: "space-between", alignItems: "start", fontSize: 13 }}>
                    <div>
                      <span style={{ fontWeight: 500 }}>{c.authorDisplayName}</span>{" "}
                      <span style={{ color: "var(--color-text)" }}>{c.content}</span>
                    </div>
                    <button onClick={() => handleLikeComment(c._id)} style={{ background: "none", border: "none", color: c.likedByMe ? "var(--color-primary)" : "var(--color-text-muted)", fontSize: 12, whiteSpace: "nowrap", marginLeft: 8 }}>
                      {c.likedByMe ? "♥" : "♡"} {c.likeCount}
                    </button>
                  </div>
                ))
              )}
            </div>
          )}

          <form onSubmit={handleAddComment} style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <input
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Add a comment..."
              style={{ flex: 1, border: "1px solid var(--color-border)", borderRadius: "var(--radius-sm)", padding: "8px 12px", fontSize: 13 }}
            />
            <label style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 11, color: "var(--color-text-muted)", whiteSpace: "nowrap" }}>
              <input type="checkbox" checked={commentAnon} onChange={(e) => setCommentAnon(e.target.checked)} />
              Anon
            </label>
            <button type="submit" disabled={!newComment.trim()} style={{ background: "var(--color-primary)", color: "white", border: "none", borderRadius: "var(--radius-sm)", padding: "8px 14px", fontSize: 13 }}>
              Send
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
