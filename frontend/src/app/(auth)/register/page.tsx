"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { useAuthStore } from "@/stores/useAuthStore";

export default function RegisterPage() {
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  
  const login = useAuthStore((state) => state.login);
  const router = useRouter();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !username || !password || !confirmPassword) {
      setError("Bitte füllen Sie alle Felder aus.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwörter stimmen nicht überein.");
      return;
    }
    
    setIsLoading(true);
    setError("");

    try {
      const res = await api.auth.register(email, username, password);
      login(res.token, res.user);
      router.push("/"); // Zum Home-Screen redirecten
    } catch (err: any) {
      setError(err.message || "Registrierung fehlgeschlagen.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <h2
        className="text-center font-heading"
        style={{ fontSize: "var(--text-xl)", color: "var(--color-text-primary)" }}
      >
        Registrierung
      </h2>

      {error && (
        <div className="p-3 text-sm text-center rounded bg-[#6b0000] text-white border border-[#A50000]">
          {error}
        </div>
      )}

      <form onSubmit={handleRegister} className="flex flex-col gap-4">
        
        <div className="flex flex-col gap-1">
          <label className="text-sm text-[var(--color-gold)] font-semibold uppercase tracking-wider">
            Rufname (Username)
          </label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full px-4 py-3 bg-[#111C27] border-2 border-[rgba(197,165,90,0.3)] text-white focus:outline-none focus:border-[var(--color-gold)] transition-colors rounded"
            placeholder="z.B. CommanderZero"
          />
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-sm text-[var(--color-gold)] font-semibold uppercase tracking-wider">
            E-Mail Adresse
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-3 bg-[#111C27] border-2 border-[rgba(197,165,90,0.3)] text-white focus:outline-none focus:border-[var(--color-gold)] transition-colors rounded"
            placeholder="Ihre E-Mail"
          />
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-sm text-[var(--color-gold)] font-semibold uppercase tracking-wider">
            Passwort
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-3 bg-[#111C27] border-2 border-[rgba(197,165,90,0.3)] text-white focus:outline-none focus:border-[var(--color-gold)] transition-colors rounded"
            placeholder="••••••••"
          />
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-sm text-[var(--color-gold)] font-semibold uppercase tracking-wider">
            Passwort bestätigen
          </label>
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="w-full px-4 py-3 bg-[#111C27] border-2 border-[rgba(197,165,90,0.3)] text-white focus:outline-none focus:border-[var(--color-gold)] transition-colors rounded"
            placeholder="••••••••"
          />
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="mt-4 py-3 px-6 w-full text-center font-heading font-bold tracking-wider text-[#1B2838] transition-all rounded disabled:opacity-50"
          style={{
            backgroundColor: "var(--color-gold)",
            boxShadow: "var(--shadow-btn-raised)",
          }}
        >
          {isLoading ? "Wird geprüft..." : "REKRUTIEREN"}
        </button>
      </form>

      <div className="text-center mt-2">
        <Link href="/login" className="text-sm text-[#8A9BAE] hover:text-[var(--color-gold)] transition-colors">
          Bereits stationiert? Zum Login.
        </Link>
      </div>
    </div>
  );
}
