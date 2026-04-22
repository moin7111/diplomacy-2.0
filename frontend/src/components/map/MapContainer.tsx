"use client";

import { useState } from "react";
import { motion, useMotionValue } from "framer-motion";
import { useGesture } from "@use-gesture/react";
import { DiplomacyMap } from "./DiplomacyMap";

export function MapContainer() {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const scale = useMotionValue(1);

  const [selectedTerritory, setSelectedTerritory] = useState<string | null>(null);

  // useGesture bind for drag and pinch events
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
    <div 
      className="w-full h-full overflow-hidden bg-[var(--color-navy)] flex items-center justify-center relative touch-none"
    >
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
        <DiplomacyMap
          selectedTerritory={selectedTerritory}
          onTerritoryClick={setSelectedTerritory}
        />
      </motion.div>
      
      {/* HUD Info */}
      <div className="absolute bottom-4 left-4 right-4 flex justify-between pointer-events-none">
        <div className="bg-[#111C27] border border-[var(--color-wood)] p-3 rounded text-white font-mono text-sm opacity-90 shadow-lg pointer-events-auto">
          {selectedTerritory 
            ? `Ausgewählt: ${selectedTerritory.toUpperCase()}`
            : "Kein Gebiet ausgewählt"
          }
        </div>
        <div className="bg-[#111C27] border border-[var(--color-wood)] p-3 rounded text-[var(--color-text-muted)] text-xs opacity-80 shadow-lg flex flex-col pointer-events-none">
          <span>Pinch/Zoom unterstützt</span>
          <span>Befehlseingabe folgt (F6)</span>
        </div>
      </div>
    </div>
  );
}
