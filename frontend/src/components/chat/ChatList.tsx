"use client";

import { useChatStore, type Conversation } from "@/stores/useChatStore";
import { useGameStore } from "@/stores/useGameStore";

/**
 * ChatList (F9) — Shows all conversations (group + direct) with unread badges.
 */

const NATION_COLORS: Record<string, string> = {
  gb: "var(--color-nation-gb)",
  de: "var(--color-nation-de)",
  at: "var(--color-nation-at)",
  fr: "var(--color-nation-fr)",
  it: "var(--color-nation-it)",
  ru: "var(--color-nation-ru)",
  tr: "var(--color-nation-tr)",
};

interface Props {
  onSelectConversation: (id: string) => void;
}

export function ChatList({ onSelectConversation }: Props) {
  const { conversations } = useChatStore();
  const { nation } = useGameStore();

  // Filter out own nation from direct chats
  const filteredConversations = conversations.filter((c) => {
    if (c.type === "group") return true;
    return !c.participants.includes(nation || "");
  });

  // Group first, then directs
  const groups = filteredConversations.filter((c) => c.type === "group");
  const directs = filteredConversations.filter((c) => c.type === "direct");

  return (
    <div className="flex flex-col gap-3 p-4">
      {/* Section: Group chats */}
      <SectionLabel>Gruppenchats</SectionLabel>
      {groups.map((conv) => (
        <ConversationCard key={conv.id} conversation={conv} onClick={() => onSelectConversation(conv.id)} />
      ))}

      {/* Section: Direct chats */}
      <SectionLabel>Direkte Nachrichten</SectionLabel>
      {directs.map((conv) => (
        <ConversationCard key={conv.id} conversation={conv} onClick={() => onSelectConversation(conv.id)} />
      ))}
    </div>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        fontFamily: "var(--font-heading)",
        fontSize: "var(--text-sm)",
        fontWeight: "var(--font-semibold)",
        letterSpacing: "0.08em",
        textTransform: "uppercase",
        color: "var(--color-gold)",
        marginTop: 8,
        marginBottom: 4,
      }}
    >
      {children}
    </div>
  );
}

function ConversationCard({ conversation, onClick }: { conversation: Conversation; onClick: () => void }) {
  const nationKey = conversation.participants[0];
  const color = conversation.type === "group" ? "var(--color-gold)" : NATION_COLORS[nationKey] || "var(--color-gold)";

  return (
    <button
      onClick={onClick}
      className="flex items-center gap-3 p-4 rounded-lg cursor-pointer transition-all w-full text-left"
      style={{
        backgroundColor: "var(--color-navy-light)",
        border: "2px solid rgba(197,165,90,0.2)",
      }}
    >
      {/* Avatar */}
      <div
        className="w-10 h-10 rounded-full flex items-center justify-center shrink-0"
        style={{
          backgroundColor: `color-mix(in srgb, ${color} 20%, transparent)`,
          border: `2px solid ${color}`,
        }}
      >
        {conversation.type === "group" ? (
          <svg viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} className="w-5 h-5">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
            <circle cx="9" cy="7" r="4" />
            <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
            <path d="M16 3.13a4 4 0 0 1 0 7.75" />
          </svg>
        ) : (
          <svg viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} className="w-5 h-5">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          </svg>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div
          style={{
            fontFamily: "var(--font-body)",
            fontSize: "var(--text-md)",
            fontWeight: "var(--font-semibold)",
            color: "var(--color-text-primary)",
          }}
        >
          {conversation.name}
        </div>
        <div
          className="truncate"
          style={{
            fontFamily: "var(--font-body)",
            fontSize: "var(--text-sm)",
            color: "var(--color-text-muted)",
          }}
        >
          {conversation.lastMessage || "Noch keine Nachrichten"}
        </div>
      </div>

      {/* Unread badge */}
      {conversation.unreadCount > 0 && (
        <div
          className="flex items-center justify-center shrink-0"
          style={{
            minWidth: 22,
            height: 22,
            borderRadius: "var(--radius-full)",
            background: "var(--color-danger)",
            fontFamily: "var(--font-body)",
            fontSize: "var(--text-xs)",
            fontWeight: "var(--font-bold)",
            color: "white",
            padding: "0 6px",
          }}
        >
          {conversation.unreadCount}
        </div>
      )}
    </button>
  );
}
