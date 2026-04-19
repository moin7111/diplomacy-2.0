"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/useAuthStore";
import { api } from "@/lib/api";

const NATIONS = [
  { id: "GB", label: "Großbritannien", color: "var(--color-nation-gb)" },
  { id: "DE", label: "Deutschland", color: "var(--color-nation-de)" },
  { id: "AT", label: "Österreich", color: "var(--color-nation-at)" },
  { id: "FR", label: "Frankreich", color: "var(--color-nation-fr)" },
  { id: "IT", label: "Italien", color: "var(--color-nation-it)" },
  { id: "RU", label: "Russland", color: "var(--color-nation-ru)" },
  { id: "TR", label: "Türkei", color: "var(--color-nation-tr)" },
];

export default function LobbyPage() {
  const { gameId } = useParams();
  const router = useRouter();
  const { user } = useAuthStore();
  
  const [lobby, setLobby] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchLobby = async () => {
      try {
        const data = await api.games.getLobby(gameId as string);
        setLobby(data);
      } catch (err: any) {
        setError("Lobby konnte nicht geladen werden.");
      } finally {
        setLoading(false);
      }
    };
    fetchLobby();
  }, [gameId]);

  const handleCopyCode = () => {
    if (lobby?.roomCode) {
      navigator.clipboard.writeText(lobby.roomCode);
      alert("Raumcode kopiert!"); // Todo: Replace with Toast later
    }
  };

  const toggleReady = async () => {
    if (!lobby) return;
    try {
      await api.games.toggleReady(gameId as string);
      setLobby((prev: any) => ({
        ...prev,
        players: prev.players.map((p: any) =>
          p.id === user?.id ? { ...p, isReady: !p.isReady } : p
        ),
      }));
    } catch (e: any) {
      alert("Fehler beim Statuswechsel: " + e.message);
    }
  };

  const changeNation = async (newNation: string | null) => {
    if (!lobby || !newNation) return;
    try {
      await api.games.chooseNation(gameId as string, newNation);
      setLobby((prev: any) => ({
        ...prev,
        players: prev.players.map((p: any) =>
          p.id === user?.id ? { ...p, nation: newNation } : p
        ),
      }));
    } catch (e: any) {
      alert("Fehler bei Nationenwahl: " + e.message);
    }
  };

  if (loading) {
    return <div className="h-dvh flex items-center justify-center bg-[var(--color-navy)]"><span className="text-[var(--color-gold)] font-bold">Laden...</span></div>;
  }

  if (error || !lobby) {
    return <div className="p-8 text-white"><p>{error}</p><button onClick={()=>router.push("/")}>Zurück</button></div>;
  }

  const isHost = lobby.hostId === user?.id;
  // Hier vereinfacht: Alle die da sind müssen Ready sein, MVP-Logik.
  const allReady = lobby.players.every((p: any) => p.isReady && p.nation !== null);
  const me = lobby.players.find((p: any) => p.id === (user?.id || "u1")); // fallback falls mock ids anders sind

  const emptySlots = Math.max(0, 7 - lobby.players.length);

  return (
    <div className="min-h-dvh flex flex-col bg-[var(--color-navy)] pb-8">
      {/* Header */}
      <header className="p-4 bg-[#111C27] flex justify-between items-center border-b-2 border-[var(--color-gold-dark)] sticky top-0 z-10 pt-[env(safe-area-inset-top,0px)]">
        <button onClick={() => router.push("/")} className="text-[#8A9BAE]">Zurück</button>
        <h1 className="font-heading font-bold uppercase tracking-wider text-[var(--color-gold)]">{lobby.name}</h1>
        <div className="w-[50px]"></div> {/* Spacer spacing */}
      </header>

      {/* Raumcode Banner */}
      <div className="bg-[var(--color-bordeaux)] text-white p-4 flex justify-between items-center mx-4 mt-6 rounded shadow-[var(--shadow-btn-raised)]">
        <div>
          <p className="text-xs font-bold uppercase tracking-widest opacity-80 mb-1">Raumcode (Einladung)</p>
          <p className="font-mono text-3xl font-bold tracking-widest">{lobby.roomCode}</p>
        </div>
        <button 
          onClick={handleCopyCode}
          className="bg-white/20 p-3 rounded-full hover:bg-white/30 transition shadow-sm"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-6 h-6">
            <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
          </svg>
        </button>
      </div>

      {/* Spielerliste */}
      <div className="mx-4 mt-6 flex-1 flex flex-col gap-3">
        <h3 className="text-[var(--color-gold)] font-bold uppercase tracking-wider text-sm mb-1 px-1">
          Kommandeure ({lobby.players.length}/7)
        </h3>

        {lobby.players.map((p: any) => {
          const isMe = p.id === user?.id; // im Mock: passend machen für Demo (u1 als isMe logisch treaten, ich lass das checken falls my id != u1 ist halt read-only)
          const editable = p.id === (user?.id || "u1");
          const hasNation = p.nation !== null;

          return (
            <div key={p.id} className="bg-[var(--color-navy-light)] border border-[rgba(197,165,90,0.2)] rounded p-3 flex flex-col gap-2 relative">
               {hasNation && (
                 <div className="absolute top-0 right-0 bottom-0 w-[4px]" style={{ backgroundColor: `var(--color-nation-${p.nation.toLowerCase()})` }}></div>
               )}
               <div className="flex justify-between items-center">
                 <div className="flex items-center gap-2">
                   <div className="w-8 h-8 rounded bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.1)] flex items-center justify-center font-bold text-white text-sm">
                     {p.username.charAt(0)}
                   </div>
                   <span className="font-bold text-white">{p.username} {editable && "(Du)"}</span>
                 </div>
                 {/* Status Flag */}
                 <span className={`text-xs px-2 py-1 uppercase tracking-wider font-bold rounded ${p.isReady ? 'bg-[var(--color-success)] text-white' : 'bg-transparent text-[#8A9BAE] border border-[#8A9BAE]'}`}>
                   {p.isReady ? 'Einsatzbereit' : 'Rüstet'}
                 </span>
               </div>

               {/* Nation Selector / Display */}
               <div className="mt-1 flex items-center bg-[var(--color-navy-dark)] rounded p-1 pr-3">
                 <div className="flex-1 flex gap-1 items-center px-2 py-1">
                 {editable && !p.isReady ? (
                   <select 
                     value={p.nation || ""} 
                     onChange={(e) => changeNation(e.target.value || null)}
                     className="bg-transparent text-white font-mono text-sm w-full outline-none appearance-none cursor-pointer"
                   >
                     <option value="" className="text-black">-- Nation wählen --</option>
                     {NATIONS.map(n => <option key={n.id} value={n.id} className="text-black">{n.id} - {n.label}</option>)}
                   </select>
                 ) : (
                   <span className="font-mono text-sm text-[var(--color-gold)] font-bold">
                     {p.nation ? `${p.nation}` : "Nation unbestimmt"}
                   </span>
                 )}
                 </div>
                 {editable && !p.isReady && (
                   <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4 text-[#8A9BAE]"><polyline points="6 9 12 15 18 9"></polyline></svg>
                 )}
               </div>
            </div>
          );
        })}

        {/* Empty Slots */}
        {Array.from({ length: emptySlots }).map((_, i) => (
          <div key={`empty-${i}`} className="border-2 border-dashed border-[rgba(255,255,255,0.1)] rounded p-4 flex flex-col items-center justify-center text-[#8A9BAE] opacity-50 bg-[rgba(0,0,0,0.2)]">
            <p className="font-bold uppercase text-xs tracking-wider">Offener Posten</p>
          </div>
        ))}
      </div>

      {/* Footer Controls */}
      <div className="mx-4 mt-8 flex flex-col gap-3">
        <button
          onClick={toggleReady}
          className="py-3 rounded font-bold uppercase tracking-wider border-2"
          style={{
            borderColor: me?.isReady ? "transparent" : "var(--color-gold)",
            color: me?.isReady ? "#1B2838" : "var(--color-gold)",
            backgroundColor: me?.isReady ? "var(--color-gold)" : "transparent",
            boxShadow: me?.isReady ? "0 0 15px rgba(197, 165, 90, 0.4)" : "none"
          }}
        >
          {me?.isReady ? "Status: Bereit" : "Einsatzbereitschaft melden"}
        </button>

        {isHost && (
          <button
            disabled={!allReady}
            onClick={async () => {
              try {
                await api.games.startGame(gameId as string);
                router.push("/map");
              } catch (e: any) {
                alert("Fehler beim Starten: " + e.message);
              }
            }}
            className="py-4 rounded font-heading font-bold uppercase tracking-widest text-[#1B2838] transition-all disabled:opacity-30 disabled:grayscale"
            style={{
              backgroundColor: "var(--color-success)",
              boxShadow: "var(--shadow-btn-raised)",
            }}
          >
            Mission Starten
          </button>
        )}
      </div>

    </div>
  );
}
