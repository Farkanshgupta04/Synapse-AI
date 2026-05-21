/**
 * Chat History Controller
 * Handles chat session and message operations
 */

import { ChatSession } from "../model/chatSession.model.js";
import { ChatMessage } from "../model/chatMessage.model.js";

/**
 * Create a new chat session
 */
export const createChatSession = async (req, res) => {
  const userId = req.userId;
  const { title, description } = req.body;

  try {
    const session = await ChatSession.create({
      userId,
      title: title || "New Chat",
      description: description || "",
    });

    return res.status(201).json({
      success: true,
      message: "Chat session created",
      data: session,
    });
  } catch (error) {
    console.error("Error creating chat session:", error);
    res.status(500).json({
      success: false,
      error: { message: "Failed to create chat session" },
    });
  }
};

/**
 * Get all chat sessions for a user (paginated)
 */
export const getUserChatSessions = async (req, res) => {
  const userId = req.userId;
  const { page = 1, limit = 20, sortBy = "lastMessageAt" } = req.query;

  try {
    const skip = (page - 1) * limit;

    // Get total count
    const total = await ChatSession.countDocuments({ userId });

    // Get sessions with pagination
    const sessions = await ChatSession.find({ userId })
      .sort({ [sortBy]: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .lean();

    return res.status(200).json({
      success: true,
      message: "Chat sessions retrieved",
      data: sessions,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching chat sessions:", error);
    res.status(500).json({
      success: false,
      error: { message: "Failed to fetch chat sessions" },
    });
  }
};

/**
 * Get a specific chat session by ID
 */
export const getChatSession = async (req, res) => {
  const userId = req.userId;
  const { sessionId } = req.params;

  try {
    const session = await ChatSession.findOne({
      _id: sessionId,
      userId,
    });

    if (!session) {
      return res.status(404).json({
        success: false,
        error: { message: "Chat session not found" },
      });
    }

    return res.status(200).json({
      success: true,
      message: "Chat session retrieved",
      data: session,
    });
  } catch (error) {
    console.error("Error fetching chat session:", error);
    res.status(500).json({
      success: false,
      error: { message: "Failed to fetch chat session" },
    });
  }
};

/**
 * Get all messages for a chat session (paginated)
 */
export const getChatMessages = async (req, res) => {
  const userId = req.userId;
  const { sessionId } = req.params;
  const { page = 1, limit = 50 } = req.query;

  try {
    // Verify session belongs to user
    const session = await ChatSession.findOne({
      _id: sessionId,
      userId,
    });

    if (!session) {
      return res.status(404).json({
        success: false,
        error: { message: "Chat session not found" },
      });
    }

    const skip = (page - 1) * limit;

    // Get total count
    const total = await ChatMessage.countDocuments({ sessionId });

    // Get messages
    const messages = await ChatMessage.find({ sessionId })
      .sort({ createdAt: 1 })
      .skip(skip)
      .limit(parseInt(limit))
      .lean();

    return res.status(200).json({
      success: true,
      message: "Chat messages retrieved",
      data: messages,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching chat messages:", error);
    res.status(500).json({
      success: false,
      error: { message: "Failed to fetch chat messages" },
    });
  }
};

/**
 * Update chat session title and description
 */
export const updateChatSession = async (req, res) => {
  const userId = req.userId;
  const { sessionId } = req.params;
  const { title, description, isPinned } = req.body;

  try {
    const session = await ChatSession.findOneAndUpdate(
      { _id: sessionId, userId },
      {
        ...(title && { title }),
        ...(description !== undefined && { description }),
        ...(isPinned !== undefined && { isPinned }),
        updatedAt: new Date(),
      },
      { new: true }
    );

    if (!session) {
      return res.status(404).json({
        success: false,
        error: { message: "Chat session not found" },
      });
    }

    return res.status(200).json({
      success: true,
      message: "Chat session updated",
      data: session,
    });
  } catch (error) {
    console.error("Error updating chat session:", error);
    res.status(500).json({
      success: false,
      error: { message: "Failed to update chat session" },
    });
  }
};

/**
 * Delete a chat session and all its messages
 */
export const deleteChatSession = async (req, res) => {
  const userId = req.userId;
  const { sessionId } = req.params;

  try {
    // Verify session belongs to user
    const session = await ChatSession.findOne({
      _id: sessionId,
      userId,
    });

    if (!session) {
      return res.status(404).json({
        success: false,
        error: { message: "Chat session not found" },
      });
    }

    // Delete all messages in session
    await ChatMessage.deleteMany({ sessionId });

    // Delete session
    await ChatSession.deleteOne({ _id: sessionId });

    return res.status(200).json({
      success: true,
      message: "Chat session deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting chat session:", error);
    res.status(500).json({
      success: false,
      error: { message: "Failed to delete chat session" },
    });
  }
};

/**
 * Search chat sessions by title or description
 */
export const searchChatSessions = async (req, res) => {
  const userId = req.userId;
  const { query, limit = 10 } = req.query;

  if (!query || query.trim() === "") {
    return res.status(400).json({
      success: false,
      error: { message: "Search query is required" },
    });
  }

  try {
    const sessions = await ChatSession.find({
      userId,
      $or: [
        { title: { $regex: query, $options: "i" } },
        { description: { $regex: query, $options: "i" } },
      ],
    })
      .limit(parseInt(limit))
      .sort({ lastMessageAt: -1 })
      .lean();

    return res.status(200).json({
      success: true,
      message: "Search results",
      data: sessions,
    });
  } catch (error) {
    console.error("Error searching chat sessions:", error);
    res.status(500).json({
      success: false,
      error: { message: "Failed to search chat sessions" },
    });
  }
};
