import { consumePendingReplies, isSessionDeleted } from "@/lib/chat-store";
import { pollTelegramUpdates } from "@/lib/telegram";
import { dbGetSession, dbGetPresence } from "@/lib/db-operations";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const sessionId = searchParams.get("sessionId");
  const hasMessages = searchParams.get("hasMessages") === "true";

  if (!sessionId) {
    return Response.json(
      { error: "Session ID is required" },
      { status: 400 },
    );
  }

  // Check Telegram for new replies or delete/block commands
  await pollTelegramUpdates();

  const online = await dbGetPresence();

  // 1. Check in-memory deletion flag
  if (isSessionDeleted(sessionId)) {
    return Response.json({
      deleted: true,
      messages: [],
      replies: [],
      isOnline: online,
    });
  }

  // 2. Check MongoDB database directly (single source of truth)
  try {
    const dbSession = await dbGetSession(sessionId);

    // If the visitor currently has messages, but MongoDB has no session record,
    // it was deleted from MongoDB (via Telegram /delete or directly in MongoDB Atlas)!
    if (hasMessages && !dbSession) {
      return Response.json({
        deleted: true,
        messages: [],
        replies: [],
        isOnline: online,
      });
    }

    // If session exists in MongoDB, sync full message history with the website
    if (dbSession && Array.isArray(dbSession.messages)) {
      return Response.json({
        deleted: false,
        messages: dbSession.messages,
        replies: [],
        isOnline: online,
      });
    }
  } catch (error) {
    console.error("Poll MongoDB sync error:", error);
  }

  const replies = consumePendingReplies(sessionId);

  return Response.json({
    deleted: false,
    replies: replies.map((r) => ({
      id: r.id,
      role: r.role,
      content: r.content,
      timestamp: r.timestamp,
    })),
    isOnline: online,
  });
}

