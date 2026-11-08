import {
  getSessionByTelegramReply,
  getSessionByLoginId,
  addPendingReply,
  removeMessagesFromSession,
  getExchangeByTelegramId,
  type ChatMessage,
} from "./chat-store";
import {
  dbBlockIp,
  dbDeleteSession,
  dbDeleteMessages,
  dbSaveMessage,
} from "./db-operations";

// Telegram Bot API helpers

const TELEGRAM_API = "https://api.telegram.org/bot";

function getBotToken(): string | null {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  if (!token || token === "your_telegram_bot_token_here" || token.trim() === "") {
    return null;
  }
  return token.trim();
}

function getChatId(): string | null {
  const chatId = process.env.TELEGRAM_CHAT_ID;
  if (!chatId || chatId === "your_telegram_chat_id_here" || chatId.trim() === "") {
    return null;
  }
  return chatId.trim();
}

interface TelegramResponse {
  ok: boolean;
  result?: {
    message_id: number;
    [key: string]: unknown;
  };
  description?: string;
}

/**
 * Send a message to James's Telegram
 * Returns the Telegram message ID for reply tracking
 */
export async function sendToTelegram(
  text: string,
  replyMarkup?: Record<string, unknown>,
): Promise<number | null> {
  try {
    const token = getBotToken();
    const chatId = getChatId();

    if (!token || !chatId) {
      // Telegram is not yet configured, skip silently without crashing
      return null;
    }

    const payload: Record<string, unknown> = {
      chat_id: chatId,
      text,
      parse_mode: "HTML",
    };

    if (replyMarkup) {
      payload.reply_markup = replyMarkup;
    }

    const response = await fetch(`${TELEGRAM_API}${token}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const data: TelegramResponse = await response.json();
    if (data.ok && data.result) {
      return data.result.message_id;
    }
    console.error("Telegram send failed:", data.description);
    return null;
  } catch (error) {
    console.error("Telegram send error:", error);
    return null;
  }
}

/**
 * Format date & time as: Nov 08, 2026 at 07:16:13 am
 */
export function formatPhilippineDateTime(date: Date = new Date()): string {
  try {
    const parts = new Intl.DateTimeFormat("en-US", {
      timeZone: "Asia/Manila",
      month: "short",
      day: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: true,
    }).formatToParts(date);

    const map: Record<string, string> = {};
    parts.forEach((p) => {
      map[p.type] = p.value;
    });

    const month = map.month || "Nov";
    const day = (map.day || "01").padStart(2, "0");
    const year = map.year || "2026";
    const hour = (map.hour || "12").padStart(2, "0");
    const minute = (map.minute || "00").padStart(2, "0");
    const second = (map.second || "00").padStart(2, "0");
    const dayPeriod = (map.dayPeriod || "am").toLowerCase();

    return `${month} ${day}, ${year} at ${hour}:${minute}:${second} ${dayPeriod}`;
  } catch {
    return date.toLocaleString();
  }
}

/**
 * Format a chat conversation for Telegram notification
 * Matches James's exact template
 */
export function formatChatNotification(params: {
  sessionId: string;
  userMessage: string;
  aiResponse?: string;
  ipAddress?: string;
  dateTime?: string;
  exchangeId?: string;
}): { text: string; replyMarkup?: Record<string, unknown> } {
  const { sessionId, userMessage, ipAddress = "127.0.0.1", dateTime, exchangeId } = params;

  // Extract a consistent 5-character alphanumeric login ID (e.g. 8d286)
  const cleanId = sessionId.replace(/[^a-zA-Z0-9]/g, "");
  const loginId = cleanId.replace(/^chat/, "").slice(0, 5) || cleanId.slice(-5) || "0a3fd";
  const formattedDate = dateTime || formatPhilippineDateTime();
  const safeIp = ipAddress.replace(/[<>]/g, "");

  const deleteCallbackData = exchangeId
    ? `del:${sessionId}:${exchangeId}`
    : `del:${sessionId}`;

  const text =
    `🔔NEW MESSAGE FOR YOU JAMES!!!\n\n` +
    `✉️ Message: "${escapeHtml(userMessage)}"\n\n` +
    `🤖 AI Response:\n${escapeHtml(params.aiResponse || "")}\n\n` +
    `🆔 Login ID: ${loginId}\n` +
    `🌐 IP address: <a href="https://${safeIp}">${safeIp}</a>\n` +
    `📅 Date & Time: ${formattedDate}\n\n` +
    `💬 Reply directly to this message to answer, or use the buttons below:`;

  const replyMarkup = {
    inline_keyboard: [
      [
        {
          text: "🚫 Block IP",
          callback_data: `block:${safeIp}`,
        },
        {
          text: "🗑️ Delete Message",
          callback_data: deleteCallbackData,
        },
      ],
    ],
  };

  return { text, replyMarkup };
}

/**
 * Answer a Telegram button click (callback_query)
 */
export async function answerCallbackQuery(
  callbackQueryId: string,
  text: string,
  showAlert = false,
): Promise<void> {
  const token = getBotToken();
  if (!token) return;
  try {
    await fetch(`${TELEGRAM_API}${token}/answerCallbackQuery`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        callback_query_id: callbackQueryId,
        text,
        show_alert: showAlert,
      }),
    });
  } catch (error) {
    console.error("answerCallbackQuery error:", error);
  }
}

/**
 * Delete a message from Telegram
 */
export async function deleteTelegramMessage(
  chatId: string | number,
  messageId: string | number,
): Promise<boolean> {
  const token = getBotToken();
  if (!token) return false;
  try {
    const res = await fetch(`${TELEGRAM_API}${token}/deleteMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        message_id: messageId,
      }),
    });
    const data = await res.json();
    return data.ok === true;
  } catch (error) {
    console.error("deleteTelegramMessage error:", error);
    return false;
  }
}

/**
 * Set up the Telegram webhook URL
 */
export async function setWebhook(webhookUrl: string): Promise<boolean> {
  try {
    const token = getBotToken();
    const response = await fetch(`${TELEGRAM_API}${token}/setWebhook`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        url: webhookUrl,
        allowed_updates: ["message", "callback_query"],
      }),
    });

    const data = await response.json();
    return data.ok === true;
  } catch (error) {
    console.error("Webhook setup error:", error);
    return false;
  }
}

// In-memory offset for Telegram long-polling (used when running locally without a webhook)
let lastUpdateOffset = 0;

/**
 * Poll Telegram for new reply messages
 * Useful for local development or when webhook cannot reach the local server
 */
export async function pollTelegramUpdates(): Promise<void> {
  const token = getBotToken();
  if (!token) return;

  try {
    const response = await fetch(
      `${TELEGRAM_API}${token}/getUpdates?offset=${lastUpdateOffset}&timeout=0`,
      { cache: "no-store" },
    );
    const data = await response.json();

    if (!data.ok || !Array.isArray(data.result)) {
      return;
    }

    for (const update of data.result) {
      if (typeof update.update_id === "number") {
        lastUpdateOffset = Math.max(lastUpdateOffset, update.update_id + 1);
      }

      // Handle button clicks (callback_query) from Telegram
      if (update.callback_query) {
        const cq = update.callback_query;
        const cqData = cq.data || "";

        if (cqData.startsWith("block:")) {
          const ipToBlock = cqData.slice(6);
          await dbBlockIp(ipToBlock, "Blocked via Telegram button by James");
          await answerCallbackQuery(cq.id, `🚫 IP ${ipToBlock} has been blocked!`, true);
          await sendToTelegram(`🚫 <b>IP ${ipToBlock} has been blocked!</b>\nThey can no longer use your chatbot.`);
        } else if (cqData.startsWith("del:")) {
          const parts = cqData.slice(4).split(":");
          const sId = parts[0];
          const exId = parts[1];

          if (exId) {
            // Delete ONLY this specific message exchange from MongoDB & memory
            const targetIds = [`${exId}-u`, `${exId}-a`];
            await dbDeleteMessages(sId, targetIds);
            removeMessagesFromSession(sId, targetIds);
            await answerCallbackQuery(cq.id, "🗑️ Message removed from conversation!", false);
          } else {
            // Fallback for legacy format: delete full session
            await dbDeleteSession(sId);
            await answerCallbackQuery(cq.id, "🗑️ Conversation deleted!", false);
          }

          // Delete the notification message from Telegram
          const cqMsgChatId = cq.message?.chat?.id;
          const cqMsgId = cq.message?.message_id;
          if (cqMsgChatId && cqMsgId) {
            await deleteTelegramMessage(cqMsgChatId, cqMsgId);
          }
        }
        continue;
      }

      const msg = update.message;
      if (!msg || !msg.text) continue;

      const textCommand = msg.text.trim().toLowerCase();

      // Skip standalone commands (only handled by webhook for real-time presence)
      if (textCommand === "/online" || textCommand === "/offline") {
        continue;
      }

      // Only process replies to bot messages
      if (msg.reply_to_message?.message_id) {
        const replyToId = String(msg.reply_to_message.message_id);
        const quotedText = msg.reply_to_message.text || "";
        let targetSessionId = getSessionByTelegramReply(replyToId);
        let loginId = "";

        // Extract login ID from the quoted text if available
        const loginMatch = quotedText.match(/Login ID:\s*([a-zA-Z0-9]+)/i);
        if (loginMatch) {
          loginId = loginMatch[1].trim();
        }

        // Fallback: extract login ID from the quoted text if memory was reset
        if (!targetSessionId && loginId) {
          targetSessionId = getSessionByLoginId(loginId);
        }

        const command = msg.text.trim().toLowerCase();

        // 1. COMMAND: /block — block visitor's IP directly from Telegram
        if (command === "/block") {
          const ipMatch = quotedText.match(/IP address:\s*([^\s\n\r<]+)/i);
          const ipToBlock = ipMatch ? ipMatch[1].trim() : "";
          if (ipToBlock) {
            await dbBlockIp(ipToBlock, "Blocked via Telegram by James");
            await sendToTelegram(`🚫 <b>IP ${ipToBlock} has been blocked!</b>\nThey can no longer use your chatbot.`);
          } else {
            await sendToTelegram(`⚠️ Could not detect IP address from this message.`);
          }
          continue;
        }

        // 2. COMMAND: /delete — delete message or conversation directly from Telegram
        if (command === "/delete") {
          const exchange = getExchangeByTelegramId(replyToId);
          if (exchange) {
            // Delete ONLY this specific message exchange from MongoDB & memory
            await dbDeleteMessages(exchange.sessionId, exchange.messageIds);
            removeMessagesFromSession(exchange.sessionId, exchange.messageIds);

            // Delete the quoted notification message and the /delete command from Telegram
            if (msg.chat?.id) {
              if (msg.reply_to_message?.message_id) {
                await deleteTelegramMessage(msg.chat.id, msg.reply_to_message.message_id);
              }
              await deleteTelegramMessage(msg.chat.id, msg.message_id);
            }
          } else if (targetSessionId) {
            // Fallback if exchange not mapped: delete session
            await dbDeleteSession(targetSessionId);

            if (msg.chat?.id) {
              if (msg.reply_to_message?.message_id) {
                await deleteTelegramMessage(msg.chat.id, msg.reply_to_message.message_id);
              }
              await deleteTelegramMessage(msg.chat.id, msg.message_id);
            }
          } else {
            await sendToTelegram(`⚠️ Message not found or already deleted.`);
          }
          continue;
        }

        // 3. Regular Reply: Deliver to visitor's chatbox
        if (targetSessionId) {
          const replyMsg: ChatMessage = {
            id: `tg-${msg.message_id}-${Date.now()}`,
            role: "james",
            content: msg.text,
            timestamp: (msg.date || Math.floor(Date.now() / 1000)) * 1000,
          };
          addPendingReply(targetSessionId, replyMsg);

          // Also save James's reply into MongoDB
          const ipMatch = quotedText.match(/IP address:\s*([^\s\n\r<]+)/i);
          const ip = ipMatch ? ipMatch[1].trim() : "127.0.0.1";
          dbSaveMessage(targetSessionId, loginId || "00000", ip, replyMsg).catch((err) =>
            console.error("DB save James reply error:", err)
          );
        }
      }
    }
  } catch (error) {
    // Silently ignore polling conflicts if webhook is active
  }
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

