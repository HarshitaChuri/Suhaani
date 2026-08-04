import mongoose from "mongoose";

const postSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    // Denormalized so we don't need to join+mask on every read -- set once at creation
    authorDisplayName: { type: String, required: true },
    isAnonymous: { type: Boolean, default: false },
    content: { type: String, required: true, maxlength: 2000 },
    tag: {
      type: String,
      enum: ["question", "vent", "win", "advice", "general"],
      default: "general",
    },
    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }], // array of user IDs who liked
    commentCount: { type: Number, default: 0 }, // denormalized for fast feed rendering
  },
  { timestamps: true }
);

postSchema.index({ createdAt: -1 });

export default mongoose.model("Post", postSchema);
