import { create } from "zustand";

/**
 * Diplomacy 2.0 — UI State Store
 *
 * Verwaltet rein visuelle UI-Zustände (keine Spiellogik).
 */

interface UIState {
  /* ── Bottom Nav ──────────────────────────── */
  bottomNavExpanded: boolean;
  toggleBottomNav: () => void;
  setBottomNavExpanded: (expanded: boolean) => void;

  /* ── Sidebar (Tablet/Desktop) ────────────── */
  sidebarOpen: boolean;
  toggleSidebar: () => void;

  /* ── Modal / Overlay ─────────────────────── */
  activeModal: string | null;
  openModal: (id: string) => void;
  closeModal: () => void;

  /* ── Toast Notifications ─────────────────── */
  toast: { message: string; type: "success" | "danger" | "warning" | "info" } | null;
  showToast: (message: string, type?: "success" | "danger" | "warning" | "info") => void;
  dismissToast: () => void;
}

export const useUIStore = create<UIState>((set) => ({
  bottomNavExpanded: false,
  toggleBottomNav: () =>
    set((state) => ({ bottomNavExpanded: !state.bottomNavExpanded })),
  setBottomNavExpanded: (expanded) => set({ bottomNavExpanded: expanded }),

  sidebarOpen: false,
  toggleSidebar: () =>
    set((state) => ({ sidebarOpen: !state.sidebarOpen })),

  activeModal: null,
  openModal: (id) => set({ activeModal: id }),
  closeModal: () => set({ activeModal: null }),

  toast: null,
  showToast: (message, type = "info") => set({ toast: { message, type } }),
  dismissToast: () => set({ toast: null }),
}));
