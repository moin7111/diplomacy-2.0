"use client";

import type { Order, Unit } from "@/game-logic";

interface Anchor {
  x: number;
  y: number;
}
interface PlacementEntry {
  anchors: {
    army?: Anchor;
    fleet?: Anchor;
    sf?: Anchor;
    air?: Anchor;
  };
}
type Placements = Record<string, PlacementEntry>;

function getAnchor(
  territory: string,
  preferType: "army" | "fleet" | null,
  placements: Placements
): Anchor | null {
  const p = placements[territory];
  if (!p) return null;
  if (preferType === "army") return p.anchors.army ?? p.anchors.fleet ?? null;
  if (preferType === "fleet") return p.anchors.fleet ?? p.anchors.army ?? null;
  return p.anchors.army ?? p.anchors.fleet ?? null;
}

function shortenLine(
  x1: number, y1: number,
  x2: number, y2: number,
  shrinkEnd: number
): { x2: number; y2: number } {
  const dx = x2 - x1;
  const dy = y2 - y1;
  const len = Math.sqrt(dx * dx + dy * dy);
  if (len < 1) return { x2, y2 };
  return {
    x2: x2 - (dx / len) * shrinkEnd,
    y2: y2 - (dy / len) * shrinkEnd,
  };
}

interface Props {
  orders: Order[];
  units: Unit[];
  placements: Placements;
  viewBox: string;
}

export function OrderOverlay({ orders, units, placements, viewBox }: Props) {
  return (
    <svg
      className="absolute inset-0 w-full h-full pointer-events-none"
      viewBox={viewBox}
      style={{ zIndex: 10 }}
    >
      <defs>
        <marker
          id="arrow-gold"
          markerWidth="7"
          markerHeight="5"
          refX="6"
          refY="2.5"
          orient="auto"
        >
          <polygon points="0 0, 7 2.5, 0 5" fill="#C5A55A" />
        </marker>
        <marker
          id="arrow-blue"
          markerWidth="7"
          markerHeight="5"
          refX="6"
          refY="2.5"
          orient="auto"
        >
          <polygon points="0 0, 7 2.5, 0 5" fill="#4A7FA5" />
        </marker>
        <marker
          id="arrow-green"
          markerWidth="7"
          markerHeight="5"
          refX="6"
          refY="2.5"
          orient="auto"
        >
          <polygon points="0 0, 7 2.5, 0 5" fill="#3D6B20" />
        </marker>
      </defs>

      {orders.map((order) => {
        const unit = units.find((u) => u.territory === order.unit);
        if (!unit) return null;
        const from = getAnchor(unit.territory, unit.type, placements);
        if (!from) return null;

        switch (order.type) {
          case "hold":
            return (
              <circle
                key={`ord-${order.unit}`}
                cx={from.x}
                cy={from.y}
                r={18}
                fill="none"
                stroke="#C5A55A"
                strokeWidth={2.5}
                strokeDasharray="5 3"
                opacity={0.9}
              />
            );

          case "move": {
            if (!order.target) return null;
            const toUnit = units.find((u) => u.territory === order.target);
            const toAnchor = getAnchor(order.target, toUnit?.type ?? null, placements);
            if (!toAnchor) return null;
            const { x2, y2 } = shortenLine(from.x, from.y, toAnchor.x, toAnchor.y, 16);
            return (
              <line
                key={`ord-${order.unit}`}
                x1={from.x}
                y1={from.y}
                x2={x2}
                y2={y2}
                stroke="#C5A55A"
                strokeWidth={2.5}
                markerEnd="url(#arrow-gold)"
                opacity={0.95}
              />
            );
          }

          case "support": {
            const targetTerr = order.supportDestination ?? order.supportTarget;
            if (!targetTerr) return null;
            const toUnit = units.find((u) => u.territory === targetTerr);
            const toAnchor = getAnchor(targetTerr, toUnit?.type ?? null, placements);
            if (!toAnchor) return null;
            const { x2, y2 } = shortenLine(from.x, from.y, toAnchor.x, toAnchor.y, 14);
            return (
              <line
                key={`ord-${order.unit}`}
                x1={from.x}
                y1={from.y}
                x2={x2}
                y2={y2}
                stroke="#4A7FA5"
                strokeWidth={2}
                strokeDasharray="9 5"
                markerEnd="url(#arrow-blue)"
                opacity={0.9}
              />
            );
          }

          case "convoy": {
            if (!order.convoyFrom || !order.convoyTo) return null;
            const fromUnit = units.find((u) => u.territory === order.convoyFrom);
            const toUnit = units.find((u) => u.territory === order.convoyTo);
            const cFrom = getAnchor(order.convoyFrom, fromUnit?.type ?? null, placements);
            const cTo = getAnchor(order.convoyTo, toUnit?.type ?? null, placements);
            if (!cFrom || !cTo) return null;
            const { x2: ex2, y2: ey2 } = shortenLine(cFrom.x, cFrom.y, cTo.x, cTo.y, 16);
            return (
              <g key={`ord-${order.unit}`}>
                {/* Fleet symbol at fleet position */}
                <circle
                  cx={from.x}
                  cy={from.y}
                  r={14}
                  fill="none"
                  stroke="#3D6B20"
                  strokeWidth={2}
                  strokeDasharray="3 3"
                  opacity={0.8}
                />
                {/* Convoy path arrow */}
                <line
                  x1={cFrom.x}
                  y1={cFrom.y}
                  x2={ex2}
                  y2={ey2}
                  stroke="#3D6B20"
                  strokeWidth={2}
                  strokeDasharray="6 4"
                  markerEnd="url(#arrow-green)"
                  opacity={0.85}
                />
              </g>
            );
          }

          default:
            return null;
        }
      })}
    </svg>
  );
}
