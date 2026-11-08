import {
  getSessionByTelegramReply,
  getSessionByLoginId,
  addPendingReply,
  removeMessagesFromSession,
  getExchangeByTelegramId,
  updateJamesPresence,
  setJamesOffline,
  type ChatMessage,
} from "@/lib/chat-store";
import {
  dbBlockIp,
  dbDeleteSession,
  dbDeleteMessages,
  dbSaveMessage,
  dbSetPresence,
} from "@/lib/db-operations";
import { sendToTelegram, answerCallbackQuery, deleteTelegramMessage } from "@/lib/telegram";

interface TelegramUpdate {
  message?: {
    message_id: number;
    from?: {
      id: number;
      first_name?: string;
    };
    chat?: {
      id: number;
    };
    text?: string;
    reply_to_message?: {
      message_id: number;
      text?: string;
    };
  };
  callback_query?: {
    id: string;
    data?: string;
    from?: {
      id: number;
    };
    message?: {
      message_id: number;
      chat?: {
        id: number;
      };
    };
  };
}

export async function POST(request: Request) {
  try {
    const update: TelegramUpdate = await request.json();

    // Any interaction from Telegram means James is active
    updateJamesPresence();
    dbSetPresence(true, false).catch(() => {});

    // 1. Handle Inline Button clicks (callback_query) from Telegram
    if (update.callback_query) {
      const cq = update.callback_query;
      const cqData = cq.data || "";

      if (cqData.startsWith("block:")) {
        const ipToBlock = cqData.slice(6);
        await dbBlockIp(ipToBlock, "Blocked via Telegram button by James");
        await answerCallbackQuery(cq.id, `🚫 IP ${ipToBlock} blocked!`, true);
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

      return Response.json({ ok: true });
    }

    // 2. Standalone commands from James
    if (update.message?.text) {
      const textCommand = update.message.text.trim().toLowerCase();
      if (textCommand === "/online") {
        updateJamesPresence(true, true);
        await dbSetPresence(true, true);
        await sendToTelegram("🟢 <b>Status: ONLINE</b>\nYour website chatbox is now showing you as Online!");
        return Response.json({ ok: true });
      }
      if (textCommand === "/offline") {
        setJamesOffline();
        await dbSetPresence(false, true);
        await sendToTelegram("⚪ <b>Status: OFFLINE</b>\nYour website chatbox is now showing you as Offline.");
        return Response.json({ ok: true });
      }
    }

    // 3. Only process text messages that are replies to bot messages
    if (
      !update.message?.text ||
      !update.message?.reply_to_message
    ) {
      return Response.json({ ok: true });
    }

    const replyToMsgId = String(update.message.reply_to_message.message_id);
    const quotedText = update.message.reply_to_message.text || "";
    const jamesReply = update.message.text.trim();
    const chatId = String(update.message.chat?.id || "");

    // Verify this is from James's chat
    const expectedChatId = process.env.TELEGRAM_CHAT_ID;
    if (expectedChatId && chatId !== expectedChatId) {
      return Response.json({ ok: true });
    }

    let loginId = "";
    const loginMatch = quotedText.match(/Login ID:\s*([a-zA-Z0-9]+)/i);
    if (loginMatch) {
      loginId = loginMatch[1].trim();
    }

    // Find the session this reply belongs to
    let sessionId = getSessionByTelegramReply(replyToMsgId);
    if (!sessionId && loginId) {
      sessionId = getSessionByLoginId(loginId);
    }

    const command = jamesReply.toLowerCase();

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
      return Response.json({ ok: true });
    }

    // 2. COMMAND: /delete — delete message or conversation directly from Telegram
    if (command === "/delete") {
      const exchange = getExchangeByTelegramId(replyToMsgId);
      if (exchange) {
        // Delete ONLY this specific message exchange from MongoDB & memory
        await dbDeleteMessages(exchange.sessionId, exchange.messageIds);
        removeMessagesFromSession(exchange.sessionId, exchange.messageIds);

        // Delete the quoted notification message and the /delete command from Telegram
        if (update.message?.chat?.id) {
          if (update.message.reply_to_message?.message_id) {
            await deleteTelegramMessage(update.message.chat.id, update.message.reply_to_message.message_id);
          }
          await deleteTelegramMessage(update.message.chat.id, update.message.message_id);
        }
      } else if (sessionId) {
        // Fallback: delete full session
        await dbDeleteSession(sessionId);

        // Delete the quoted notification message and the /delete command from Telegram
        if (update.message?.chat?.id) {
          if (update.message.reply_to_message?.message_id) {
            await deleteTelegramMessage(update.message.chat.id, update.message.reply_to_message.message_id);
          }
          await deleteTelegramMessage(update.message.chat.id, update.message.message_id);
        }
      } else {
        await sendToTelegram(`⚠️ Message not found or already deleted.`);
      }
      return Response.json({ ok: true });
    }

    if (!sessionId) {
      return Response.json({ ok: true });
    }

    // 3. Regular message: Add James's reply as a pending reply for the visitor
    const replyMsg: ChatMessage = {
      id: `msg-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      role: "james",
      content: jamesReply,
      timestamp: Date.now(),
    };

    addPendingReply(sessionId, replyMsg);

    // Also save James's reply into MongoDB
    const ipMatch = quotedText.match(/IP address:\s*([^\s\n\r<]+)/i);
    const ip = ipMatch ? ipMatch[1].trim() : "127.0.0.1";
    dbSaveMessage(sessionId, loginId || "00000", ip, replyMsg).catch((err) =>
      console.error("DB save James reply error:", err)
    );

    return Response.json({ ok: true });
  } catch (error) {
    console.error("Telegram webhook error:", error);
    return Response.json({ ok: true }); // Always return 200 to Telegram
  }
}

