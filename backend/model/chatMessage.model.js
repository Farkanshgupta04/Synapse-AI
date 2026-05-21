import mongoose from "mongoose";

const chatMessageSchema = new mongoose.Schema({
  sessionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "ChatSession",
    required: true,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  role: {
    type: String,
    enum: ["user", "assistant"],
    required: true,
  },
  content: {
    type: String,
    required: true,
  },
  image: {
    type: String,
    default: null,
  },
  images: {
    type: [String],
    default: [],
  },
  metadata: {
    model: {
      type: String,
      default: "gemini-2.5-flash",
    },
    temperature: {
      type: Number,
      default: 0.7,
    },
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Index for faster queries
chatMessageSchema.index({ sessionId: 1, createdAt: 1 });
chatMessageSchema.index({ userId: 1, createdAt: -1 });

export const ChatMessage = mongoose.model("ChatMessage", chatMessageSchema);
