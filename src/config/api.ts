/**
 * Axiom AI - Centralized API & Model Configuration
 * 
 * IMPORTANT FOR DEVELOPERS / USERS:
 * THIS IS WHERE YOU CAN CONFIGURE YOUR API KEYS AND DEFAULT MODEL SETTINGS.
 * 
 * Note: You can also enter API keys directly in the Axiom Settings UI in the browser,
 * which will be saved securely in your browser's LocalStorage.
 */

// Paste your Google Gemini API Key below if running outside environment variables
export const DEFAULT_GEMINI_API_KEY = process.env.GEMINI_API_KEY || "";

export const API_CONFIG = {
  // Default system prompt for Axiom AI
  systemInstruction: `You are Axiom, an ultra-intelligent, precise, and articulate AI assistant created to help users think smarter and respond faster.
Your communication style is professional, insightful, and clear.
When providing code, write clean, well-formatted, production-ready code blocks with exact language specifiers.
Use precise Markdown for formatting, tables, math expressions, bullet points, and headers.
Be concise yet thorough. If analyzing attached files or images, provide detailed and actionable context.`,

  // Default parameters
  defaultModel: 'gemini-3.6-flash',
  defaultTemperature: 0.7,
  defaultMaxTokens: 4096,
  
  // Endpoint route for server-side proxy
  chatApiEndpoint: '/api/chat',
};
