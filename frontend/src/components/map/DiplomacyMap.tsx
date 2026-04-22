"use client";

import { useEffect, useRef, useState } from "react";
import { getAllStartingUnits } from "@/game-logic";
import type { Unit } from "@/game-logic";

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

// Nation color map (matches CSS variables in globals.css)
const NATION_COLORS: Record<string, string> = {
  england:         "#1560BD",
  france:          "#4169E1",
  germany:         "#555555",
  austria:         "#CC0000",
  "austria-hungary": "#CC0000",
  italy:           "#228B22",
  russia:          "#FFFFFF",
  turkey:          "#FFD700",
  osmanischesreich: "#FFD700",
  deutschesreich:  "#555555",
  großbritannien:  "#1560BD",
  österreichungarn: "#CC0000",
};

function getNationColor(nation: string): string {
  const key = nation.toLowerCase().replace(/[\s-]/g, "");
  return NATION_COLORS[key] ?? "#888888";
}

export function DiplomacyMap({
  selectedTerritory,
  onTerritoryClick,
}: {
  selectedTerritory: string | null;
  onTerritoryClick: (id: string) => void;
}) {
  const svgContainerRef = useRef<HTMLDivElement>(null);
  const [placements, setPlacements] = useState<Placements>({});
  const [units, setUnits] = useState<Unit[]>([]);
  const [svgContent, setSvgContent] = useState<string>("");
  const [svgViewBox, setSvgViewBox] = useState("0 0 1136 1037");

  // Load SVG + placements on mount
  useEffect(() => {
    fetch("/diplomacy-map.svg")
      .then((r) => r.text())
      .then((text) => {
        // Extract viewBox
        const vbMatch = text.match(/viewBox="([^"]+)"/);
        if (vbMatch) setSvgViewBox(vbMatch[1]);
        setSvgContent(text);
      });

    fetch("/placements.json")
      .then((r) => r.json())
      .then((data: Placements) => setPlacements(data));

    setUnits(getAllStartingUnits());
  }, []);

  // Wire territory click events after SVG is injected
  useEffect(() => {
    if (!svgContent || !svgContainerRef.current) return;

    const container = svgContainerRef.current;
    const paths = container.querySelectorAll<SVGElement>("[data-territory]");

    paths.forEach((el) => {
      const tid = el.getAttribute("data-territory");
      if (!tid) return;

      el.style.cursor = "pointer";

      const handler = () => onTerritoryClick(tid);
      el.addEventListener("click", handler);

      // highlight selected
      if (tid === selectedTerritory) {
        el.setAttribute("stroke", "var(--color-gold, #C5A55A)");
        el.setAttribute("stroke-width", "3");
      } else {
        el.removeAttribute("stroke");
        el.removeAttribute("stroke-width");
      }
    });

    return () => {
      paths.forEach((el) => {
        const tid = el.getAttribute("data-territory");
        if (!tid) return;
        el.replaceWith(el.cloneNode(true)); // remove listeners
      });
    };
  }, [svgContent, selectedTerritory, onTerritoryClick]);

  // Parse viewBox to get width/height for unit overlay
  const [, , vbW, vbH] = svgViewBox.split(" ").map(Number);

  return (
    <div className="relative w-full h-full">
      {/* SVG Map */}
      <div
        ref={svgContainerRef}
        className="w-full h-full"
        dangerouslySetInnerHTML={{ __html: svgContent }}
        style={{ lineHeight: 0 }}
      />

      {/* Units Overlay — absolute SVG that matches map viewBox */}
      {svgContent && (
        <svg
          className="absolute inset-0 w-full h-full pointer-events-none"
          viewBox={svgViewBox}
        >
          {units.map((unit) => {
            const placement = placements[unit.territory];
            if (!placement) return null;

            const anchorKey = unit.type === "army" ? "army" : "fleet";
            const anchor = placement.anchors[anchorKey];
            if (!anchor) return null;

            const color = getNationColor(unit.nation);
            const { x, y } = anchor;

            return (
              <g key={unit.id} transform={`translate(${x}, ${y})`}>
                {/* Drop shadow */}
                <circle r="12" fill="rgba(0,0,0,0.4)" cx="1" cy="1" />
                {unit.type === "army" ? (
                  <circle r="11" fill={color} stroke="#111" strokeWidth="1.5" />
                ) : (
                  <polygon
                    points="0,-11 10,9 -10,9"
                    fill={color}
                    stroke="#111"
                    strokeWidth="1.5"
                  />
                )}
                <text
                  textAnchor="middle"
                  dy="4"
                  fontSize="8"
                  fontWeight="bold"
                  fill={color === "#FFFFFF" ? "#000" : "#FFF"}
                  style={{ pointerEvents: "none" }}
                >
                  {unit.type === "army" ? "A" : "F"}
                </text>
              </g>
            );
          })}
        </svg>
      )}
    </div>
  );
}
