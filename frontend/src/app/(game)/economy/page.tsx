/**
 * Wirtschaft — Economy Panel (Platzhalter)
 * Hier wird später das Wirtschafts-Panel (F11) integriert.
 */
export default function EconomyPage() {
  return (
    <div className="flex flex-1 flex-col p-4 gap-4">
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
        Wirtschaft
      </h1>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 gap-3">
        {[
          { label: "Credits", value: "— CR", icon: "💰" },
          { label: "Versorgungszentren", value: "—/18", icon: "⭐" },
          { label: "Energie", value: "—", icon: "⚡" },
          { label: "Lizenzen", value: "—", icon: "🔑" },
        ].map((stat, i) => (
          <div
            key={i}
            className="flex flex-col gap-1 p-4 rounded-lg"
            style={{
              backgroundColor: "var(--color-navy-light)",
              border: "2px solid rgba(197,165,90,0.2)",
            }}
          >
            <div className="flex items-center gap-2">
              <span className="text-lg">{stat.icon}</span>
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
                {stat.label}
              </span>
            </div>
            <span
              style={{
                fontFamily: "var(--font-body)",
                fontSize: "var(--text-2xl)",
                fontWeight: "var(--font-bold)",
                fontVariantNumeric: "tabular-nums",
                color: "var(--color-text-primary)",
              }}
            >
              {stat.value}
            </span>
          </div>
        ))}
      </div>

      {/* Verträge Section */}
      <div>
        <div
          className="mb-3"
          style={{
            fontFamily: "var(--font-body)",
            fontSize: "var(--text-sm)",
            fontWeight: "var(--font-semibold)",
            letterSpacing: "0.05em",
            textTransform: "uppercase",
            color: "var(--color-gold)",
          }}
        >
          Verträge
        </div>
        <div
          className="flex items-center justify-center p-8 rounded-lg"
          style={{
            backgroundColor: "var(--color-navy-light)",
            border: "2px dashed rgba(197,165,90,0.2)",
          }}
        >
          <span
            style={{
              fontFamily: "var(--font-body)",
              fontSize: "var(--text-sm)",
              color: "var(--color-text-muted)",
            }}
          >
            Wartet auf F11 (Wirtschafts-Panel) + E1-E4
          </span>
        </div>
      </div>
    </div>
  );
}
