"use client";

import { useEffect, useRef } from "react";
import { useGameStore } from "@/stores/useGameStore";
import { useAuthStore } from "@/stores/useAuthStore";
import { useOrderStore } from "@/stores/useOrderStore";

export function TopBar() {
  const { gamePhase, timer, gameId } = useGameStore();
  const { token } = useAuthStore();
  const { pendingOrders, isSubmitted, setSubmitted } = useOrderStore();
  const socketRef = useRef<ReturnType<typeof import("socket.io-client").io> | null>(null);

  const isMovementPhase = gamePhase === "spring" || gamePhase === "autumn";

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
        // Reset submitted state on phase change
        setSubmitted(false);
      });
    });

    return () => {
      socket?.emit("leave-game", { gameId });
      socket?.disconnect();
      socketRef.current = null;
    };
  }, [gameId, token, setSubmitted]);

  // Local fallback countdown when no WebSocket (e.g. dev without backend)
  useEffect(() => {
    if (gameId) return;
    if (timer <= 0) return;
    const interval = setInterval(() => {
      useGameStore.setState((state) => ({ timer: Math.max(0, state.timer - 1) }));
    }, 1000);
    return () => clearInterval(interval);
  }, [timer, gameId]);

  const handleSubmitOrders = () => {
    if (isSubmitted || !isMovementPhase) return;
    if (socketRef.current && gameId) {
      socketRef.current.emit("submit-orders", { gameId, orders: pendingOrders });
    }
    setSubmitted(true);
  };

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
      className="sticky top-0 left-0 right-0 flex items-center px-4 gap-2"
      style={{
        height: "var(--topbar-height)",
        backgroundColor: "rgba(17, 28, 39, 0.95)",
        borderBottom: "2px solid rgba(197, 165, 90, 0.4)",
        zIndex: "var(--z-sticky)",
        paddingTop: "env(safe-area-inset-top, 0px)",
      }}
    >
      {/* Left: Exit */}
      <button
        className="flex items-center justify-center opacity-70 hover:opacity-100 transition-opacity shrink-0"
        style={{
          minWidth: "var(--touch-min)",
          minHeight: "var(--touch-min)",
          color: "var(--color-gold)",
        }}
        aria-label="Spiel verlassen"
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
          className="w-5 h-5"
        >
          <line x1="18" y1="6" x2="6" y2="18" />
          <line x1="6" y1="6" x2="18" y2="18" />
        </svg>
      </button>

      {/* Center: Phase label */}
      <div className="flex-1 flex items-center justify-center">
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

      {/* Right: Submit button + Timer */}
      <div className="flex items-center gap-3 shrink-0">
        {/* Befehle abgeben — only during movement phases */}
        {isMovementPhase && (
          <button
            onClick={handleSubmitOrders}
            disabled={isSubmitted}
            aria-label="Befehle abgeben"
            style={{
              minHeight: "var(--touch-min)",
              paddingInline: "var(--space-4)",
              borderRadius: "var(--radius-md)",
              fontFamily: "var(--font-body)",
              fontSize: "var(--text-xs)",
              fontWeight: "var(--font-semibold)",
              letterSpacing: "0.05em",
              textTransform: "uppercase",
              cursor: isSubmitted ? "default" : "pointer",
              transition: "all var(--duration-fast)",
              display: "flex",
              alignItems: "center",
              gap: "6px",
              ...(isSubmitted
                ? {
                    background: "rgba(45,80,22,0.7)",
                    border: "1px solid rgba(61,107,32,0.8)",
                    color: "#7ABA4A",
                    opacity: 0.85,
                  }
                : pendingOrders.length > 0
                ? {
                    background: "rgba(139,0,0,0.85)",
                    border: "1px solid rgba(197,165,90,0.7)",
                    color: "var(--color-text-primary)",
                    boxShadow: "var(--shadow-btn-raised)",
                  }
                : {
                    background: "rgba(27,40,56,0.7)",
                    border: "1px solid rgba(197,165,90,0.3)",
                    color: "var(--color-text-muted)",
                  }),
            }}
          >
            {isSubmitted ? (
              <>
                {/* Check icon */}
                <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" style={{ width: 13, height: 13 }}>
                  <polyline points="2 8 6 12 14 4" />
                </svg>
                Eingereicht
              </>
            ) : (
              <>
                {/* Send/flag icon */}
                <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" style={{ width: 13, height: 13 }}>
                  <line x1="8" y1="1" x2="8" y2="15" />
                  <polyline points="8 1 15 5 8 9" />
                </svg>
                {pendingOrders.length > 0
                  ? `Abgeben (${pendingOrders.length})`
                  : "Abgeben"}
              </>
            )}
          </button>
        )}

        {/* Timer */}
        <div
          className="flex items-center gap-2"
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: "var(--text-xl)",
            fontWeight: "var(--font-bold)",
            fontVariantNumeric: "tabular-nums",
            letterSpacing: "0.05em",
            color: isTimerWarning
              ? "var(--color-warning)"
              : "var(--color-text-primary)",
            animation: isTimerWarning
              ? "timer-pulse 0.8s ease-in-out infinite alternate"
              : "none",
          }}
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            className="w-4 h-4 opacity-60"
          >
            <circle cx="12" cy="12" r="10" />
            <polyline points="12 6 12 12 16 14" />
          </svg>
          {formatTimer(timer)}
        </div>
      </div>
    </header>
  );
}
