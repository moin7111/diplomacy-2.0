/**
 * Einstellungen — Settings Screen (Platzhalter)
 */
export default function SettingsPage() {
  return (
    <div className="flex flex-1 flex-col p-4 gap-6">
      {/* Header */}
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
        Einstellungen
      </h1>

      {/* Settings Groups */}
      {[
        {
          title: "Spielprofil",
          items: ["Spielername ändern", "Avatar wählen"],
        },
        {
          title: "Audio",
          items: ["Musik", "Soundeffekte", "Vibrationen"],
        },
        {
          title: "Benachrichtigungen",
          items: ["Push-Nachrichten", "Zug-Erinnerungen"],
        },
        {
          title: "Info",
          items: ["Tutorial", "Spielregeln", "Über Diplomacy 2.0"],
        },
      ].map((group, gi) => (
        <div key={gi} className="flex flex-col gap-2">
          <span
            style={{
              fontFamily: "var(--font-body)",
              fontSize: "var(--text-sm)",
              fontWeight: "var(--font-semibold)",
              letterSpacing: "0.05em",
              textTransform: "uppercase",
              color: "var(--color-gold)",
            }}
          >
            {group.title}
          </span>
          <div
            className="flex flex-col rounded-lg overflow-hidden"
            style={{
              backgroundColor: "var(--color-navy-light)",
              border: "2px solid rgba(197,165,90,0.2)",
            }}
          >
            {group.items.map((item, ii) => (
              <button
                key={ii}
                className="flex items-center justify-between px-4 text-left transition-colors hover:bg-[rgba(197,165,90,0.05)]"
                style={{
                  minHeight: "var(--touch-min)",
                  fontFamily: "var(--font-body)",
                  fontSize: "var(--text-md)",
                  color: "var(--color-text-primary)",
                  borderBottom: ii < group.items.length - 1
                    ? "1px solid rgba(197,165,90,0.1)"
                    : "none",
                }}
              >
                <span>{item}</span>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 opacity-30">
                  <polyline points="9 18 15 12 9 6" />
                </svg>
              </button>
            ))}
          </div>
        </div>
      ))}

      {/* Version info */}
      <div
        className="text-center mt-4"
        style={{
          fontFamily: "var(--font-body)",
          fontSize: "var(--text-xs)",
          color: "var(--color-text-muted)",
        }}
      >
        Diplomacy 2.0 — v0.1.0 (MVP)
      </div>
    </div>
  );
}
