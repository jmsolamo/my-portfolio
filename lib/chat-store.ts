// In-memory chat session store
// In production, consider using Redis or a database

export interface ChatMessage {
  id: string;
  role: "user" | "assistant" | "james";
  content: string;
  timestamp: number;
}

export interface ChatSession {
  id: string;
  messages: ChatMessage[];
  pendingReplies: ChatMessage[]; // Replies from James via Telegram
  telegramMessageIds: Map<string, string>; // maps telegram msg id → chat msg id
  createdAt: number;
  lastActivity: number;
}

// Global store (persists across requests in the same server process)
const sessions = new Map<string, ChatSession>();

// Set of deleted session IDs so poll can notify the client to clear their chatbox
const deletedSessions = new Set<string>();

// Map telegram message IDs to session IDs for routing replies
const telegramToSession = new Map<string, string>();

// ─── James's Telegram Presence Tracking ───────────────────────
// Tracks the last time James interacted with the Telegram bot
let lastJamesActivity = 0;
let jamesManualOverride: boolean | null = null;
const ONLINE_THRESHOLD_MS = 15 * 60 * 1000; // 15 minutes of auto online after interaction

export function updateJamesPresence(active = true, manual = false): void {
  lastJamesActivity = Date.now();
  if (manual) {
    jamesManualOverride = active;
  } else {
    // Regular activity marks as online unless manually set offline
    if (jamesManualOverride === false) {
      // Activity breaks manual offline
      jamesManualOverride = null;
    }
  }
}

export function setJamesOffline(): void {
  jamesManualOverride = false;
  lastJamesActivity = 0;
}

export function isJamesOnline(): boolean {
  if (jamesManualOverride === false) return false;
  if (jamesManualOverride === true) {
    // Manual online expires after 2 hours without activity
    if (lastJamesActivity > 0 && Date.now() - lastJamesActivity > 2 * 60 * 60 * 1000) {
      jamesManualOverride = null;
      return false;
    }
    return true;
  }
  if (lastJamesActivity === 0) return false;
  return Date.now() - lastJamesActivity < ONLINE_THRESHOLD_MS;
}

export function getLastJamesActivity(): number {
  return lastJamesActivity;
}

export function markSessionDeleted(sessionId: string): void {
  deletedSessions.add(sessionId);
  sessions.delete(sessionId);
}

export function isSessionDeleted(sessionId: string): boolean {
  return deletedSessions.has(sessionId);
}

export function createSession(sessionId: string): ChatSession {
  const session: ChatSession = {
    id: sessionId,
    messages: [],
    pendingReplies: [],
    telegramMessageIds: new Map(),
    createdAt: Date.now(),
    lastActivity: Date.now(),
  };
  sessions.set(sessionId, session);
  return session;
}

export function getSession(sessionId: string): ChatSession | undefined {
  return sessions.get(sessionId);
}

export function getOrCreateSession(sessionId: string): ChatSession {
  return sessions.get(sessionId) || createSession(sessionId);
}

export function addMessage(sessionId: string, message: ChatMessage): void {
  const session = getOrCreateSession(sessionId);
  session.messages.push(message);
  session.lastActivity = Date.now();
}

export function addPendingReply(sessionId: string, reply: ChatMessage): void {
  const session = sessions.get(sessionId);
  if (session) {
    session.pendingReplies.push(reply);
    session.messages.push(reply);
    session.lastActivity = Date.now();
  }
}

export function removeMessagesFromSession(
  sessionId: string,
  messageIds: string[],
): void {
  const session = sessions.get(sessionId);
  if (session) {
    const idSet = new Set(messageIds);
    session.messages = session.messages.filter((m) => !idSet.has(m.id));
  }
}

export function consumePendingReplies(sessionId: string): ChatMessage[] {
  const session = sessions.get(sessionId);
  if (!session) return [];
  const replies = [...session.pendingReplies];
  session.pendingReplies = [];
  return replies;
}

// Track exchange message IDs mapped to telegram message IDs for /delete command
const telegramToExchange = new Map<
  string,
  { sessionId: string; messageIds: string[] }
>();

export function mapTelegramExchange(
  telegramMsgId: string,
  sessionId: string,
  messageIds: string[],
): void {
  telegramToExchange.set(telegramMsgId, { sessionId, messageIds });
  telegramToSession.set(telegramMsgId, sessionId);
  const session = sessions.get(sessionId);
  if (session) {
    for (const mId of messageIds) {
      session.telegramMessageIds.set(telegramMsgId, mId);
    }
  }
}

export function getExchangeByTelegramId(
  telegramMsgId: string,
): { sessionId: string; messageIds: string[] } | undefined {
  return telegramToExchange.get(telegramMsgId);
}

export function mapTelegramMessage(
  telegramMsgId: string,
  sessionId: string,
  chatMsgId: string,
): void {
  telegramToSession.set(telegramMsgId, sessionId);
  const session = sessions.get(sessionId);
  if (session) {
    session.telegramMessageIds.set(telegramMsgId, chatMsgId);
  }
}

export function getSessionByTelegramReply(telegramMsgId: string): string | undefined {
  return telegramToSession.get(telegramMsgId);
}

export function getSessionByLoginId(loginId: string): string | undefined {
  if (!loginId) return undefined;
  for (const [id] of sessions) {
    const clean = id.replace(/[^a-zA-Z0-9]/g, "");
    if (clean.endsWith(loginId) || id.includes(loginId)) {
      return id;
    }
  }
  return undefined;
}

// Clean up sessions older than 24 hours
export function cleanupSessions(): void {
  const maxAge = 24 * 60 * 60 * 1000; // 24 hours
  const now = Date.now();
  for (const [id, session] of sessions) {
    if (now - session.lastActivity > maxAge) {
      // Clean up telegram mappings for this session
      for (const tgId of session.telegramMessageIds.keys()) {
        telegramToSession.delete(tgId);
      }
      sessions.delete(id);
    }
  }
}

// Run cleanup every hour
if (typeof globalThis !== "undefined") {
  const globalWithCleanup = globalThis as typeof globalThis & { __chatCleanupInterval?: ReturnType<typeof setInterval> };
  if (!globalWithCleanup.__chatCleanupInterval) {
    globalWithCleanup.__chatCleanupInterval = setInterval(cleanupSessions, 60 * 60 * 1000);
  }
}

