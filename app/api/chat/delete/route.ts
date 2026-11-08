import { dbGetTelegramMessageIds, dbDeleteSession } from "@/lib/db-operations";
import { deleteTelegramMessage } from "@/lib/telegram";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { sessionId } = body;

    if (!sessionId || typeof sessionId !== "string") {
      return Response.json(
        { error: "Session ID is required" },
        { status: 400 },
      );
    }

    // 1. Get all Telegram message IDs for this session before deleting
    const telegramMsgIds = await dbGetTelegramMessageIds(sessionId);

    // 2. Delete all corresponding Telegram messages
    const chatId = process.env.TELEGRAM_CHAT_ID;
    if (chatId && telegramMsgIds.length > 0) {
      await Promise.allSettled(
        telegramMsgIds.map((msgId) => deleteTelegramMessage(chatId, msgId)),
      );
    }

    // 3. Delete the session from MongoDB
    const deleted = await dbDeleteSession(sessionId);

    return Response.json({ deleted });
  } catch (error) {
    console.error("Delete chat error:", error);
    return Response.json(
      { error: "Failed to delete conversation" },
      { status: 500 },
    );
  }
}

