"use client";

import { useState, useRef, useEffect, useCallback } from "react";

interface Message {
  id: string;
  role: "user" | "assistant" | "james";
  content: string;
  timestamp: number;
}

function FormattedMessage({
  content,
  isUser,
}: {
  content: string;
  isUser: boolean;
}) {
  if (isUser) {
    return <div className="whitespace-pre-wrap break-words text-left">{content}</div>;
  }

  const lines = content.split("\n");

  return (
    <div className="space-y-1.5 break-words text-left">
      {lines.map((line, lineIdx) => {
        const trimmed = line.trim();
        if (!trimmed) {
          return <div key={lineIdx} className="h-1" />;
        }

        const isBullet = trimmed.startsWith("- ") || trimmed.startsWith("* ");
        const bulletText = isBullet ? trimmed.slice(2) : line;

        const tokens: React.ReactNode[] = [];
        let remaining = bulletText;
        let tokenKey = 0;

        while (remaining) {
          const linkMatch = remaining.match(/^\[(.*?)\]\((https?:\/\/[^\s)]+)\)/);
          if (linkMatch) {
            tokens.push(
              <a
                key={tokenKey++}
                href={linkMatch[2]}
                target="_blank"
                rel="noopener noreferrer"
                className="underline hover:text-[#C1ED00] font-medium"
              >
                {linkMatch[1]}
              </a>
            );
            remaining = remaining.slice(linkMatch[0].length);
            continue;
          }

          const boldMatch = remaining.match(/^\*\*(.*?)\*\*/);
          if (boldMatch) {
            tokens.push(
              <strong key={tokenKey++} className="font-semibold text-foreground">
                {boldMatch[1]}
              </strong>
            );
            remaining = remaining.slice(boldMatch[0].length);
            continue;
          }

          const codeMatch = remaining.match(/^`([^`]+)`/);
          if (codeMatch) {
            tokens.push(
              <code
                key={tokenKey++}
                className="rounded bg-black/10 dark:bg-white/10 px-1 py-0.5 font-mono text-xs"
              >
                {codeMatch[1]}
              </code>
            );
            remaining = remaining.slice(codeMatch[0].length);
            continue;
          }

          const nextSpecial = remaining.search(/(\[|\*\*|`)/);
          if (nextSpecial === -1) {
            tokens.push(remaining);
            break;
          } else if (nextSpecial === 0) {
            tokens.push(remaining[0]);
            remaining = remaining.slice(1);
          } else {
            tokens.push(remaining.slice(0, nextSpecial));
            remaining = remaining.slice(nextSpecial);
          }
        }

        if (isBullet) {
          return (
            <div key={lineIdx} className="flex items-start gap-2 pl-1">
              <span className="text-[#C1ED00] mt-1 shrink-0 text-xs">•</span>
              <div className="flex-1">{tokens}</div>
            </div>
          );
        }

        return <div key={lineIdx}>{tokens}</div>;
      })}
    </div>
  );
}

function RobotIcon({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      {/* Antenna */}
      <line x1="12" y1="2" x2="12" y2="5" />
      <circle cx="12" cy="2" r="1" fill="currentColor" stroke="none" />
      {/* Ear bolts */}
      <line x1="2" y1="12" x2="4" y2="12" strokeWidth="2.5" />
      <line x1="20" y1="12" x2="22" y2="12" strokeWidth="2.5" />
      {/* Robot Head */}
      <rect x="4" y="5" width="16" height="14" rx="4" />
      {/* Friendly Eyes */}
      <circle cx="9" cy="11" r="1.5" fill="currentColor" stroke="none" />
      <circle cx="15" cy="11" r="1.5" fill="currentColor" stroke="none" />
      {/* Cute Smile */}
      <path d="M9 15c.8 1 2.2 1 3 1s2.2 0 3-1" />
    </svg>
  );
}

// Generates a persistent 5-character alphanumeric ID like "0a3fd" or "8d286"
function getOrCreateVisitorId(): string {
  if (typeof window === "undefined") return "guest";
  let id = localStorage.getItem("chatbot-visitor-id");
  if (!id || id.length !== 5) {
    id = Math.random().toString(36).substring(2, 7);
    localStorage.setItem("chatbot-visitor-id", id);
  }
  return id;
}

function generateSessionId(visitorId?: string): string {
  const vid = visitorId || getOrCreateVisitorId();
  return `chat-${vid}`;
}

export default function ChatBot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId, setSessionId] = useState<string>("");
  const [isOnline, setIsOnline] = useState(false);

  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const pollIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const messagesRef = useRef(messages);
  messagesRef.current = messages;
  const isLoadingRef = useRef(isLoading);
  isLoadingRef.current = isLoading;

  // Initialize persistent visitor session and sync messages from MongoDB
  useEffect(() => {
    const vid = getOrCreateVisitorId();
    const sid = generateSessionId(vid);
    setSessionId(sid);

    // Fetch conversation directly from MongoDB database on load
    fetch(`/api/chat/poll?sessionId=${encodeURIComponent(sid)}&hasMessages=false`)
      .then((res) => res.json())
      .then((data) => {
        if (data.messages && Array.isArray(data.messages)) {
          setMessages(data.messages);
        }
        if (typeof data.isOnline === "boolean") {
          setIsOnline(data.isOnline);
        }
      })
      .catch(() => {});
  }, []);

  // Auto-scroll to latest message
  const scrollToBottom = useCallback((smooth = true) => {
    if (messagesContainerRef.current) {
      if (smooth) {
        messagesContainerRef.current.scrollTo({
          top: messagesContainerRef.current.scrollHeight,
          behavior: "smooth",
        });
      } else {
        messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
      }
    } else {
      messagesEndRef.current?.scrollIntoView({ behavior: smooth ? "smooth" : "auto" });
    }
  }, []);

  useEffect(() => {
    scrollToBottom(true);
  }, [messages, scrollToBottom]);

  // Focus input and scroll instantly to the last conversation when chat opens
  useEffect(() => {
    if (isOpen) {
      // Immediate scroll without smooth delay so user sees latest message right away
      requestAnimationFrame(() => {
        scrollToBottom(false);
      });
      const t1 = setTimeout(() => {
        inputRef.current?.focus();
        scrollToBottom(false);
      }, 50);
      const t2 = setTimeout(() => {
        scrollToBottom(false);
      }, 200);
      return () => {
        clearTimeout(t1);
        clearTimeout(t2);
      };
    }
  }, [isOpen, scrollToBottom]);

  // Lock body scroll when chatbox is open on mobile to prevent background page scrolling
  useEffect(() => {
    if (!isOpen) return;

    const origOverflow = document.body.style.overflow;
    const origPosition = document.body.style.position;
    const origTop = document.body.style.top;
    const origWidth = document.body.style.width;
    const scrollY = window.scrollY;

    // Lock body scroll
    document.body.style.overflow = "hidden";
    document.body.style.position = "fixed";
    document.body.style.top = `-${scrollY}px`;
    document.body.style.width = "100%";

    return () => {
      // Restore body scroll
      document.body.style.overflow = origOverflow;
      document.body.style.position = origPosition;
      document.body.style.top = origTop;
      document.body.style.width = origWidth;
      window.scrollTo(0, scrollY);
    };
  }, [isOpen]);

  // Poll for database sync & Telegram replies when chat is open
  useEffect(() => {
    if (!isOpen || !sessionId) return;

    const poll = async () => {
      try {
        const hasMessages = messagesRef.current.length > 0;
        const res = await fetch(
          `/api/chat/poll?sessionId=${encodeURIComponent(sessionId)}&hasMessages=${hasMessages}`,
        );
        if (!res.ok) return;
        const data = await res.json();

        // Sync online/offline status
        if (typeof data.isOnline === "boolean") {
          setIsOnline(data.isOnline);
        }

        // If conversation was deleted from Telegram or MongoDB, clear the chatbox immediately
        if (data.deleted) {
          setMessages([]);
          localStorage.removeItem("chatbot-messages");
          const newVid = Math.random().toString(36).substring(2, 7);
          localStorage.setItem("chatbot-visitor-id", newVid);
          setSessionId(`chat-${newVid}`);
          return;
        }

        // Sync with MongoDB messages
        if (!isLoadingRef.current && data.messages && Array.isArray(data.messages)) {
          setMessages((prev) => {
            const prevIds = prev.map((m) => m.id).join(",");
            const newIds = data.messages.map((m: Message) => m.id).join(",");
            if (prevIds !== newIds) {
              return data.messages;
            }
            return prev;
          });
        } else if (data.replies && data.replies.length > 0) {
          setMessages((prev) => {
            const existingIds = new Set(prev.map((m) => m.id));
            const newReplies = data.replies.filter(
              (r: Message) => !existingIds.has(r.id),
            );
            if (newReplies.length === 0) return prev;
            return [...prev, ...newReplies];
          });
        }
      } catch {
        // Silently ignore polling errors
      }
    };

    poll(); // Sync immediately when chat opens
    pollIntervalRef.current = setInterval(poll, 3000);
    return () => {
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
      }
    };
  }, [isOpen, sessionId]);

  // Persist messages to local storage
  useEffect(() => {
    if (typeof window !== "undefined") {
      if (messages.length > 0) {
        localStorage.setItem("chatbot-messages", JSON.stringify(messages));
      } else {
        localStorage.removeItem("chatbot-messages");
      }
    }
  }, [messages]);

  const sendMessage = async () => {
    const trimmed = input.trim();
    if (!trimmed || isLoading) return;

    const activeSessionId = sessionId || generateSessionId();

    const userMsg: Message = {
      id: `local-${Date.now()}`,
      role: "user",
      content: trimmed,
      timestamp: Date.now(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: trimmed, sessionId: activeSessionId }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to get response");
      }

      const aiMsg: Message = {
        id: data.messageId || `ai-${Date.now()}`,
        role: "assistant",
        content: data.response,
        timestamp: Date.now(),
      };

      setMessages((prev) => [...prev, aiMsg]);
    } catch {
      const errorMsg: Message = {
        id: `error-${Date.now()}`,
        role: "assistant",
        content:
          "Sorry, I couldn't process your message. Please try again!",
        timestamp: Date.now(),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const clearChat = async () => {
    const currentSessionId = sessionId;

    // Clear UI immediately
    setMessages([]);
    localStorage.removeItem("chatbot-messages");
    const newVid = Math.random().toString(36).substring(2, 7);
    localStorage.setItem("chatbot-visitor-id", newVid);
    setSessionId(`chat-${newVid}`);

    // Delete from database & Telegram in the background
    if (currentSessionId) {
      try {
        await fetch("/api/chat/delete", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ sessionId: currentSessionId }),
        });
      } catch {
        // Silently ignore - UI is already cleared
      }
    }
  };

  return (
    <>
      {/* Floating Chat Bubble Button - only shown when chat is closed */}
      {!isOpen && (
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          aria-label="Chat with James"
          className="fixed bottom-6 right-6 z-50 flex h-12 items-center gap-2 rounded-full bg-[#C1ED00] text-[#212125] hover:bg-[#d4f533] pl-4 pr-5 shadow-2xl transition-all duration-300 hover:scale-105 active:scale-95 cursor-pointer"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
            />
          </svg>
          <span className="text-sm font-bold">Chat with James</span>
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex h-[100dvh] flex-col overflow-hidden bg-white dark:bg-[#1a1a1e] overscroll-contain animate-in fade-in slide-in-from-bottom-4 duration-200 sm:inset-auto sm:bottom-6 sm:right-6 sm:w-[calc(100vw-48px)] sm:max-w-[400px] sm:h-[min(600px,calc(100vh-48px))] sm:rounded-2xl sm:border sm:border-zinc-200 sm:dark:border-zinc-800 sm:shadow-2xl"
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-[#212125] px-4 py-3">
            <div className="flex items-center gap-3">
              <div className="relative h-9 w-9 shrink-0">
                <div className="h-9 w-9 rounded-full overflow-hidden">
                  <img src="/pictures/Profile.jpg" alt="James" className="h-full w-full object-cover" />
                </div>
                <span className="absolute -bottom-0.5 -right-0.5 flex h-3 w-3">
                  {isOnline && (
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-500 opacity-75" />
                  )}
                  <span className={`relative inline-flex h-3 w-3 rounded-full border-2 border-white dark:border-[#212125] ${isOnline ? "bg-green-500" : "bg-zinc-400"}`} />
                </span>
              </div>
              <div>
                <h3 className="text-sm font-bold text-foreground">
                  Chat with James
                </h3>
                <p className={`text-xs ${isOnline ? "text-green-500" : "text-zinc-500 dark:text-zinc-400"}`}>
                  {isOnline ? "Online" : "Offline"}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              title="Close chat"
              className="rounded-lg p-1.5 text-zinc-400 hover:text-foreground hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          {/* Messages Area */}
          <div
            ref={messagesContainerRef}
            className="flex-1 overflow-y-auto px-4 py-4 space-y-4 custom-scrollbar overscroll-contain"
          >
            {/* Intro message - always shown at the top */}
            <div className="flex flex-col items-start">
              <span className="text-[11px] font-bold text-blue-500 dark:text-blue-400 mb-1 ml-1">
                James
              </span>
              <div className="max-w-[85%] rounded-2xl rounded-bl-md bg-zinc-100 dark:bg-zinc-800 text-foreground px-4 py-2.5 text-sm leading-relaxed text-left space-y-2">
                <p>Hi there! 👋 I&apos;m James. Thanks for checking out my website!</p>
                <p>Feel free to ask me anything about my projects, skills, technologies, or experience.</p>
                <p>Just a quick note: You&apos;re currently chatting with my AI-powered assistant, which can help answer your questions and provide information about me and my work.</p>
                <p>If you have a question or message that needs my personal attention, I&apos;ll personally review it and get back to you as soon as I can.</p>
                <p>How can I help you today? 😊</p>
              </div>
            </div>

            {/* Message list */}
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex flex-col ${
                  msg.role === "user" ? "items-end" : "items-start"
                }`}
              >
                {msg.role === "assistant" && (
                  <span className="text-[11px] font-semibold text-zinc-500 dark:text-zinc-400 mb-1 ml-1">
                    Chat Bot
                  </span>
                )}
                {msg.role === "james" && (
                  <span className="text-[11px] font-bold text-blue-500 dark:text-blue-400 mb-1 ml-1">
                    James
                  </span>
                )}
                <div
                  className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed text-left ${
                    msg.role === "user"
                      ? "bg-[#C1ED00] text-[#212125] rounded-br-md"
                      : msg.role === "james"
                        ? "bg-blue-500/10 border border-blue-500/30 text-foreground rounded-bl-md"
                        : "bg-zinc-100 dark:bg-zinc-800 text-foreground rounded-bl-md"
                  }`}
                >
                  <FormattedMessage
                    content={msg.content}
                    isUser={msg.role === "user"}
                  />
                </div>
              </div>
            ))}

            {/* Loading indicator */}
            {isLoading && (
              <div className="flex justify-start">
                <div className="rounded-2xl rounded-bl-md bg-zinc-100 dark:bg-zinc-800 px-4 py-3">
                  <div className="flex items-center gap-1.5">
                    <div className="h-2 w-2 rounded-full bg-zinc-400 animate-bounce [animation-delay:0ms]" />
                    <div className="h-2 w-2 rounded-full bg-zinc-400 animate-bounce [animation-delay:150ms]" />
                    <div className="h-2 w-2 rounded-full bg-zinc-400 animate-bounce [animation-delay:300ms]" />
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-[#212125] px-4 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
            <div className="flex items-end gap-2">
              <button
                type="button"
                onClick={clearChat}
                title="Clear chat"
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-zinc-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-all cursor-pointer"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4.5 w-4.5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                  />
                </svg>
              </button>
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask about James..."
                rows={1}
                disabled={isLoading}
                className="flex-1 resize-none rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-3.5 py-2.5 text-sm text-foreground placeholder:text-zinc-400 dark:placeholder:text-zinc-500 focus:border-[#C1ED00] focus:outline-none focus:ring-2 focus:ring-[#C1ED00]/20 transition-all disabled:opacity-50 no-scrollbar"
                style={{ maxHeight: "100px" }}
                onInput={(e) => {
                  const target = e.target as HTMLTextAreaElement;
                  target.style.height = "auto";
                  target.style.height = `${Math.min(target.scrollHeight, 100)}px`;
                }}
              />
              <button
                type="button"
                onClick={sendMessage}
                disabled={!input.trim() || isLoading}
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#C1ED00] text-[#212125] shadow-sm transition-all hover:scale-105 hover:bg-[#d4f533] active:scale-95 disabled:opacity-40 disabled:hover:scale-100 cursor-pointer disabled:cursor-not-allowed"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <line x1="22" y1="2" x2="11" y2="13" />
                  <polygon points="22 2 15 22 11 13 2 9 22 2" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

