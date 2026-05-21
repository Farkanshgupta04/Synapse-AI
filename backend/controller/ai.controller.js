/**
 * AI Configuration Controller
 * Provides AI models and configuration endpoints
 */

import config from "../config.js";

/**
 * Get available AI models and their configuration
 */
export const getAIModels = async (req, res) => {
  try {
    return res.status(200).json({
      success: true,
      message: "AI models retrieved",
      data: {
        models: config.AI_MODELS,
        default: config.AI_CONFIG.default,
        configuration: {
          temperature: config.AI_CONFIG.temperature,
          maxTokens: config.AI_CONFIG.maxTokens,
        },
      },
    });
  } catch (error) {
    console.error("Error fetching AI models:", error);
    res.status(500).json({
      success: false,
      error: { message: "Failed to fetch AI models" },
    });
  }
};

/**
 * Get default AI configuration
 */
export const getAIConfig = async (req, res) => {
  try {
    return res.status(200).json({
      success: true,
      message: "AI configuration retrieved",
      data: config.AI_CONFIG,
    });
  } catch (error) {
    console.error("Error fetching AI config:", error);
    res.status(500).json({
      success: false,
      error: { message: "Failed to fetch AI configuration" },
    });
  }
};
