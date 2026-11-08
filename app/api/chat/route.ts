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
