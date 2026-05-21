
/**
 * API Configuration
 * Environment-based API URL configuration for flexible deployments
 */

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";
const API_TIMEOUT = 30000; // 30 seconds

// Validate URL format
if (!API_BASE_URL) {
	console.error('API_BASE_URL is not configured');
}

export const apiUrl = (path) => {
	const baseUrl = API_BASE_URL.endsWith('/') 
		? API_BASE_URL.slice(0, -1) 
		: API_BASE_URL;
	return `${baseUrl}/api/v1${path}`;
};

export const API_CONFIG = {
	BASE_URL: API_BASE_URL,
	TIMEOUT: API_TIMEOUT,
	AI_MODELS: {
		GEMINI_FLASH: 'gemini-2.5-flash',
		GEMINI_PRO: 'gemini-2.0-pro',
	},
	AI_DEFAULTS: {
		MODEL: 'gemini-2.5-flash',
		TEMPERATURE: 0.7,
	},
	USER_ROUTES: {
		SIGNUP: '/user/signup',
		LOGIN: '/user/login',
		LOGOUT: '/user/logout',
	},
	CHAT_ROUTES: {
		SEND_PROMT: '/synapse-ai/promt',
	},
	HEALTH: '/health',
	READY: '/ready',
};
