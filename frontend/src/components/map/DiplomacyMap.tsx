"use client";

import { useEffect, useRef, useLayoutEffect, useState } from "react";
import { getAllStartingUnits, validateOrder, territories as allTerritories, territoryMap } from "@/game-logic";
import type { Unit, Order } from "@/game-logic";
import { useGameStore } from "@/stores/useGameStore";
import { useOrderStore } from "@/stores/useOrderStore";
import { OrderOverlay } from "./OrderOverlay";

interface Anchor {
  x: number;
  y: number;
}
interface PlacementEntry {
  anchors: { army?: Anchor; fleet?: Anchor; sf?: Anchor; air?: Anchor };
}
type Placements = Record<string, PlacementEntry>;

type InteractionMode = "normal" | "support" | "convoy";

// Maps store nation keys → unit nation strings (normalized)
const NATION_KEY_MAP: Record<string, string> = {
  gb: "england",
  de: "germany",
  at: "austriahungary",
  fr: "france",
  it: "italy",
  ru: "russia",
  tr: "turkey",
};

function normalizeNation(n: string): string {
  return n.toLowerCase().replace(/[\s-]/g, "");
}

function isOwnUnit(unit: Unit, nation: string | null): boolean {
  if (!nation) return true; // dev: all units are interactive when no nation set
  const playerKey = NATION_KEY_MAP[nation] ?? normalizeNation(nation);
  return normalizeNation(unit.nation) === playerKey;
}

// Traverse up from event target to find [data-territory] attribute
function findTerritory(target: EventTarget | null, container: Element): string | null {
  let el = target as Element | null;
  while (el && el !== container) {
    const tid = el.getAttribute?.("data-territory");
    if (tid) return tid;
    el = el.parentElement;
  }
  return null;
}

// Maps normalized unit.nation → PNG filename nation slug
const PNG_NATION: Record<string, string> = {
  england:           "england",
  france:            "france",
  germany:           "germany",
  austria:           "austria",
  austriahungary:    "austria",
  italy:             "italy",
  russia:            "russia",
  turkey:            "turkey",
  osmanischesreich:  "turkey",
  deutschesreich:    "germany",
  großbritannien:    "england",
};

function getPngNation(nation: string): string {
  return PNG_NATION[normalizeNation(nation)] ?? "england";
}

export function DiplomacyMap() {
  const svgContainerRef = useRef<HTMLDivElement>(null);
  const [placements, setPlacements] = useState<Placements>({});
  const [units, setUnits] = useState<Unit[]>([]);
  const [svgContent, setSvgContent] = useState<string>("");
  const [svgViewBox, setSvgViewBox] = useState("0 0 1136 1037");

  // Interaction state
  const [selectedUnit, setSelectedUnit] = useState<string | null>(null);
  const [mode, setMode] = useState<InteractionMode>("normal");
  const [convoyFromTerr, setConvoyFromTerr] = useState<string | null>(null);
  const [errorTerritory, setErrorTerritory] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Dual-coast choice state (F6 Korrektur)
  const [coastChoice, setCoastChoice] = useState<{ unit: string; target: string; coasts: string[] } | null>(null);

  // Store access
  const { nation } = useGameStore();
  const { pendingOrders, addOrder, removeOrder, isSubmitted } = useOrderStore();

  // Pointer tracking refs (stable — not causing re-renders)
  const pointerDown = useRef<{ territory: string; x: number; y: number; time: number } | null>(null);
  const moved = useRef(false);
  const longPressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const convoyTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // State ref — keeps event callbacks up-to-date without re-registering listeners
  const stateRef = useRef({
    mode,
    selectedUnit,
    convoyFromTerr,
    isSubmitted,
    units,
    nation,
    pendingOrders,
    coastChoice,
  });
  useLayoutEffect(() => {
    stateRef.current = { mode, selectedUnit, convoyFromTerr, isSubmitted, units, nation, pendingOrders, coastChoice };
  });

  // Load SVG + placements + units
  useEffect(() => {
    fetch("/diplomacy-map.svg")
      .then((r) => r.text())
      .then((text) => {
        const vbMatch = text.match(/viewBox="([^"]+)"/);
        if (vbMatch) setSvgViewBox(vbMatch[1]);
        setSvgContent(text);
      });

    fetch("/placements.json")
      .then((r) => r.json())
      .then((data: Placements) => setPlacements(data));

    setUnits(getAllStartingUnits());
  }, []);

  // ── Order validation helper ────────────────────────────────
  function validateAndAdd(order: Order) {
    const result = validateOrder(order, stateRef.current.units, allTerritories);
    if (result.valid) {
      addOrder(order);
    } else {
      setErrorTerritory(order.unit);
      setErrorMessage(result.error ?? "Ungültiger Zug");
      setTimeout(() => {
        setErrorTerritory(null);
        setErrorMessage(null);
      }, 1200);
    }
  }

  // ── Tap handler (reads stateRef to avoid stale closures) ──
  function handleTap(territory: string) {
    const { mode, selectedUnit, convoyFromTerr, isSubmitted, units, nation, pendingOrders } =
      stateRef.current;

    if (isSubmitted) return;

    // ── Support mode: one tap = select support destination ──
    if (mode === "support" && selectedUnit) {
      // Find if any pending order is moving TO this territory (support-attack)
      const attacker = pendingOrders.find(
        (o) => o.type === "move" && o.target === territory
      );
      const order: Order = attacker
        ? { unit: selectedUnit, type: "support", supportTarget: attacker.unit, supportDestination: territory }
        : { unit: selectedUnit, type: "support", supportTarget: territory };
      validateAndAdd(order);
      setMode("normal");
      setSelectedUnit(null);
      return;
    }

    // ── Convoy mode ───────────────────────────────────────────
    if (mode === "convoy" && selectedUnit) {
      if (!convoyFromTerr) {
        setConvoyFromTerr(territory);
        return;
      }
      const order: Order = {
        unit: selectedUnit,
        type: "convoy",
        convoyFrom: convoyFromTerr,
        convoyTo: territory,
      };
      validateAndAdd(order);
      setMode("normal");
      setSelectedUnit(null);
      setConvoyFromTerr(null);
      return;
    }

    // ── Normal mode ───────────────────────────────────────────
    const tappedUnit = units.find((u) => u.territory === territory);
    const ownUnit = tappedUnit && isOwnUnit(tappedUnit, nation);

    if (!selectedUnit) {
      if (ownUnit) setSelectedUnit(territory);
      return;
    }

    if (territory === selectedUnit) {
      // Re-tap own selected unit:
      //   • has pending order → cancel it (remove)
      //   • no pending order  → issue Hold
      const hasPending = pendingOrders.some((o) => o.unit === selectedUnit);
      if (hasPending) {
        removeOrder(selectedUnit);
      } else {
        validateAndAdd({ unit: selectedUnit, type: "hold" });
      }
      setSelectedUnit(null);
    } else {
      // Tap a different territory → Move
      // F6: Check for dual-coast territory
      const targetTerritory = territoryMap[territory];
      if (targetTerritory?.coastAdjacencies) {
        const coasts = Object.keys(targetTerritory.coastAdjacencies);
        setCoastChoice({ unit: selectedUnit, target: territory, coasts });
        setSelectedUnit(null);
        return;
      }
      validateAndAdd({ unit: selectedUnit, type: "move", target: territory });
      setSelectedUnit(null);
    }
  }

  function handleLongPress(territory: string) {
    const { isSubmitted, units, nation, selectedUnit } = stateRef.current;
    if (isSubmitted) return;

    const tappedUnit = units.find((u) => u.territory === territory);
    // Use tapped unit if it's own, otherwise use already-selected unit
    const supportingTerritory =
      tappedUnit && isOwnUnit(tappedUnit, nation)
        ? territory
        : selectedUnit;

    if (!supportingTerritory) return;

    setSelectedUnit(supportingTerritory);
    setMode("support");
    setConvoyFromTerr(null);
  }

  function handleConvoyPress(territory: string) {
    const { isSubmitted, units, nation } = stateRef.current;
    if (isSubmitted) return;

    const tappedUnit = units.find((u) => u.territory === territory);
    if (!tappedUnit || tappedUnit.type !== "fleet") return;
    if (!isOwnUnit(tappedUnit, nation)) return;

    setSelectedUnit(territory);
    setMode("convoy");
    setConvoyFromTerr(null);
  }

  function clearTimers() {
    if (longPressTimer.current) clearTimeout(longPressTimer.current);
    if (convoyTimer.current) clearTimeout(convoyTimer.current);
    longPressTimer.current = null;
    convoyTimer.current = null;
  }

  // ── Event delegation for touch gestures ────────────────────
  useEffect(() => {
    if (!svgContent || !svgContainerRef.current) return;
    const container = svgContainerRef.current;

    const onPointerDown = (e: PointerEvent) => {
      const territory = findTerritory(e.target, container);
      if (!territory) return;

      pointerDown.current = { territory, x: e.clientX, y: e.clientY, time: Date.now() };
      moved.current = false;

      longPressTimer.current = setTimeout(() => {
        if (!moved.current) handleLongPress(territory);
      }, 500);

      convoyTimer.current = setTimeout(() => {
        if (!moved.current) {
          clearTimers();
          handleConvoyPress(territory);
        }
      }, 2000);
    };

    const onPointerMove = (e: PointerEvent) => {
      if (!pointerDown.current) return;
      const dx = e.clientX - pointerDown.current.x;
      const dy = e.clientY - pointerDown.current.y;
      if (Math.sqrt(dx * dx + dy * dy) > 8) {
        moved.current = true;
        clearTimers();
      }
    };

    const onPointerUp = (e: PointerEvent) => {
      if (!pointerDown.current) return;
      clearTimers();
      const elapsed = Date.now() - pointerDown.current.time;
      const territory = pointerDown.current.territory;
      pointerDown.current = null;

      // Only treat as tap if finger didn't move and lifted quickly (<400ms)
      if (!moved.current && elapsed < 400) {
        handleTap(territory);
      }
      moved.current = false;
    };

    const onPointerCancel = () => {
      clearTimers();
      pointerDown.current = null;
      moved.current = false;
    };

    container.addEventListener("pointerdown", onPointerDown);
    container.addEventListener("pointermove", onPointerMove);
    container.addEventListener("pointerup", onPointerUp);
    container.addEventListener("pointercancel", onPointerCancel);

    return () => {
      container.removeEventListener("pointerdown", onPointerDown);
      container.removeEventListener("pointermove", onPointerMove);
      container.removeEventListener("pointerup", onPointerUp);
      container.removeEventListener("pointercancel", onPointerCancel);
      clearTimers();
    };
  }, [svgContent]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Territory highlighting ─────────────────────────────────
  useEffect(() => {
    if (!svgContent || !svgContainerRef.current) return;
    const container = svgContainerRef.current;
    const paths = container.querySelectorAll<SVGElement>("[data-territory]");

    const orderTerritories = new Set(pendingOrders.map((o) => o.unit));

    paths.forEach((el) => {
      const tid = el.getAttribute("data-territory");
      if (!tid) return;
      el.style.cursor = "pointer";

      if (tid === selectedUnit) {
        el.setAttribute("stroke", mode === "support" ? "#4A7FA5" : "var(--color-gold, #C5A55A)");
        el.setAttribute("stroke-width", "3");
      } else if (orderTerritories.has(tid)) {
        el.setAttribute("stroke", "rgba(197,165,90,0.6)");
        el.setAttribute("stroke-width", "2");
      } else {
        el.removeAttribute("stroke");
        el.removeAttribute("stroke-width");
      }
    });
  }, [svgContent, selectedUnit, mode, pendingOrders]);

  // ── Error blink animation ──────────────────────────────────
  useEffect(() => {
    if (!errorTerritory || !svgContainerRef.current) return;
    const el = svgContainerRef.current.querySelector<SVGElement>(
      `[data-territory="${errorTerritory}"]`
    );
    if (!el) return;
    el.style.animation = "invalid-blink 0.4s ease-in-out 2";
    el.setAttribute("stroke", "#CC0000");
    el.setAttribute("stroke-width", "3");
    const cleanup = setTimeout(() => {
      el.style.animation = "";
      el.removeAttribute("stroke");
      el.removeAttribute("stroke-width");
    }, 900);
    return () => clearTimeout(cleanup);
  }, [errorTerritory]);

  return (
    <div className="relative w-full h-full">
      {/* SVG Map */}
      <div
        ref={svgContainerRef}
        className="w-full h-full"
        dangerouslySetInnerHTML={{ __html: svgContent }}
        style={{ lineHeight: 0 }}
      />

      {/* Units Overlay */}
      {svgContent && (
        <svg
          className="absolute inset-0 w-full h-full pointer-events-none"
          viewBox={svgViewBox}
          style={{ zIndex: 5 }}
        >
          {units.map((unit) => {
            const placement = placements[unit.territory];
            if (!placement) return null;
            const anchor = placement.anchors[unit.type === "army" ? "army" : "fleet"];
            if (!anchor) return null;
            const { x, y } = anchor;
            const pngNation = getPngNation(unit.nation);
            const src = `/units/${unit.type}-${pngNation}.png`;
            const isSelected = unit.territory === selectedUnit;

            return (
              <g key={unit.id} transform={`translate(${x}, ${y})`}>
                {/* Drop shadow */}
                <circle r="13" fill="rgba(0,0,0,0.35)" cx="1" cy="1" />
                {/* Selection highlight ring */}
                {isSelected && (
                  <circle
                    r="15"
                    fill="none"
                    stroke={mode === "support" ? "#4A7FA5" : "#C5A55A"}
                    strokeWidth="3"
                    opacity="0.95"
                  />
                )}
                {/* PNG unit icon — 24×24px centred on anchor */}
                <image
                  href={src}
                  x="-12"
                  y="-12"
                  width="24"
                  height="24"
                  style={{ pointerEvents: "none" }}
                />
              </g>
            );
          })}
        </svg>
      )}

      {/* Order Overlay */}
      {svgContent && pendingOrders.length > 0 && (
        <OrderOverlay
          orders={pendingOrders}
          units={units}
          placements={placements}
          viewBox={svgViewBox}
        />
      )}

      {/* Interaction mode indicator */}
      {mode !== "normal" && (
        <div
          className="absolute top-2 left-0 right-0 flex justify-center pointer-events-none"
          style={{ zIndex: 20 }}
        >
          <div
            style={{
              background:
                mode === "support"
                  ? "rgba(42,110,166,0.92)"
                  : "rgba(45,80,22,0.92)",
              border: "1px solid var(--color-gold)",
              borderRadius: "var(--radius-md)",
              padding: "5px 14px",
              color: "var(--color-text-primary)",
              fontFamily: "var(--font-body)",
              fontSize: "var(--text-sm)",
              fontWeight: "var(--font-semibold)",
              letterSpacing: "0.06em",
              textTransform: "uppercase",
              boxShadow: "var(--shadow-base)",
            }}
          >
            {mode === "support" && !convoyFromTerr
              ? "Support-Modus — Wähle Zielgebiet"
              : mode === "convoy" && !convoyFromTerr
              ? "Convoy-Modus — Wähle Abgangsgebiet"
              : mode === "convoy" && convoyFromTerr
              ? `Convoy von ${convoyFromTerr.toUpperCase()} — Wähle Ziel`
              : null}
          </div>
        </div>
      )}

      {/* Error message */}
      {errorMessage && (
        <div
          className="absolute bottom-4 left-0 right-0 flex justify-center pointer-events-none"
          style={{ zIndex: 20, animation: "fade-in 0.15s ease-out" }}
        >
          <div
            style={{
              background: "rgba(204,0,0,0.92)",
              border: "1px solid rgba(255,68,68,0.6)",
              borderRadius: "var(--radius-md)",
              padding: "6px 16px",
              color: "#fff",
              fontFamily: "var(--font-body)",
              fontSize: "var(--text-sm)",
              fontWeight: "var(--font-medium)",
              boxShadow: "var(--shadow-danger)",
            }}
          >
            {errorMessage}
          </div>
        </div>
      )}

      {/* Submitted overlay */}
      {/* Dual-coast choice modal (F6) */}
      {coastChoice && (
        <div
          className="absolute inset-0 flex items-center justify-center"
          style={{ zIndex: 25, background: "rgba(17,28,39,0.6)" }}
          onClick={() => setCoastChoice(null)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: "var(--color-navy-dark)",
              border: "2px solid var(--color-gold)",
              borderRadius: "var(--radius-lg)",
              padding: "20px 24px",
              minWidth: 220,
              boxShadow: "var(--shadow-lg)",
              animation: "fade-in 0.15s ease-out",
            }}
          >
            <div
              style={{
                fontFamily: "var(--font-heading)",
                fontSize: "var(--text-md)",
                fontWeight: "var(--font-bold)",
                color: "var(--color-gold)",
                textTransform: "uppercase",
                letterSpacing: "0.05em",
                marginBottom: 12,
                textAlign: "center",
              }}
            >
              Welche Küste?
            </div>
            <div
              style={{
                fontFamily: "var(--font-body)",
                fontSize: "var(--text-sm)",
                color: "var(--color-text-muted)",
                marginBottom: 16,
                textAlign: "center",
              }}
            >
              Ziel: {coastChoice.target.toUpperCase()}
            </div>
            <div className="flex gap-3 justify-center">
              {coastChoice.coasts.map((coast) => (
                <button
                  key={coast}
                  onClick={() => {
                    validateAndAdd({
                      unit: coastChoice.unit,
                      type: "move",
                      target: `${coastChoice.target}-${coast}`,
                    });
                    setCoastChoice(null);
                  }}
                  style={{
                    minWidth: 80,
                    minHeight: "var(--touch-min)",
                    padding: "8px 16px",
                    borderRadius: "var(--radius-md)",
                    background: "rgba(139,0,0,0.85)",
                    border: "1px solid var(--color-gold)",
                    color: "var(--color-text-primary)",
                    fontFamily: "var(--font-body)",
                    fontSize: "var(--text-md)",
                    fontWeight: "var(--font-semibold)",
                    cursor: "pointer",
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
                    transition: "all var(--duration-fast)",
                  }}
                >
                  {coast === "nc" ? "Nord" : coast === "sc" ? "Süd" : coast === "ec" ? "Ost" : coast}
                </button>
              ))}
            </div>
            <button
              onClick={() => setCoastChoice(null)}
              style={{
                display: "block",
                margin: "12px auto 0",
                padding: "6px 16px",
                borderRadius: "var(--radius-md)",
                background: "transparent",
                border: "1px solid var(--color-text-muted)",
                color: "var(--color-text-muted)",
                fontFamily: "var(--font-body)",
                fontSize: "var(--text-sm)",
                cursor: "pointer",
              }}
            >
              Abbrechen
            </button>
          </div>
        </div>
      )}

      {isSubmitted && (
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: "rgba(17,28,39,0.15)",
            zIndex: 15,
          }}
        />
      )}
    </div>
  );
}
