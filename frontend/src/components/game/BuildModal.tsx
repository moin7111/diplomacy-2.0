"use client";

import { useState, useMemo } from "react";
import type { Unit, BuildCalculation, BuildOrder } from "@/game-logic";
import { calculateBuilds, getTerritory } from "@/game-logic";
import type { CoastSpecifier } from "@/game-logic";

/**
 * BuildModal (F7) — Shown during build/adjustment phase (Winter).
 * Handles both builds (diff > 0) and disbands (diff < 0).
 */

interface Props {
  nation: string;
  controlledSCs: string[];
  nationUnits: Unit[];
  allUnits: Unit[];
  onSubmitBuilds: (orders: BuildOrder[]) => void;
}

export function BuildModal({ nation, controlledSCs, nationUnits, allUnits, onSubmitBuilds }: Props) {
  const calc = useMemo(
    () => calculateBuilds(nation, controlledSCs, nationUnits, allUnits),
    [nation, controlledSCs, nationUnits, allUnits]
  );

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
          Winterphase — Anpassung
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
          {calc.controlledSCs.length} VZ kontrolliert, {calc.currentUnitCount} Einheiten
          {" — "}
          {calc.diff > 0 && <span style={{ color: "var(--color-success-light)" }}>{calc.diff} Aufbau möglich</span>}
          {calc.diff < 0 && <span style={{ color: "var(--color-danger)" }}>{Math.abs(calc.diff)} muss aufgelöst werden</span>}
          {calc.diff === 0 && <span>Keine Anpassung nötig</span>}
        </div>

        {calc.diff === 0 ? (
          <NoAdjustmentView onSubmitBuilds={onSubmitBuilds} />
        ) : calc.diff > 0 ? (
          <BuildView calc={calc} nation={nation} onSubmitBuilds={onSubmitBuilds} />
        ) : (
          <DisbandView calc={calc} nation={nation} nationUnits={nationUnits} onSubmitBuilds={onSubmitBuilds} />
        )}
      </div>
    </div>
  );
}

/* ── No Adjustment ───────────────────────────────────────── */
function NoAdjustmentView({ onSubmitBuilds }: { onSubmitBuilds: (orders: BuildOrder[]) => void }) {
  return (
    <div className="flex flex-col items-center gap-4">
      <div
        style={{
          fontFamily: "var(--font-body)",
          fontSize: "var(--text-md)",
          color: "var(--color-text-primary)",
          textAlign: "center",
          padding: "16px 0",
        }}
      >
        Deine Einheiten stimmen mit deinen Versorgungszentren überein. Keine Anpassung nötig.
      </div>
      <button
        onClick={() => onSubmitBuilds([])}
        style={{
          width: "100%",
          padding: "12px",
          borderRadius: "var(--radius-md)",
          background: "rgba(45,80,22,0.85)",
          border: "2px solid var(--color-gold)",
          color: "var(--color-text-primary)",
          fontFamily: "var(--font-body)",
          fontSize: "var(--text-md)",
          fontWeight: "var(--font-bold)",
          textTransform: "uppercase",
          letterSpacing: "0.05em",
          cursor: "pointer",
        }}
      >
        Weiter
      </button>
    </div>
  );
}

/* ── Build View ───────────────────────────────────────────── */
interface BuildEntry {
  territory: string;
  unitType: "army" | "fleet";
  coast?: CoastSpecifier;
}

function BuildView({
  calc,
  nation,
  onSubmitBuilds,
}: {
  calc: BuildCalculation;
  nation: string;
  onSubmitBuilds: (orders: BuildOrder[]) => void;
}) {
  const maxBuilds = Math.min(calc.diff, calc.availableHomeSCs.length);
  const [entries, setEntries] = useState<BuildEntry[]>([]);

  const addEntry = () => {
    if (entries.length >= maxBuilds) return;
    const available = calc.availableHomeSCs.filter((sc) => !entries.some((e) => e.territory === sc));
    if (available.length === 0) return;
    setEntries([...entries, { territory: available[0], unitType: "army" }]);
  };

  const updateEntry = (index: number, patch: Partial<BuildEntry>) => {
    setEntries((prev) => prev.map((e, i) => (i === index ? { ...e, ...patch } : e)));
  };

  const removeEntry = (index: number) => {
    setEntries((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = () => {
    const orders: BuildOrder[] = entries.map((e) => ({
      type: "build" as const,
      nation,
      territory: e.territory,
      unitType: e.unitType,
      coast: e.coast,
    }));
    onSubmitBuilds(orders);
  };

  const usedTerritories = new Set(entries.map((e) => e.territory));

  return (
    <div className="flex flex-col gap-4">
      {entries.map((entry, i) => {
        const territory = getTerritory(entry.territory);
        const isDualCoast = !!territory.coastAdjacencies;

        return (
          <div
            key={i}
            style={{
              background: "var(--color-navy-light)",
              border: "1px solid var(--color-border-gold-subtle)",
              borderRadius: "var(--radius-md)",
              padding: "12px 16px",
            }}
          >
            <div className="flex items-center justify-between mb-2">
              <span
                style={{
                  fontFamily: "var(--font-body)",
                  fontWeight: "var(--font-semibold)",
                  fontSize: "var(--text-sm)",
                  color: "var(--color-text-primary)",
                }}
              >
                Aufbau #{i + 1}
              </span>
              <button
                onClick={() => removeEntry(i)}
                style={{
                  color: "var(--color-danger)",
                  fontSize: "var(--text-sm)",
                  cursor: "pointer",
                  background: "none",
                  border: "none",
                }}
              >
                Entfernen
              </button>
            </div>

            {/* Territory select */}
            <select
              value={entry.territory}
              onChange={(e) => updateEntry(i, { territory: e.target.value, coast: undefined })}
              style={{
                width: "100%",
                padding: "8px 12px",
                borderRadius: "var(--radius-md)",
                background: "var(--color-navy)",
                border: "1px solid var(--color-border-gold-subtle)",
                color: "var(--color-text-primary)",
                fontFamily: "var(--font-body)",
                fontSize: "var(--text-sm)",
                marginBottom: 8,
              }}
            >
              {calc.availableHomeSCs
                .filter((sc) => sc === entry.territory || !usedTerritories.has(sc))
                .map((sc) => (
                  <option key={sc} value={sc}>
                    {sc.toUpperCase()}
                  </option>
                ))}
            </select>

            {/* Unit type toggle */}
            <div className="flex gap-2 mb-2">
              {(["army", "fleet"] as const).map((ut) => (
                <button
                  key={ut}
                  onClick={() => updateEntry(i, { unitType: ut, coast: undefined })}
                  style={{
                    flex: 1,
                    padding: "6px 10px",
                    borderRadius: "var(--radius-md)",
                    fontFamily: "var(--font-body)",
                    fontSize: "var(--text-sm)",
                    fontWeight: "var(--font-semibold)",
                    cursor: "pointer",
                    textTransform: "uppercase",
                    letterSpacing: "0.04em",
                    transition: "all var(--duration-fast)",
                    background: entry.unitType === ut ? "rgba(139,0,0,0.85)" : "transparent",
                    border: entry.unitType === ut ? "1px solid var(--color-gold)" : "1px solid var(--color-text-muted)",
                    color: entry.unitType === ut ? "var(--color-text-primary)" : "var(--color-text-muted)",
                  }}
                >
                  {ut === "army" ? "Armee" : "Flotte"}
                </button>
              ))}
            </div>

            {/* Coast select (only for fleet on dual-coast) */}
            {entry.unitType === "fleet" && isDualCoast && territory.coastAdjacencies && (
              <select
                value={entry.coast || ""}
                onChange={(e) => updateEntry(i, { coast: (e.target.value || undefined) as CoastSpecifier | undefined })}
                style={{
                  width: "100%",
                  padding: "8px 12px",
                  borderRadius: "var(--radius-md)",
                  background: "var(--color-navy)",
                  border: "1px solid var(--color-border-gold-subtle)",
                  color: "var(--color-text-primary)",
                  fontFamily: "var(--font-body)",
                  fontSize: "var(--text-sm)",
                }}
              >
                <option value="">— Küste wählen —</option>
                {Object.keys(territory.coastAdjacencies).map((coast) => (
                  <option key={coast} value={coast}>
                    {coast === "nc" ? "Nordküste" : coast === "sc" ? "Südküste" : coast === "ec" ? "Ostküste" : coast}
                  </option>
                ))}
              </select>
            )}
          </div>
        );
      })}

      {entries.length < maxBuilds && (
        <button
          onClick={addEntry}
          style={{
            width: "100%",
            padding: "10px",
            borderRadius: "var(--radius-md)",
            background: "transparent",
            border: "2px dashed var(--color-border-gold-subtle)",
            color: "var(--color-gold)",
            fontFamily: "var(--font-body)",
            fontSize: "var(--text-sm)",
            fontWeight: "var(--font-semibold)",
            cursor: "pointer",
            textTransform: "uppercase",
            letterSpacing: "0.05em",
          }}
        >
          + Einheit aufbauen ({entries.length}/{maxBuilds})
        </button>
      )}

      <button
        onClick={handleSubmit}
        style={{
          width: "100%",
          padding: "12px",
          borderRadius: "var(--radius-md)",
          background: "rgba(139,0,0,0.85)",
          border: "2px solid var(--color-gold)",
          color: "var(--color-text-primary)",
          fontFamily: "var(--font-body)",
          fontSize: "var(--text-md)",
          fontWeight: "var(--font-bold)",
          textTransform: "uppercase",
          letterSpacing: "0.05em",
          cursor: "pointer",
          boxShadow: "var(--shadow-btn-raised)",
        }}
      >
        Aufbau bestätigen
      </button>
    </div>
  );
}

/* ── Disband View ─────────────────────────────────────────── */
function DisbandView({
  calc,
  nation,
  nationUnits,
  onSubmitBuilds,
}: {
  calc: BuildCalculation;
  nation: string;
  nationUnits: Unit[];
  onSubmitBuilds: (orders: BuildOrder[]) => void;
}) {
  const required = Math.abs(calc.diff);
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const toggleUnit = (territory: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(territory)) {
        next.delete(territory);
      } else if (next.size < required) {
        next.add(territory);
      }
      return next;
    });
  };

  const handleSubmit = () => {
    const orders: BuildOrder[] = Array.from(selected).map((territory) => ({
      type: "disband" as const,
      nation,
      territory,
    }));
    onSubmitBuilds(orders);
  };

  return (
    <div className="flex flex-col gap-3">
      <div
        style={{
          fontFamily: "var(--font-body)",
          fontSize: "var(--text-sm)",
          color: "var(--color-text-muted)",
          textAlign: "center",
          marginBottom: 8,
        }}
      >
        Wähle {required} {required === 1 ? "Einheit" : "Einheiten"} zum Auflösen:
      </div>

      {nationUnits.map((unit) => {
        const isSelected = selected.has(unit.territory);
        return (
          <button
            key={unit.id}
            onClick={() => toggleUnit(unit.territory)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              width: "100%",
              padding: "10px 14px",
              borderRadius: "var(--radius-md)",
              cursor: "pointer",
              transition: "all var(--duration-fast)",
              background: isSelected ? "rgba(204,0,0,0.2)" : "var(--color-navy-light)",
              border: isSelected ? "2px solid var(--color-danger)" : "1px solid var(--color-border-gold-subtle)",
              color: "var(--color-text-primary)",
              fontFamily: "var(--font-body)",
              fontSize: "var(--text-sm)",
              textAlign: "left",
            }}
          >
            <div
              className="w-6 h-6 rounded flex items-center justify-center shrink-0"
              style={{
                border: isSelected ? "2px solid var(--color-danger)" : "2px solid var(--color-text-muted)",
                background: isSelected ? "var(--color-danger)" : "transparent",
              }}
            >
              {isSelected && (
                <svg viewBox="0 0 16 16" fill="none" stroke="white" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" style={{ width: 12, height: 12 }}>
                  <polyline points="2 8 6 12 14 4" />
                </svg>
              )}
            </div>
            <span style={{ fontWeight: "var(--font-semibold)" }}>
              {unit.type === "army" ? "Armee" : "Flotte"} — {unit.territory.toUpperCase()}
            </span>
          </button>
        );
      })}

      <button
        onClick={handleSubmit}
        disabled={selected.size < required}
        style={{
          width: "100%",
          marginTop: 8,
          padding: "12px",
          borderRadius: "var(--radius-md)",
          fontFamily: "var(--font-body)",
          fontSize: "var(--text-md)",
          fontWeight: "var(--font-bold)",
          textTransform: "uppercase",
          letterSpacing: "0.05em",
          cursor: selected.size >= required ? "pointer" : "not-allowed",
          transition: "all var(--duration-fast)",
          background: selected.size >= required ? "rgba(204,0,0,0.85)" : "rgba(27,40,56,0.7)",
          border: selected.size >= required ? "2px solid var(--color-gold)" : "2px solid rgba(197,165,90,0.2)",
          color: selected.size >= required ? "var(--color-text-primary)" : "var(--color-text-muted)",
        }}
      >
        {selected.size}/{required} auflösen
      </button>
    </div>
  );
}
