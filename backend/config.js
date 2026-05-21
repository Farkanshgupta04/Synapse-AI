import dotenv from "dotenv"
dotenv.config();

const JWT_USER_PASSWORD=process.env.JWT_PASSWORD;

// AI Model Configuration
const AI_MODELS = {
    GEMINI_FLASH: 'gemini-2.5-flash',
    GEMINI_PRO: 'gemini-2.0-pro',
};

const DEFAULT_AI_MODEL = process.env.DEFAULT_AI_MODEL || AI_MODELS.GEMINI_FLASH;

const AI_CONFIG = {
    models: AI_MODELS,
    default: DEFAULT_AI_MODEL,
    temperature: {
        min: 0,
        max: 2,
        default: 0.7,
    },
    maxTokens: {
        min: 100,
        max: 8000,
        default: 2000,
    },
};

export default {
    JWT_USER_PASSWORD,
     AI_CONFIG,
     AI_MODELS,
};