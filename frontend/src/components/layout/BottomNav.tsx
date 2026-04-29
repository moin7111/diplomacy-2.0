"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useChatStore } from "@/stores/useChatStore";

/**
 * Bottom Navigation — D1 Style Guide
 * 4 Tabs: Karte, Diplomatie, Wirtschaft, Einstellungen
 * Holz-Hintergrund, Gold-Akzent, 44px+ Touch Targets
 */

interface NavTab {
  id: string;
  label: string;
  href: string;
  icon: React.ReactNode;
}

const tabs: NavTab[] = [
  {
    id: "map",
    label: "Karte",
    href: "/map",
    icon: <MapIcon />,
  },
  {
    id: "diplomacy",
    label: "Diplomatie",
    href: "/diplomacy",
    icon: <DiplomacyIcon />,
  },
  {
    id: "economy",
    label: "Wirtschaft",
    href: "/economy",
    icon: <EconomyIcon />,
  },
  {
    id: "settings",
    label: "Einstellungen",
    href: "/settings",
    icon: <SettingsIcon />,
  },
];

export function BottomNav() {
  const pathname = usePathname();
  const { conversations } = useChatStore();
  const totalUnread = conversations.reduce((acc, conv) => acc + conv.unreadCount, 0);

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 flex items-center justify-around px-4"
      style={{
        height: "var(--nav-height)",
        background: "linear-gradient(to bottom, #7A4E2D 0%, #5C3A21 100%)",
        borderTop: "3px solid #9E7E3A",
        boxShadow: "0 -4px 16px rgba(0,0,0,0.5)",
        zIndex: "var(--z-sticky)",
        paddingBottom: "env(safe-area-inset-bottom, 0px)",
      }}
      role="tablist"
      aria-label="Hauptnavigation"
    >
      {tabs.map((tab) => {
        const isActive = pathname === tab.href || pathname?.startsWith(tab.href + "/");
        return (
          <Link
            key={tab.id}
            href={tab.href}
            role="tab"
            aria-selected={isActive}
            aria-label={tab.label}
            className="flex flex-col items-center gap-1 transition-colors"
            style={{
              minWidth: "var(--touch-min)",
              minHeight: "var(--touch-min)",
              padding: "var(--space-2)",
              color: isActive ? "#EDD898" : "#9E7E3A",
              filter: isActive ? "drop-shadow(0 0 6px rgba(197,165,90,0.6))" : "none",
            }}
          >
            <div className="relative">
              <span className="w-6 h-6">{tab.icon}</span>
              {tab.id === "diplomacy" && totalUnread > 0 && (
                <div
                  className="absolute -top-1 -right-2 flex items-center justify-center bg-red-600 text-white rounded-full"
                  style={{
                    minWidth: 18,
                    height: 18,
                    fontSize: 10,
                    fontWeight: "bold",
                    padding: "0 4px",
                    border: "2px solid #5C3A21",
                  }}
                >
                  {totalUnread > 99 ? "99+" : totalUnread}
                </div>
              )}
            </div>
            <span
              className="leading-none"
              style={{
                fontFamily: "var(--font-body)",
                fontSize: "var(--text-xs)",
                fontWeight: "var(--font-semibold)",
                letterSpacing: "0.05em",
                textTransform: "uppercase",
              }}
            >
              {tab.label}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}


/* ═══════════════════════════════════════════════════
   SVG Icons (inline, currentColor, 24px)
   Custom icons per D1 Style Guide Section 12
   ═══════════════════════════════════════════════════ */

function MapIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6" />
      <line x1="8" y1="2" x2="8" y2="18" />
      <line x1="16" y1="6" x2="16" y2="22" />
    </svg>
  );
}

function DiplomacyIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
  );
}

function EconomyIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="1" x2="12" y2="23" />
      <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
    </svg>
  );
}

function SettingsIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </svg>
  );
}
