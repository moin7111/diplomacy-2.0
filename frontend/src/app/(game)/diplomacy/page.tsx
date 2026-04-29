"use client";

import { useState } from "react";
import { ChatList } from "@/components/chat/ChatList";
import { ChatDetail } from "@/components/chat/ChatDetail";
import { useChatStore } from "@/stores/useChatStore";

/**
 * Diplomatie — Chat Screen (F9)
 * Zeigt ChatList oder ChatDetail je nach activeConversation.
 */
export default function DiplomacyPage() {
  const [activeChat, setActiveChat] = useState<string | null>(null);
  const { markAsRead } = useChatStore();

  const handleSelectConversation = (id: string) => {
    setActiveChat(id);
    markAsRead(id);
  };

  const handleBack = () => {
    setActiveChat(null);
  };

  if (activeChat) {
    return (
      <div className="flex flex-col h-full">
        <ChatDetail conversationId={activeChat} onBack={handleBack} />
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-4 pt-4 pb-2">
        <h1
          style={{
            fontFamily: "var(--font-heading)",
            fontSize: "var(--text-xl)",
            fontWeight: "var(--font-bold)",
            letterSpacing: "0.05em",
            textTransform: "uppercase",
            color: "var(--color-text-primary)",
          }}
        >
          Diplomatie
        </h1>
      </div>

      <ChatList onSelectConversation={handleSelectConversation} />
    </div>
  );
}
