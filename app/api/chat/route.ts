import { generateChatResponse } from "@/lib/gemini";
import {
  getOrCreateSession,
  addMessage,
  mapTelegramMessage,
  mapTelegramExchange,
  type ChatMessage,
} from "@/lib/chat-store";
import { sendToTelegram, formatChatNotification } from "@/lib/telegram";
import { dbSaveMessage, dbIsIpBlocked, dbAddTelegramMessageId } from "@/lib/db-operations";

// ─── Rate Limiter: 5 messages per minute per IP ───────────────
const RATE_LIMIT = 5;
const RATE_WINDOW_MS = 60 * 1000;
const rateLimitMap = new Map<string, number[]>();

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const timestamps = rateLimitMap.get(ip) || [];
  // Keep only timestamps within the window
  const recent = timestamps.filter((t) => now - t < RATE_WINDOW_MS);
  rateLimitMap.set(ip, recent);

  if (recent.length >= RATE_LIMIT) {
    return true;
  }
  recent.push(now);
  return false;
}

// Clean up old entries every 5 minutes
if (typeof globalThis !== "undefined") {
  const g = globalThis as typeof globalThis & { __rateLimitCleanup?: ReturnType<typeof setInterval> };
  if (!g.__rateLimitCleanup) {
    g.__rateLimitCleanup = setInterval(() => {
      const now = Date.now();
      for (const [ip, timestamps] of rateLimitMap) {
        const recent = timestamps.filter((t) => now - t < RATE_WINDOW_MS);
        if (recent.length === 0) {
          rateLimitMap.delete(ip);
        } else {
          rateLimitMap.set(ip, recent);
        }
      }
    }, 5 * 60 * 1000);
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { message, sessionId } = body;

    if (!message || typeof message !== "string" || !message.trim()) {
      return Response.json(
        { error: "Message is required" },
        { status: 400 },
      );
    }

    if (!sessionId || typeof sessionId !== "string") {
      return Response.json(
        { error: "Session ID is required" },
        { status: 400 },
      );
    }

    // Get client IP address
    const forwardedFor = request.headers.get("x-forwarded-for");
    const realIp = request.headers.get("x-real-ip");
    const clientIp = forwardedFor
      ? forwardedFor.split(",")[0].trim()
      : realIp || "127.0.0.1";

    // Check if IP is blocked
    try {
      const blocked = await dbIsIpBlocked(clientIp);
      if (blocked) {
        return Response.json(
          { error: "Your access has been restricted. Please contact James directly at solamojamesmichael@gmail.com." },
          { status: 403 },
        );
      }
    } catch {
      // If DB is unavailable, allow the request to proceed
    }

    // Rate limit: 5 messages per minute per IP
    if (isRateLimited(clientIp)) {
      return Response.json(
        { error: "You're sending messages too fast. Please wait a moment before trying again." },
        { status: 429 },
      );
    }

    const session = getOrCreateSession(sessionId);

    // Build consistent 5-character login ID
    const cleanId = sessionId.replace(/[^a-zA-Z0-9]/g, "");
    const loginId = cleanId.replace(/^chat/, "").slice(0, 5) || cleanId.slice(-5) || "00000";

    // Short unique exchange ID for this question & answer pair
    const exchangeId = `e${Date.now().toString(36).slice(-5)}${Math.random().toString(36).slice(2, 5)}`;

    // Add user message to session
    const userMsg: ChatMessage = {
      id: `${exchangeId}-u`,
      role: "user",
      content: message.trim(),
      timestamp: Date.now(),
    };
    addMessage(sessionId, userMsg);

    // Save user message to database (non-blocking)
    dbSaveMessage(sessionId, loginId, clientIp, userMsg).catch((err) =>
      console.error("DB save user message error:", err),
    );

    // Build conversation history for Gemini (last 6 messages for speed)
    const history = session.messages
      .filter((m) => m.id !== userMsg.id)
      .slice(-6)
      .map((m) => ({
        role: (m.role === "user" ? "user" : "assistant") as "user" | "assistant",
        content: m.content,
      }));

    // Generate AI response
    const aiResponseText = await generateChatResponse(message.trim(), history);

    // Add AI response to session
    const aiMsg: ChatMessage = {
      id: `${exchangeId}-a`,
      role: "assistant",
      content: aiResponseText,
      timestamp: Date.now(),
    };
    addMessage(sessionId, aiMsg);

    // Save AI response to database (non-blocking)
    dbSaveMessage(sessionId, loginId, clientIp, aiMsg).catch((err) =>
      console.error("DB save AI message error:", err),
    );

    // Format and forward to Telegram (non-blocking)
    const { text, replyMarkup } = formatChatNotification({
      sessionId,
      userMessage: message.trim(),
      aiResponse: aiResponseText,
      ipAddress: clientIp,
      exchangeId,
    });

    sendToTelegram(text, replyMarkup)
      .then((telegramMsgId) => {
        if (telegramMsgId) {
          mapTelegramMessage(String(telegramMsgId), sessionId, aiMsg.id);
          mapTelegramExchange(String(telegramMsgId), sessionId, [userMsg.id, aiMsg.id]);
          // Save Telegram message ID to DB for later cleanup
          dbAddTelegramMessageId(sessionId, telegramMsgId).catch((err) =>
            console.error("DB save telegram msg ID error:", err),
          );
        }
      })
      .catch((err) => {
        console.error("Failed to forward to Telegram:", err);
      });

    return Response.json({
      response: aiResponseText,
      messageId: aiMsg.id,
    });
  } catch (error) {
    console.error("Chat API error:", error);
    return Response.json(
      {
        error: "Sorry, something went wrong. Please try again.",
      },
      { status: 500 },
    );
  }
}
