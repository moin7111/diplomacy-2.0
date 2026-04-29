"use client";

import { useState, useMemo } from "react";
import type { Unit, RetreatOrder } from "@/game-logic";
import { getRetreatOptions } from "@/game-logic";
import type { ResolutionResult } from "@/game-logic";

/**
 * RetreatModal (F7) — Shown during retreat phase when dislodged units exist.
 * Allows player to select retreat destinations or disband.
 */

interface Props {
  dislodgedUnits: Unit[];
  resolutionResult: ResolutionResult;
  currentUnits: Unit[];
  onSubmitRetreats: (orders: RetreatOrder[]) => void;
}

export function RetreatModal({ dislodgedUnits, resolutionResult, currentUnits, onSubmitRetreats }: Props) {
  const [selections, setSelections] = useState<Record<string, string>>({});

  const retreatOptionsMap = useMemo(() => {
    const map: Record<string, string[]> = {};
    for (const unit of dislodgedUnits) {
      map[unit.territory] = getRetreatOptions(unit, resolutionResult, currentUnits);
    }
    return map;
  }, [dislodgedUnits, resolutionResult, currentUnits]);

  const handleSelect = (unitTerritory: string, target: string) => {
    setSelections((prev) => ({ ...prev, [unitTerritory]: target }));
  };

  const allSelected = dislodgedUnits.every((u) => selections[u.territory]);

  const handleSubmit = () => {
    const orders: RetreatOrder[] = dislodgedUnits.map((unit) => ({
      unit: unit.territory,
      target: selections[unit.territory] || "disband",
    }));
    onSubmitRetreats(orders);
  };

  return (
    <div
      className="fixed inset-0 flex items-center justify-center"
      style={{ zIndex: 30, background: "var(--color-overlay)" }}
    >
      <div
        style={{
          background: "var(--color-navy-dark)",
          border: "2px solid var(--color-gold)",
          borderRadius: "var(--radius-lg)",
          padding: "24px",
          width: "min(420px, 90vw)",
          maxHeight: "80vh",
          overflowY: "auto",
          boxShadow: "var(--shadow-lg)",
          animation: "slide-up 0.3s ease-out",
        }}
      >
        {/* Header */}
        <div
          style={{
            fontFamily: "var(--font-heading)",
            fontSize: "var(--text-xl)",
            fontWeight: "var(--font-bold)",
            color: "var(--color-gold)",
            textTransform: "uppercase",
            letterSpacing: "0.06em",
            marginBottom: 8,
            textAlign: "center",
          }}
        >
          Rückzugsphase
        </div>
        <div
          style={{
            fontFamily: "var(--font-body)",
            fontSize: "var(--text-sm)",
            color: "var(--color-text-muted)",
            marginBottom: 20,
            textAlign: "center",
          }}
        >
          {dislodgedUnits.length} vertriebene {dislodgedUnits.length === 1 ? "Einheit" : "Einheiten"} — wähle Rückzugsziel
        </div>

        {/* Unit list */}
        <div className="flex flex-col gap-4">
          {dislodgedUnits.map((unit) => {
            const options = retreatOptionsMap[unit.territory] || [];
            const selected = selections[unit.territory] || "";

            return (
              <div
                key={unit.id}
                style={{
                  background: "var(--color-navy-light)",
                  border: "1px solid var(--color-border-gold-subtle)",
                  borderRadius: "var(--radius-md)",
                  padding: "12px 16px",
                }}
              >
                <div className="flex items-center gap-3 mb-2">
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center"
                    style={{
                      background: unit.type === "army" ? "rgba(139,0,0,0.6)" : "rgba(42,110,166,0.6)",
                      border: "2px solid var(--color-gold)",
                    }}
                  >
                    <span
                      style={{
                        fontFamily: "var(--font-body)",
                        fontSize: "var(--text-xs)",
                        fontWeight: "var(--font-bold)",
                        color: "var(--color-text-primary)",
                      }}
                    >
                      {unit.type === "army" ? "A" : "F"}
                    </span>
                  </div>
                  <div>
                    <div
                      style={{
                        fontFamily: "var(--font-body)",
                        fontSize: "var(--text-md)",
                        fontWeight: "var(--font-semibold)",
                        color: "var(--color-text-primary)",
                      }}
                    >
                      {unit.nation} — {unit.territory.toUpperCase()}
                    </div>
                    <div
                      style={{
                        fontFamily: "var(--font-body)",
                        fontSize: "var(--text-xs)",
                        color: "var(--color-text-muted)",
                      }}
                    >
                      {options.length === 0 ? "Kein Rückzug möglich" : `${options.length} Optionen`}
                    </div>
                  </div>
                </div>

                <select
                  value={selected}
                  onChange={(e) => handleSelect(unit.territory, e.target.value)}
                  style={{
                    width: "100%",
                    padding: "8px 12px",
                    borderRadius: "var(--radius-md)",
                    background: "var(--color-navy)",
                    border: "1px solid var(--color-border-gold-subtle)",
                    color: "var(--color-text-primary)",
                    fontFamily: "var(--font-body)",
                    fontSize: "var(--text-sm)",
                    cursor: "pointer",
                  }}
                >
                  <option value="">— Wähle Ziel —</option>
                  {options.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt.toUpperCase()}
                    </option>
                  ))}
                  <option value="disband">❌ Auflösen (Disband)</option>
                </select>
              </div>
            );
          })}
        </div>

        {/* Submit */}
        <button
          onClick={handleSubmit}
          disabled={!allSelected}
          style={{
            display: "block",
            width: "100%",
            marginTop: 20,
            padding: "12px",
            borderRadius: "var(--radius-md)",
            fontFamily: "var(--font-body)",
            fontSize: "var(--text-md)",
            fontWeight: "var(--font-bold)",
            textTransform: "uppercase",
            letterSpacing: "0.05em",
            cursor: allSelected ? "pointer" : "not-allowed",
            transition: "all var(--duration-fast)",
            ...(allSelected
              ? {
                  background: "rgba(139,0,0,0.85)",
                  border: "2px solid var(--color-gold)",
                  color: "var(--color-text-primary)",
                  boxShadow: "var(--shadow-btn-raised)",
                }
              : {
                  background: "rgba(27,40,56,0.7)",
                  border: "2px solid rgba(197,165,90,0.2)",
                  color: "var(--color-text-muted)",
                }),
          }}
        >
          Rückzüge bestätigen
        </button>
      </div>
    </div>
  );
}
