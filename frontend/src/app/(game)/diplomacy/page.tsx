/**
 * Diplomatie — Chat Screen (Platzhalter)
 * Hier wird später das Chat-System (F9) integriert.
 */
export default function DiplomacyPage() {
  return (
    <div className="flex flex-1 flex-col p-4 gap-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1
          style={{
            fontFamily: "var(--font-heading)",
            fontSize: "var(--text-xl)",
            fontWeight: "var(--font-bold)",
            letterSpacing: "0.05em",
            textTransform: "uppercase",
            color: "var(--color-text-primary)",
          }}
        >
          Diplomatie
        </h1>
        <button
          className="flex items-center justify-center rounded-full transition-all"
          style={{
            minWidth: "var(--touch-min)",
            minHeight: "var(--touch-min)",
            backgroundColor: "transparent",
            border: "2px solid rgba(197,165,90,0.4)",
            color: "var(--color-gold)",
          }}
          aria-label="Neuen Chat erstellen"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-5 h-5">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
        </button>
      </div>

      {/* Chat list placeholder */}
      <div className="flex flex-col gap-3">
        {["Frankreich", "Russland", "Dreier-Allianz"].map((name, i) => (
          <div
            key={i}
            className="flex items-center gap-3 p-4 rounded-lg cursor-pointer transition-all"
            style={{
              backgroundColor: "var(--color-navy-light)",
              border: "2px solid rgba(197,165,90,0.2)",
            }}
          >
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center"
              style={{
                backgroundColor: "rgba(197,165,90,0.15)",
                border: "2px solid rgba(197,165,90,0.3)",
              }}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-5 h-5" style={{ color: "var(--color-gold)" }}>
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
              </svg>
            </div>
            <div className="flex-1">
              <div
                style={{
                  fontFamily: "var(--font-body)",
                  fontSize: "var(--text-md)",
                  fontWeight: "var(--font-semibold)",
                  color: "var(--color-text-primary)",
                }}
              >
                {name}
              </div>
              <div
                style={{
                  fontFamily: "var(--font-body)",
                  fontSize: "var(--text-sm)",
                  color: "var(--color-text-muted)",
                }}
              >
                Wartet auf F9 (Chat-System)
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
