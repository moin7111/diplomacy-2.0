import { create } from "zustand";

/**
 * Diplomacy 2.0 — Game State Store
 *
 * Zentraler State für den Spielzustand.
 * Wird in Phase 1 erweitert um: Einheiten, Befehle, Spieler, etc.
 */

export type GamePhase = "spring" | "autumn" | "retreat" | "build";
export type NavTab   = "map" | "diplomacy" | "economy" | "settings";
export type Nation   = "gb" | "de" | "at" | "fr" | "it" | "ru" | "tr" | null;

interface GameState {
  /* ── Aktiver Tab ─────────────────────────── */
  currentTab: NavTab;
  setTab: (tab: NavTab) => void;

  /* ── Spielphase ──────────────────────────── */
  gamePhase: GamePhase;
  setPhase: (phase: GamePhase) => void;

  /* ── Timer (Sekunden) ────────────────────── */
  timer: number;
  setTimer: (seconds: number) => void;

  /* ── Eigene Nation ───────────────────────── */
  nation: Nation;
  setNation: (nation: Nation) => void;

  /* ── Spieljahr ───────────────────────────── */
  year: number;
  setYear: (year: number) => void;

  /* ── Spiel-ID ────────────────────────────── */
  gameId: string | null;
  setGameId: (id: string | null) => void;
}

export const useGameStore = create<GameState>((set) => ({
  currentTab: "map",
  setTab: (tab) => set({ currentTab: tab }),

  gamePhase: "spring",
  setPhase: (phase) => set({ gamePhase: phase }),

  timer: 600, // 10 Minuten Default (Frühling)
  setTimer: (seconds) => set({ timer: seconds }),

  nation: null,
  setNation: (nation) => set({ nation }),

  year: 1901,
  setYear: (year) => set({ year }),

  gameId: null,
  setGameId: (id) => set({ gameId: id }),
}));
