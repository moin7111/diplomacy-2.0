/**
 * Auth Layout
 * Zentriertes Layout für Login, Register etc.
 */
export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center p-4 bg-[#1B2838]">
      <div className="w-full max-w-md flex flex-col gap-8">
        {/* App Logo / Titel */}
        <div className="text-center flex flex-col gap-2">
          <h1
            style={{
              fontFamily: "var(--font-heading)",
              fontSize: "var(--text-3xl)",
              fontWeight: "var(--font-bold)",
              letterSpacing: "0.05em",
              color: "var(--color-gold)",
              textShadow: "0 0 12px rgba(197, 165, 90, 0.5)",
            }}
          >
            DIPLOMACY 2.0
          </h1>
          <p
            style={{
              fontFamily: "var(--font-body)",
              fontSize: "var(--text-sm)",
              color: "var(--color-text-muted)",
              letterSpacing: "0.1em",
              textTransform: "uppercase",
            }}
          >
            Hybride Kriegsführung erwartet Sie
          </p>
        </div>

        {/* Kontent-Container (Card) */}
        <div
          className="p-6 md:p-8 rounded-lg"
          style={{
            backgroundColor: "rgba(17, 28, 39, 0.95)",
            border: "2px solid rgba(197, 165, 90, 0.4)",
            boxShadow: "0 8px 32px rgba(0, 0, 0, 0.7)",
          }}
        >
          {children}
        </div>
      </div>
    </div>
  );
}
