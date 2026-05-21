/**
 * Chat History Routes
 * Routes for managing chat sessions and message history
 */

import express from "express";
import userMiddleware from "../middleware/promt.middleware.js";
import {
  createChatSession,
  getUserChatSessions,
  getChatSession,
  getChatMessages,
  updateChatSession,
  deleteChatSession,
  searchChatSessions,
} from "../controller/chat.controller.js";

const router = express.Router();

// All routes require authentication
router.use(userMiddleware);

// Chat Session Routes
router.post("/sessions", createChatSession);
router.get("/sessions", getUserChatSessions);
router.get("/sessions/search", searchChatSessions);
router.get("/sessions/:sessionId", getChatSession);
router.put("/sessions/:sessionId", updateChatSession);
router.delete("/sessions/:sessionId", deleteChatSession);

// Chat Message Routes
router.get("/sessions/:sessionId/messages", getChatMessages);

export default router;
