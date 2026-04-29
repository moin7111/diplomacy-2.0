"use client";

import { useState, useRef, useEffect } from "react";
import { useChatStore, type ChatMessage } from "@/stores/useChatStore";
import { useAuthStore } from "@/stores/useAuthStore";

/**
 * ChatDetail (F9) — Message history + input for a conversation.
 * WebSocket events prepared: send-message, receive-message, get-history.
 */

interface Props {
  conversationId: string;
  onBack: () => void;
}

export function ChatDetail({ conversationId, onBack }: Props) {
  const { conversations, addMessage, markAsRead } = useChatStore();
  const { user } = useAuthStore();
  const [input, setInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const conversation = conversations.find((c) => c.id === conversationId);

  // Mark as read on mount and when new messages come in
  useEffect(() => {
    markAsRead(conversationId);
  }, [conversationId, conversation?.messages.length, markAsRead]);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [conversation?.messages.length]);

  // TODO: WebSocket — on mount emit "get-history" for last 50 messages
  // TODO: WebSocket — listen for "receive-message" events
  // useEffect(() => {
  //   socket.emit("get-history", { conversationId, limit: 50 });
  //   socket.on("receive-message", (msg) => addMessage(conversationId, msg));
  //   return () => socket.off("receive-message");
  // }, [conversationId]);

  const handleSend = () => {
    const trimmed = input.trim();
    if (!trimmed) return;

    const message: ChatMessage = {
      id: `msg-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      sender: user?.username || "Du",
      senderName: user?.username || "Du",
      content: trimmed,
      timestamp: Date.now(),
      isOwn: true,
    };

    addMessage(conversationId, message);
    setInput("");

    // TODO: WebSocket — emit "send-message"
    // socket.emit("send-message", { conversationId, content: trimmed });
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (!conversation) return null;

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div
        className="flex items-center gap-3 px-4 shrink-0"
        style={{
          height: 56,
          borderBottom: "1px solid var(--color-border-gold-subtle)",
          background: "var(--color-navy-dark)",
        }}
      >
        <button
          onClick={onBack}
          className="flex items-center justify-center"
          style={{
            minWidth: "var(--touch-min)",
            minHeight: "var(--touch-min)",
            color: "var(--color-gold)",
            background: "none",
            border: "none",
            cursor: "pointer",
          }}
          aria-label="Zurück"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>
        <div
          style={{
            fontFamily: "var(--font-heading)",
            fontSize: "var(--text-md)",
            fontWeight: "var(--font-bold)",
            letterSpacing: "0.04em",
            textTransform: "uppercase",
            color: "var(--color-text-primary)",
          }}
        >
          {conversation.name}
        </div>
        <div
          className="ml-auto"
          style={{
            fontFamily: "var(--font-body)",
            fontSize: "var(--text-xs)",
            color: "var(--color-text-muted)",
          }}
        >
          {conversation.type === "group" ? `${conversation.participants.length} Teilnehmer` : "Direkt"}
        </div>
      </div>

      {/* Messages */}
      <div
        className="flex-1 overflow-y-auto px-4 py-3"
        style={{ background: "var(--color-navy)" }}
      >
        {conversation.messages.length === 0 && (
          <div
            className="flex items-center justify-center h-full"
            style={{
              fontFamily: "var(--font-body)",
              fontSize: "var(--text-sm)",
              color: "var(--color-text-muted)",
            }}
          >
            Noch keine Nachrichten — sende die erste!
          </div>
        )}

        <div className="flex flex-col gap-2">
          {conversation.messages.map((msg) => (
            <MessageBubble key={msg.id} message={msg} />
          ))}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input */}
      <div
        className="flex items-center gap-2 px-4 py-3 shrink-0"
        style={{
          borderTop: "1px solid var(--color-border-gold-subtle)",
          background: "var(--color-navy-dark)",
        }}
      >
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Nachricht schreiben..."
          className="flex-1"
          style={{
            padding: "10px 14px",
            borderRadius: "var(--radius-md)",
            background: "var(--color-navy-light)",
            border: "1px solid var(--color-border-gold-subtle)",
            color: "var(--color-text-primary)",
            fontFamily: "var(--font-body)",
            fontSize: "var(--text-sm)",
            outline: "none",
          }}
        />
        <button
          onClick={handleSend}
          disabled={!input.trim()}
          style={{
            minWidth: "var(--touch-min)",
            minHeight: "var(--touch-min)",
            borderRadius: "var(--radius-md)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: input.trim() ? "pointer" : "not-allowed",
            transition: "all var(--duration-fast)",
            background: input.trim() ? "rgba(139,0,0,0.85)" : "rgba(27,40,56,0.5)",
            border: input.trim() ? "1px solid var(--color-gold)" : "1px solid transparent",
            color: input.trim() ? "var(--color-text-primary)" : "var(--color-text-muted)",
          }}
          aria-label="Nachricht senden"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
            <line x1="22" y1="2" x2="11" y2="13" />
            <polygon points="22 2 15 22 11 13 2 9 22 2" />
          </svg>
        </button>
      </div>
    </div>
  );
}

function MessageBubble({ message }: { message: ChatMessage }) {
  const time = new Date(message.timestamp);
  const timeStr = `${time.getHours().toString().padStart(2, "0")}:${time.getMinutes().toString().padStart(2, "0")}`;

  return (
    <div
      className="flex flex-col"
      style={{
        alignItems: message.isOwn ? "flex-end" : "flex-start",
        maxWidth: "80%",
        alignSelf: message.isOwn ? "flex-end" : "flex-start",
      }}
    >
      {!message.isOwn && (
        <span
          style={{
            fontFamily: "var(--font-body)",
            fontSize: "var(--text-xs)",
            fontWeight: "var(--font-semibold)",
            color: "var(--color-gold)",
            marginBottom: 2,
            marginLeft: 4,
          }}
        >
          {message.senderName}
        </span>
      )}
      <div
        style={{
          padding: "8px 14px",
          borderRadius: message.isOwn ? "12px 12px 4px 12px" : "12px 12px 12px 4px",
          background: message.isOwn ? "rgba(139,0,0,0.7)" : "var(--color-navy-light)",
          border: message.isOwn ? "1px solid rgba(197,165,90,0.3)" : "1px solid var(--color-border-gold-subtle)",
          color: "var(--color-text-primary)",
          fontFamily: "var(--font-body)",
          fontSize: "var(--text-sm)",
          lineHeight: 1.5,
          wordBreak: "break-word",
        }}
      >
        {message.content}
      </div>
      <span
        style={{
          fontFamily: "var(--font-mono)",
          fontSize: "10px",
          color: "var(--color-text-muted)",
          marginTop: 2,
          marginInline: 4,
        }}
      >
        {timeStr}
      </span>
    </div>
  );
}
