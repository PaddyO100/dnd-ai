// lib/ai/openrouter.ts
import OpenAI from "openai";

const apiKey = process.env.OPENROUTER_API_KEY;
const baseURL = process.env.OPENROUTER_BASE_URL || "https://openrouter.ai/api/v1";

// We now rely on OPENROUTER_MODEL from env; keep a sensible default

export const openrouter = new OpenAI({
  apiKey: apiKey || "missing",
  baseURL,
  defaultHeaders: {
    "HTTP-Referer": "http://localhost:3000",
    "X-Title": "dnd-ai-dev",
  },
});

// Default model for backwards compatibility
export const OPENROUTER_MODEL = process.env.OPENROUTER_MODEL || 'openai/gpt-oss-20b:free';
