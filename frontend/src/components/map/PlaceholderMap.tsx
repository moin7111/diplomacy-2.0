import { territories, getAllStartingUnits } from "@/game-logic";

export function PlaceholderMap({
  onTerritoryClick,
  selectedTerritory
}: {
  onTerritoryClick: (id: string) => void;
  selectedTerritory: string | null;
}) {
  const units = getAllStartingUnits();

  return (
    <svg 
      viewBox="0 0 1000 800" 
      className="w-full h-full"
      style={{
        background: "linear-gradient(to bottom, #7A4E2D 0%, #5C3A21 30%, #3E2510 100%)",
        border: "2px solid rgba(197,165,90,0.3)",
      }}
    >
      <rect width="1000" height="800" fill="#4A7FA5" opacity="0.8" />
      {territories.map((t, i) => {
        // Simple grid layout for placeholder
        const x = (i % 10) * 100 + 50;
        const y = Math.floor(i / 10) * 100 + 50;
        // See if there's a starting unit here
        const unit = units.find(u => u.territory === t.id);
        const isSelected = selectedTerritory === t.id;

        return (
          <g 
            key={t.id} 
            transform={`translate(${x}, ${y})`} 
            onClick={() => onTerritoryClick(t.id)}
            className="cursor-pointer transition-all hover:opacity-80"
          >
            {/* Territory Base Shape */}
            <circle 
              r="40" 
              fill={t.type === "sea" ? "#2B5278" : (t.isSupplyCenter ? "#8C7152" : "#A69279")} 
              stroke={isSelected ? "var(--color-gold)" : "rgba(255,255,255,0.2)"}
              strokeWidth={isSelected ? 4 : 2}
            />
            {/* Content overlay */}
            <text y="-10" textAnchor="middle" fill="white" fontSize="14" fontWeight="bold">
              {t.id.toUpperCase()}
            </text>
            <text y="5" textAnchor="middle" fill="rgba(255,255,255,0.7)" fontSize="10">
              {t.name}
            </text>

            {/* Units Rendering (A=Army, F=Fleet) */}
            {unit && (
              <g transform="translate(0, 22)">
                <circle r="14" fill="#1B2838" /> {/* Shadow/Bg block */}
                {unit.type === 'army' ? (
                  <circle 
                    r="10" 
                    fill={`var(--color-nation-${unit.nation.toLowerCase().replace(/ /g, "")})`} 
                    stroke="#111" 
                    strokeWidth="2" 
                  />
                ) : (
                  <polygon 
                    points="-10,10 10,10 0,-10" 
                    fill={`var(--color-nation-${unit.nation.toLowerCase().replace(/ /g, "")})`} 
                    stroke="#111" 
                    strokeWidth="2" 
                  />
                )}
                {/* Visual Nation Label instead of real SVG icons for now */}
                <text y="3" textAnchor="middle" fill="white" fontSize="8" fontWeight="bold">
                  {unit.nation.slice(0, 2).toUpperCase()}
                </text>
              </g>
            )}
          </g>
        )
      })}
    </svg>
  );
}
