import { getDatabase } from "./mongodb";
import type { ChatMessage } from "./chat-store";
import { markSessionDeleted } from "./chat-store";

// ─── Types ────────────────────────────────────────────────────

export interface DbChatSession {
  sessionId: string;
  loginId: string;
  ipAddress: string;
  messages: ChatMessage[];
  telegramMessageIds?: number[];
  createdAt: Date;
  lastActivity: Date;
}

export interface DbBlockedIp {
  ip: string;
  reason?: string;
  blockedAt: Date;
}

// ─── Session Operations ───────────────────────────────────────

/**
 * Save or update a chat session with a new message
 */
export async function dbSaveMessage(
  sessionId: string,
  loginId: string,
  ipAddress: string,
  message: ChatMessage,
): Promise<void> {
  try {
    const db = await getDatabase();
    const sessions = db.collection<DbChatSession>("sessions");

    await sessions.updateOne(
      { sessionId },
      {
        $push: { messages: message },
        $set: { lastActivity: new Date(), ipAddress, loginId },
        $setOnInsert: { createdAt: new Date() },
      },
      { upsert: true },
    );
  } catch (error) {
    console.error("Failed to save message to database:", error);
  }
}

/**
 * Get all sessions (for admin viewing)
 */
export async function dbGetAllSessions(): Promise<DbChatSession[]> {
  const db = await getDatabase();
  const sessions = db.collection<DbChatSession>("sessions");
  return sessions
    .find({})
    .sort({ lastActivity: -1 })
    .limit(100)
    .toArray();
}

/**
 * Get a single session by ID
 */
export async function dbGetSession(
  sessionId: string,
): Promise<DbChatSession | null> {
  const db = await getDatabase();
  const sessions = db.collection<DbChatSession>("sessions");
  return sessions.findOne({ sessionId });
}

/**
 * Delete a session
 */
export async function dbDeleteSession(sessionId: string): Promise<boolean> {
  markSessionDeleted(sessionId);
  try {
    const db = await getDatabase();
    const sessions = db.collection<DbChatSession>("sessions");
    const result = await sessions.deleteOne({ sessionId });
    return result.deletedCount > 0;
  } catch (error) {
    console.error("dbDeleteSession error:", error);
    return false;
  }
}

/**
 * Delete specific messages from a session
 */
export async function dbDeleteMessages(
  sessionId: string,
  messageIds: string[],
): Promise<boolean> {
  try {
    const db = await getDatabase();
    const sessions = db.collection<DbChatSession>("sessions");
    const result = await sessions.updateOne(
      { sessionId },
      { $pull: { messages: { id: { $in: messageIds } } } },
    );
    return result.modifiedCount > 0;
  } catch (error) {
    console.error("dbDeleteMessages error:", error);
    return false;
  }
}

/**
 * Add a Telegram message ID to a session for later cleanup
 */
export async function dbAddTelegramMessageId(
  sessionId: string,
  telegramMsgId: number,
): Promise<void> {
  try {
    const db = await getDatabase();
    const sessions = db.collection<DbChatSession>("sessions");
    await sessions.updateOne(
      { sessionId },
      { $addToSet: { telegramMessageIds: telegramMsgId } },
    );
  } catch (error) {
    console.error("dbAddTelegramMessageId error:", error);
  }
}

/**
 * Get all Telegram message IDs for a session
 */
export async function dbGetTelegramMessageIds(
  sessionId: string,
): Promise<number[]> {
  try {
    const db = await getDatabase();
    const sessions = db.collection<DbChatSession>("sessions");
    const session = await sessions.findOne(
      { sessionId },
      { projection: { telegramMessageIds: 1 } },
    );
    return session?.telegramMessageIds || [];
  } catch (error) {
    console.error("dbGetTelegramMessageIds error:", error);
    return [];
  }
}

/**
 * Delete all sessions from a specific IP
 */
export async function dbDeleteSessionsByIp(ip: string): Promise<number> {
  const db = await getDatabase();
  const sessions = db.collection<DbChatSession>("sessions");
  const result = await sessions.deleteMany({ ipAddress: ip });
  return result.deletedCount;
}

// ─── IP Block Operations ──────────────────────────────────────

/**
 * Block an IP address
 */
export async function dbBlockIp(
  ip: string,
  reason?: string,
): Promise<void> {
  const db = await getDatabase();
  const blockedIps = db.collection<DbBlockedIp>("blocked_ips");
  await blockedIps.updateOne(
    { ip },
    { $set: { ip, reason: reason || "Blocked by admin", blockedAt: new Date() } },
    { upsert: true },
  );
}

/**
 * Unblock an IP address
 */
export async function dbUnblockIp(ip: string): Promise<boolean> {
  const db = await getDatabase();
  const blockedIps = db.collection<DbBlockedIp>("blocked_ips");
  const result = await blockedIps.deleteOne({ ip });
  return result.deletedCount > 0;
}

/**
 * Check if an IP is blocked
 */
export async function dbIsIpBlocked(ip: string): Promise<boolean> {
  const db = await getDatabase();
  const blockedIps = db.collection<DbBlockedIp>("blocked_ips");
  const found = await blockedIps.findOne({ ip });
  return found !== null;
}

/**
 * Get all blocked IPs
 */
export async function dbGetBlockedIps(): Promise<DbBlockedIp[]> {
  const db = await getDatabase();
  const blockedIps = db.collection<DbBlockedIp>("blocked_ips");
  return blockedIps.find({}).sort({ blockedAt: -1 }).toArray();
}

// ─── James's Telegram Presence in MongoDB ─────────────────────

export interface DbPresenceDoc {
  _id: string;
  isOnline: boolean;
  manualOverride: boolean;
  lastSeen: Date;
}

export async function dbSetPresence(
  isOnline: boolean,
  manual = false,
): Promise<void> {
  try {
    const db = await getDatabase();
    await db.collection<DbPresenceDoc>("settings").updateOne(
      { _id: "presence" },
      {
        $set: {
          isOnline,
          manualOverride: manual,
          lastSeen: new Date(),
        },
      },
      { upsert: true },
    );
  } catch (error) {
    console.error("dbSetPresence error:", error);
  }
}

/**
 * Check if current time is within James's active hours (8 AM – 8 PM Philippines time)
 */
function isWithinActiveHours(): boolean {
  const now = new Date();
  // Get current hour in Asia/Manila timezone
  const phHour = parseInt(
    new Intl.DateTimeFormat("en-US", {
      timeZone: "Asia/Manila",
      hour: "numeric",
      hour12: false,
    }).format(now),
    10,
  );
  return phHour >= 8 && phHour < 20; // 8 AM to 8 PM
}

export async function dbGetPresence(): Promise<boolean> {
  try {
    const db = await getDatabase();
    const doc = await db
      .collection<DbPresenceDoc>("settings")
      .findOne({ _id: "presence" });

    // If James manually set /offline — respect it
    if (doc?.manualOverride && !doc.isOnline) {
      return false;
    }

    // If James manually set /online — respect it (expires after 2 hours)
    if (doc?.manualOverride && doc.isOnline) {
      const diff = Date.now() - new Date(doc.lastSeen).getTime();
      return diff < 2 * 60 * 60 * 1000;
    }

    // If James interacted with the bot recently (15 min) — online regardless of hours
    if (doc?.isOnline) {
      const diff = Date.now() - new Date(doc.lastSeen).getTime();
      if (diff < 15 * 60 * 1000) {
        return true;
      }
    }

    // Default: auto-online during active hours (8 AM – 8 PM PHT)
    return isWithinActiveHours();
  } catch {
    // Fallback to time-based if DB fails
    return isWithinActiveHours();
  }
}

