import { GoogleGenAI } from "@google/genai";
import { SYSTEM_PROMPT } from "./profile-data";

let client: GoogleGenAI | null = null;

function getClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === "your_gemini_api_key_here" || apiKey.trim() === "") {
    return null;
  }
  if (!client) {
    client = new GoogleGenAI({ apiKey: apiKey.trim() });
  }
  return client;
}

interface ChatHistoryMessage {
  role: "user" | "assistant";
  content: string;
}

/**
 * Generate a chat response using Gemini
 * The system prompt restricts it to only answer about James
 */
// Primary and fallback models — fastest first
const CANDIDATE_MODELS = [
  "gemini-3.5-flash-lite", // fastest, most reliable
  "gemini-3.8-flash",
  "gemini-3.6-flash",
  "gemini-3.5-flash",
];

// Timeout per model attempt (seconds)
const MODEL_TIMEOUT_MS = 8000;

/**
 * Call Gemini with a per-attempt timeout so a slow/overloaded model
 * doesn't block the entire response for 30+ seconds.
 */
async function tryModel(
  ai: GoogleGenAI,
  model: string,
  contents: { role: "user" | "model"; parts: { text: string }[] }[],
): Promise<string | null> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), MODEL_TIMEOUT_MS);

  try {
    const response = await ai.models.generateContent({
      model,
      contents,
      config: {
        systemInstruction: SYSTEM_PROMPT,
        maxOutputTokens: 500,
        temperature: 0.7,
        abortSignal: controller.signal,
      },
    });

    const text = response.text;
    return text || null;
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
}

export async function generateChatResponse(
  userMessage: string,
  history: ChatHistoryMessage[] = [],
): Promise<string> {
  const ai = getClient();
  if (!ai) {
    return "Hi there! My chat is currently being set up. Feel free to contact me directly at solamojamesmichael@gmail.com!";
  }

  // Build the conversation contents for Gemini (keep only last 6 messages for speed)
  const contents = history.slice(-6).map((msg) => ({
    role: msg.role === "assistant" ? ("model" as const) : ("user" as const),
    parts: [{ text: msg.content }],
  }));

  // Add the current user message
  contents.push({
    role: "user" as const,
    parts: [{ text: userMessage }],
  });

  // Try each model with a fast timeout — first success wins
  for (const model of CANDIDATE_MODELS) {
    const result = await tryModel(ai, model, contents);
    if (result) {
      return result;
    }
  }

  return "I'm experiencing a bit of traffic right now. Feel free to ask again in a moment, or reach out to me directly at solamojamesmichael@gmail.com!";
}

