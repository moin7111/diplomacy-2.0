"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/useAuthStore";
import { api } from "@/lib/api";

/**
 * Home Screen (F3)
 */
export default function HomePage() {
  const { user, logout } = useAuthStore();
  const router = useRouter();
  
  const [joinCode, setJoinCode] = useState("");
  const [isJoining, setIsJoining] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState("");

  const handleCreateGame = async () => {
    setIsCreating(true);
    try {
      const res = await api.games.createGame("Neues Spiel", true);
      router.push(`/lobby/${res.gameId}`);
    } catch (err: any) {
      setError("Fehler beim Erstellen.");
    } finally {
      setIsCreating(false);
    }
  };

  const handleJoinGame = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!joinCode) return;
    setIsJoining(true);
    setError("");
    try {
      const res = await api.games.joinGame(joinCode.toUpperCase());
      router.push(`/lobby/${res.gameId}`);
    } catch (err: any) {
      setError(err.message || "Fehler beim Beitreten.");
    } finally {
      setIsJoining(false);
    }
  };

  // Mock-Liste der aktiven Spiele
  const activeGames = [
    { id: "g1", name: "Weltkrieg Simulation", nation: "DE", round: "Herbst 1902", status: "Deine Runde" },
    { id: "g2", name: "Bündnis der Tapferen", nation: "GB", round: "Frühling 1901", status: "Warten auf Andere" },
  ];

  return (
    <div className="min-h-dvh flex flex-col bg-[var(--color-navy)]">
      {/* Header */}
      <header className="p-4 flex items-center justify-between border-b-2 border-[var(--color-wood)] bg-[#111C27]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full border-2 border-[var(--color-gold)] flex items-center justify-center bg-[var(--color-navy)] text-[var(--color-gold)] font-bold">
            {user?.username?.charAt(0).toUpperCase() || "?"}
          </div>
          <div>
            <h2 className="text-white font-bold text-sm">{user?.username || "Commander"}</h2>
            <p className="text-[var(--color-gold)] text-xs uppercase cursor-pointer" onClick={logout}>Abmelden</p>
          </div>
        </div>
        <button className="text-[var(--color-gold)]" onClick={() => router.push("/settings")}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-6 h-6">
            <circle cx="12" cy="12" r="3" />
            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
          </svg>
        </button>
      </header>

      <main className="flex-1 p-4 flex flex-col gap-8 overflow-y-auto max-w-lg mx-auto w-full">
        {/* CTAs */}
        <div className="flex flex-col gap-4 mt-4">
          <button
            onClick={handleCreateGame}
            disabled={isCreating}
            className="w-full py-4 rounded font-heading font-bold uppercase tracking-wider text-white disabled:opacity-50"
            style={{
              backgroundColor: "var(--color-bordeaux)",
              boxShadow: "var(--shadow-btn-raised)",
              border: "1px solid var(--color-bordeaux-light)"
            }}
          >
            {isCreating ? "Wird initialisiert..." : "Neues Spiel erstellen"}
          </button>

          <form onSubmit={handleJoinGame} className="flex gap-2">
            <input
              type="text"
              placeholder="Raumcode"
              maxLength={6}
              value={joinCode}
              onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
              className="flex-1 px-4 py-3 bg-[var(--color-navy-dark)] border-2 border-[var(--color-wood)] text-white font-mono uppercase focus:outline-none focus:border-[var(--color-gold)] rounded text-center font-bold tracking-widest"
            />
            <button
              type="submit"
              disabled={isJoining || joinCode.length < 3}
              className="px-6 py-3 rounded font-bold uppercase tracking-wider text-[#1B2838] disabled:opacity-50"
              style={{
                backgroundColor: "var(--color-success)",
                color: "white",
                boxShadow: "var(--shadow-btn-raised)",
              }}
            >
              Beitreten
            </button>
          </form>
          {error && <p className="text-[var(--color-danger-light)] text-sm text-center font-semibold">{error}</p>}
        </div>

        <div className="w-full h-[1px] bg-[rgba(197,165,90,0.2)]"></div>

        {/* Listen-Bereich */}
        <div className="flex flex-col gap-3">
          <h3 className="font-heading text-[var(--color-gold)] text-lg uppercase tracking-wider font-bold mb-1">
            Meine Aktiven Missionen
          </h3>
          
          {activeGames.map((game) => (
            <div
              key={game.id}
              onClick={() => router.push("/map")}
              className="bg-[var(--color-navy-light)] border border-[var(--color-wood-light)] p-4 rounded cursor-pointer relative overflow-hidden transition-all hover:border-[var(--color-gold-dark)] hover:shadow-lg"
              style={{ boxShadow: "var(--shadow-base)" }}
            >
              {/* Nation Color Strip */}
              <div
                className="absolute left-0 top-0 bottom-0 w-1.5"
                style={{ backgroundColor: `var(--color-nation-${game.nation.toLowerCase()})` }}
              ></div>
              
              <div className="flex justify-between items-start mb-2 pl-2">
                <h4 className="font-bold text-white text-lg">{game.name}</h4>
                <div className="bg-[var(--color-navy-dark)] text-[var(--color-gold)] px-2 py-1 rounded text-xs font-bold font-mono">
                  {game.nation}
                </div>
              </div>
              
              <div className="flex justify-between items-end pl-2">
                <p className="text-sm text-[var(--color-text-muted)]">{game.round}</p>
                <div className="flex items-center gap-1.5">
                  <span className={`w-2 h-2 rounded-full ${game.status.includes('Deine') ? 'bg-[var(--color-gold)] animate-pulse' : 'bg-[var(--color-text-muted)]'}`}></span>
                  <span className={`text-xs font-semibold uppercase ${game.status.includes('Deine') ? 'text-[var(--color-gold)]' : 'text-[var(--color-text-muted)]'}`}>
                    {game.status}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
