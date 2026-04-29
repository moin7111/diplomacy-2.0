import { create } from "zustand";

/**
 * Diplomacy 2.0 — Chat State Store (F9)
 *
 * Manages conversations, messages, and unread counts.
 * WebSocket integration is prepared; falls back to local state.
 */

export interface ChatMessage {
  id: string;
  sender: string;       // nation key or username
  senderName: string;   // display name
  content: string;
  timestamp: number;    // Date.now()
  isOwn: boolean;
}

export interface Conversation {
  id: string;
  name: string;
  type: "group" | "direct";
  participants: string[];
  messages: ChatMessage[];
  unreadCount: number;
  lastMessage?: string;
  lastTimestamp?: number;
}

interface ChatState {
  conversations: Conversation[];
  activeConversation: string | null;

  /* Actions */
  setConversations: (conversations: Conversation[]) => void;
  setActiveConversation: (id: string | null) => void;
  addMessage: (conversationId: string, message: ChatMessage) => void;
  setMessages: (conversationId: string, messages: ChatMessage[]) => void;
  markAsRead: (conversationId: string) => void;
  incrementUnread: (conversationId: string) => void;
}

// Default conversations for a Diplomacy game
const DEFAULT_CONVERSATIONS: Conversation[] = [
  {
    id: "global",
    name: "Alle Nationen",
    type: "group",
    participants: ["gb", "de", "at", "fr", "it", "ru", "tr"],
    messages: [],
    unreadCount: 0,
  },
  { id: "chat-gb", name: "England", type: "direct", participants: ["gb"], messages: [], unreadCount: 0 },
  { id: "chat-fr", name: "Frankreich", type: "direct", participants: ["fr"], messages: [], unreadCount: 0 },
  { id: "chat-de", name: "Deutschland", type: "direct", participants: ["de"], messages: [], unreadCount: 0 },
  { id: "chat-at", name: "Österreich-Ungarn", type: "direct", participants: ["at"], messages: [], unreadCount: 0 },
  { id: "chat-it", name: "Italien", type: "direct", participants: ["it"], messages: [], unreadCount: 0 },
  { id: "chat-ru", name: "Russland", type: "direct", participants: ["ru"], messages: [], unreadCount: 0 },
  { id: "chat-tr", name: "Türkei", type: "direct", participants: ["tr"], messages: [], unreadCount: 0 },
];

export const useChatStore = create<ChatState>((set) => ({
  conversations: DEFAULT_CONVERSATIONS,
  activeConversation: null,

  setConversations: (conversations) => set({ conversations }),

  setActiveConversation: (id) => set({ activeConversation: id }),

  addMessage: (conversationId, message) =>
    set((state) => ({
      conversations: state.conversations.map((c) =>
        c.id === conversationId
          ? {
              ...c,
              messages: [...c.messages, message],
              lastMessage: message.content,
              lastTimestamp: message.timestamp,
              unreadCount:
                state.activeConversation === conversationId
                  ? c.unreadCount
                  : c.unreadCount + (message.isOwn ? 0 : 1),
            }
          : c
      ),
    })),

  setMessages: (conversationId, messages) =>
    set((state) => ({
      conversations: state.conversations.map((c) =>
        c.id === conversationId
          ? {
              ...c,
              messages,
              lastMessage: messages[messages.length - 1]?.content,
              lastTimestamp: messages[messages.length - 1]?.timestamp,
            }
          : c
      ),
    })),

  markAsRead: (conversationId) =>
    set((state) => ({
      conversations: state.conversations.map((c) =>
        c.id === conversationId ? { ...c, unreadCount: 0 } : c
      ),
    })),

  incrementUnread: (conversationId) =>
    set((state) => ({
      conversations: state.conversations.map((c) =>
        c.id === conversationId ? { ...c, unreadCount: c.unreadCount + 1 } : c
      ),
    })),
}));
