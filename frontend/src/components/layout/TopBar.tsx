"use client";

/**
 * TopBar — Obere Info-Leiste (D1 Style Guide Section 10)
 * 56px Höhe, navy-dark Background, gold border-bottom
 * Platzhalter für: Exit, Nation Credits, Timer, Befehle Abgeben
 */

import { useEffect, useRef } from "react";
import { useGameStore } from "@/stores/useGameStore";
import { useAuthStore } from "@/stores/useAuthStore";

export function TopBar() {
  const { gamePhase, timer, gameId } = useGameStore();
  const { token } = useAuthStore();
  const socketRef = useRef<ReturnType<typeof import("socket.io-client").io> | null>(null);

  // Connect to WebSocket and sync server-authoritative timer
  useEffect(() => {
    if (!gameId || !token) return;

    let socket: ReturnType<typeof import("socket.io-client").io>;

    import("socket.io-client").then(({ io }) => {
      socket = io(`${process.env.NEXT_PUBLIC_WS_URL ?? "http://localhost:4000"}/game`, {
        query: { token },
        transports: ["websocket"],
      });
      socketRef.current = socket;

      socket.emit("join-game", { gameId });

      socket.on("timer-tick", (data: { timeLeft: number; phase: string }) => {
        useGameStore.setState({ timer: data.timeLeft });
        if (data.phase) useGameStore.setState({ gamePhase: data.phase as any });
      });

      socket.on("timer-expired", () => {
        useGameStore.setState({ timer: 0 });
      });

      socket.on("phase-change", (data: { phase: string; duration: number }) => {
        useGameStore.setState({ gamePhase: data.phase as any, timer: data.duration });
      });
    });

    return () => {
      socket?.emit("leave-game", { gameId });
      socket?.disconnect();
      socketRef.current = null;
    };
  }, [gameId, token]);

  // Local fallback countdown when no WebSocket (e.g. dev without backend)
  useEffect(() => {
    if (gameId) return; // WebSocket handles it when in a game
    if (timer <= 0) return;
    const interval = setInterval(() => {
      useGameStore.setState((state) => ({ timer: Math.max(0, state.timer - 1) }));
    }, 1000);
    return () => clearInterval(interval);
  }, [timer, gameId]);

  const phaseLabels: Record<string, string> = {
    spring: "Frühling",
    autumn: "Herbst",
    retreat: "Rückzug",
    build: "Winter",
  };

  const formatTimer = (seconds: number): string => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  const isTimerWarning = timer <= 60 && timer > 0;

  return (
    <header
      className="sticky top-0 left-0 right-0 flex items-center px-4"
      style={{
        height: "var(--topbar-height)",
        backgroundColor: "rgba(17, 28, 39, 0.95)",
        borderBottom: "2px solid rgba(197, 165, 90, 0.4)",
        zIndex: "var(--z-sticky)",
        paddingTop: "env(safe-area-inset-top, 0px)",
      }}
    >
      {/* Left: Exit Button */}
      <button
        className="flex items-center justify-center opacity-70 hover:opacity-100 transition-opacity"
        style={{
          minWidth: "var(--touch-min)",
          minHeight: "var(--touch-min)",
          color: "var(--color-gold)",
        }}
        aria-label="Spiel verlassen"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
          <line x1="18" y1="6" x2="6" y2="18" />
          <line x1="6" y1="6" x2="18" y2="18" />
        </svg>
      </button>

      {/* Center: Phase + placeholder info */}
      <div className="flex-1 flex items-center justify-center gap-3">
        <span
          style={{
            fontFamily: "var(--font-heading)",
            fontSize: "var(--text-sm)",
            fontWeight: "var(--font-semibold)",
            letterSpacing: "0.05em",
            textTransform: "uppercase",
            color: "var(--color-gold)",
          }}
        >
          {phaseLabels[gamePhase] || "—"}
        </span>
      </div>

      {/* Right: Timer */}
      <div
        className="flex items-center gap-2"
        style={{
          fontFamily: "var(--font-mono)",
          fontSize: "var(--text-xl)",
          fontWeight: "var(--font-bold)",
          fontVariantNumeric: "tabular-nums",
          letterSpacing: "0.05em",
          color: isTimerWarning ? "var(--color-warning)" : "var(--color-text-primary)",
          animation: isTimerWarning ? "timer-pulse 0.8s ease-in-out infinite alternate" : "none",
        }}
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4 opacity-60">
          <circle cx="12" cy="12" r="10" />
          <polyline points="12 6 12 12 16 14" />
        </svg>
        {formatTimer(timer)}
      </div>
    </header>
  );
}
