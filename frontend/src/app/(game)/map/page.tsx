/**
 * Karte — Map Screen (Platzhalter)
 * Hier wird später der Karten-Renderer (F5, Pixi.js) integriert.
 */
export default function MapPage() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center p-4 gap-4">
      {/* Karten-Platzhalter */}
      <div
        className="w-full max-w-2xl aspect-[4/3] rounded-lg flex items-center justify-center"
        style={{
          border: "4px solid #5C3A21",
          background: "linear-gradient(to bottom, #7A4E2D 0%, #5C3A21 30%, #3E2510 100%)",
          boxShadow: "inset 0 1px 0 #7A4E2D, inset 0 -1px 0 #3E2510, 0 8px 32px rgba(0,0,0,0.7)",
        }}
      >
        <div
          className="w-[95%] h-[90%] rounded flex flex-col items-center justify-center gap-3"
          style={{
            backgroundColor: "#4A7FA5",
            border: "2px solid rgba(197,165,90,0.3)",
          }}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-12 h-12 opacity-40">
            <polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6" />
            <line x1="8" y1="2" x2="8" y2="18" />
            <line x1="16" y1="6" x2="16" y2="22" />
          </svg>
          <span
            style={{
              fontFamily: "var(--font-heading)",
              fontSize: "var(--text-lg)",
              fontWeight: "var(--font-semibold)",
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              color: "var(--color-text-primary)",
              opacity: 0.5,
            }}
          >
            Europa-Karte
          </span>
          <span
            style={{
              fontFamily: "var(--font-body)",
              fontSize: "var(--text-sm)",
              color: "var(--color-text-muted)",
            }}
          >
            Wartet auf D3 (SVG) + F5 (Renderer)
          </span>
        </div>
      </div>
    </div>
  );
}
