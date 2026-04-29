"use client";

import { motion, useMotionValue } from "framer-motion";
import { useGesture } from "@use-gesture/react";
import { DiplomacyMap } from "./DiplomacyMap";
import { useOrderStore } from "@/stores/useOrderStore";

export function MapContainer() {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const scale = useMotionValue(1);

  const { pendingOrders, isSubmitted } = useOrderStore();

  const bind = useGesture(
    {
      onDrag: ({ offset: [ox, oy], event }) => {
        event?.preventDefault();
        x.set(ox);
        y.set(oy);
      },
      onPinch: ({ offset: [s], event }) => {
        event?.preventDefault();
        scale.set(s);
      },
    },
    {
      drag: {
        from: () => [x.get(), y.get()],
      },
      pinch: {
        scaleBounds: { min: 0.5, max: 4 },
        modifierKey: "ctrlKey",
      },
    }
  );

  return (
    <div className="w-full h-full overflow-hidden bg-[var(--color-navy)] flex items-center justify-center relative touch-none">
      <motion.div
        {...(bind() as any)}
        style={{
          x,
          y,
          scale,
          width: "1000px",
          height: "800px",
          transformOrigin: "center center",
          cursor: "grab",
        }}
        whileTap={{ cursor: "grabbing" }}
      >
        <DiplomacyMap />
      </motion.div>

      {/* HUD */}
      <div className="absolute bottom-4 left-4 right-4 flex justify-between pointer-events-none">
        <div
          className="p-3 rounded text-white font-mono text-sm opacity-90 shadow-lg"
          style={{
            background: "var(--color-navy-dark)",
            border: "1px solid var(--color-border-wood)",
          }}
        >
          {isSubmitted ? (
            <span style={{ color: "var(--color-gold)" }}>Befehle eingereicht</span>
          ) : pendingOrders.length > 0 ? (
            <span>
              <span style={{ color: "var(--color-gold)", fontWeight: 700 }}>
                {pendingOrders.length}
              </span>{" "}
              {pendingOrders.length === 1 ? "Befehl" : "Befehle"} geplant
            </span>
          ) : (
            <span style={{ color: "var(--color-text-muted)" }}>
              Einheit antippen zum Auswählen
            </span>
          )}
        </div>

        <div
          className="p-3 rounded opacity-80 shadow-lg flex flex-col items-end"
          style={{
            background: "var(--color-navy-dark)",
            border: "1px solid var(--color-border-wood)",
            color: "var(--color-text-muted)",
            fontSize: "var(--text-xs)",
          }}
        >
          <span>Tippen: Einheit wählen / Befehl</span>
          <span>Halten 0.5s: Support-Modus</span>
          <span>Halten 2s: Convoy-Modus (Flotte)</span>
        </div>
      </div>
    </div>
  );
}
