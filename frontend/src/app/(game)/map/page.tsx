"use client";

import { MapContainer } from "@/components/map/MapContainer";
import { RetreatModal } from "@/components/game/RetreatModal";
import { BuildModal } from "@/components/game/BuildModal";
import { useGameStore } from "@/stores/useGameStore";
import { useState } from "react";
import type { RetreatOrder, BuildOrder, Unit, ResolutionResult } from "@/game-logic";

/**
 * Karte — Map Screen (F5 + F7)
 * Interaktive Karte + conditional Retreat/Build Modals basierend auf gamePhase.
 */

// Mock dislodged units for demo (replaced by backend data in production)
const MOCK_DISLODGED: Unit[] = [];
const MOCK_RESOLUTION: ResolutionResult = {
  moves: [],
  holds: [],
  supports: [],
  dislodged: [],
  bounces: [],
};
const MOCK_CURRENT_UNITS: Unit[] = [];

// Mock build data for demo
const MOCK_CONTROLLED_SCS = ["lon", "edi", "lvp"];
const MOCK_NATION_UNITS: Unit[] = [];
const MOCK_ALL_UNITS: Unit[] = [];

export default function MapPage() {
  const { gamePhase, nation } = useGameStore();
  const [retreatsDone, setRetreatsDone] = useState(false);
  const [buildsDone, setBuildsDone] = useState(false);

  const showRetreat = gamePhase === "retreat" && MOCK_DISLODGED.length > 0 && !retreatsDone;
  const showBuild = gamePhase === "build" && !buildsDone;

  const handleSubmitRetreats = (orders: RetreatOrder[]) => {
    console.log("Retreat orders submitted:", orders);
    // TODO: emit via WebSocket: socket.emit("submit-retreats", { gameId, orders })
    setRetreatsDone(true);
  };

  const handleSubmitBuilds = (orders: BuildOrder[]) => {
    console.log("Build orders submitted:", orders);
    // TODO: emit via WebSocket: socket.emit("submit-builds", { gameId, orders })
    setBuildsDone(true);
  };

  // Map nation key to full name for game-logic compatibility
  const nationNameMap: Record<string, string> = {
    gb: "England",
    de: "Germany",
    at: "Austria-Hungary",
    fr: "France",
    it: "Italy",
    ru: "Russia",
    tr: "Turkey",
  };
  const nationFullName = nation ? nationNameMap[nation] || "England" : "England";

  return (
    <div className="w-full h-full relative">
      <MapContainer />

      {showRetreat && (
        <RetreatModal
          dislodgedUnits={MOCK_DISLODGED}
          resolutionResult={MOCK_RESOLUTION}
          currentUnits={MOCK_CURRENT_UNITS}
          onSubmitRetreats={handleSubmitRetreats}
        />
      )}

      {showBuild && (
        <BuildModal
          nation={nationFullName}
          controlledSCs={MOCK_CONTROLLED_SCS}
          nationUnits={MOCK_NATION_UNITS}
          allUnits={MOCK_ALL_UNITS}
          onSubmitBuilds={handleSubmitBuilds}
        />
      )}
    </div>
  );
}
