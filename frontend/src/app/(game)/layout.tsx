import { BottomNav } from "@/components/layout/BottomNav";
import { TopBar } from "@/components/layout/TopBar";

/**
 * Game Layout — App Shell für alle In-Game Screens
 * TopBar (oben) + Content (mitte) + BottomNav (unten)
 */
export default function GameLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col h-dvh">
      {/* Obere Info-Leiste */}
      <TopBar />

      {/* Hauptinhalt — scrollbar, nimmt den restlichen Platz */}
      <main
        className="flex-1 overflow-y-auto"
        style={{
          paddingBottom: "calc(var(--nav-height) + env(safe-area-inset-bottom, 0px))",
        }}
      >
        {children}
      </main>

      {/* Untere Navigation */}
      <BottomNav />
    </div>
  );
}
