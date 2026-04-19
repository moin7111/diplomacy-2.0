# F1: Web-App-Grundgerüst & Navigation (Frontend)
**Datum:** 08. April 2026
**Team:** Frontend-Team (F1)

## Abgeschlossene Aufgaben

Im Rahmen dieses Pakets wurde das Next.js Frontend-Projekt "Diplomacy 2.0" initialisiert und die App-Shell mit Navigation aufgebaut.

### 1. Next.js Projektsetup
- [x] Next.js 16.2 mit TypeScript und App Router im Ordner `frontend/` erstellt
- [x] Tailwind CSS v4 konfiguriert mit allen D1 Design System Tokens
- [x] ESLint eingerichtet
- [x] `src/` Verzeichnisstruktur mit `@/` Import-Alias

### 2. Design System Integration (D1)
- [x] Alle Farben aus D1 als Tailwind v4 `@theme` Tokens integriert (Navy, Bordeaux, Gold, Paper, Wood, Nations, Semantic)
- [x] Google Fonts: Cinzel (Headings), Inter (Body), JetBrains Mono (Timer/Codes) via `next/font/google`
- [x] CSS Custom Properties aus `variables.css` übernommen (Spacing, Radius, Borders, Shadows, Durations, Easing, Z-Index)
- [x] Keyframe-Animationen: timer-pulse, gold-glow-pulse, invalid-blink, glitch, fade-in, slide-up
- [x] Accessibility: Fokus-Ring (Gold), `prefers-reduced-motion`, `.sr-only`

### 3. PWA-Konfiguration
- [x] `manifest.json` mit Name, Icons-Platzhalter, Standalone-Display, Navy-Theme-Color
- [x] Service Worker Grundgerüst (`sw.js`) mit Network-First Caching
- [x] SW Registration als Client Component
- [x] Viewport mit `viewport-fit=cover` und `user-scalable=false` für Mobile Safari
- [x] Apple Web App Meta-Tags (capable, black-translucent, title)

### 4. App Shell & Navigation
- [x] **BottomNav**: 4 Tabs (Karte, Diplomatie, Wirtschaft, Einstellungen)
  - Holz-Gradient Hintergrund per D1 Style Guide
  - Gold-Dark (inaktiv) → Gold-Shine (aktiv) + Glow-Filter
  - Inline SVG Icons (currentColor)
  - 44px+ Touch Targets, safe-area-inset Padding
  - Active-Tab Detection via `usePathname()`
- [x] **TopBar**: 56px Höhe, Navy-Dark Background, Gold Border
  - Exit-Button (links), Phase-Label in Cinzel (mitte), Timer in JetBrains Mono (rechts)
  - Timer-Warnung: Pulsiert in Warning-Farbe unter 60s
- [x] **Game Layout**: TopBar + scrollbarer Content + BottomNav mit `h-dvh`

### 5. Zustand State Management
- [x] `useGameStore` — Spielzustand: currentTab, gamePhase, timer, nation, year, gameId
- [x] `useUIStore` — UI-Zustand: bottomNavExpanded, sidebarOpen, activeModal, toast

### 6. Routing & Seiten-Platzhalter
- [x] Root `/` → Redirect zu `/map` (wird in F2/F3 mit Auth-Flow ersetzt)
- [x] `/map` — Karten-Platzhalter mit Holzrahmen + Water-Interior
- [x] `/diplomacy` — Chat-Platzhalter mit Gesprächsliste
- [x] `/economy` — Wirtschafts-Platzhalter mit Stats-Cards (Credits, VZ, Energie, Lizenzen)
- [x] `/settings` — Einstellungen mit gruppierten Menüpunkten (Profil, Audio, Notifications, Info)

## Tech-Stack

| Technologie | Version |
|-------------|---------|
| Next.js | 16.2.2 |
| React | 19.2.4 |
| TypeScript | ^5 |
| Tailwind CSS | v4 |
| Zustand | latest |

## Ergebnisse & Test

- ✅ `npm run build` — Erfolgreich (alle 5 Routes kompiliert als statische Seiten)
- ✅ `npm run dev` — Dev-Server läuft auf Port 3000
- ✅ Navigation zwischen allen 4 Tabs funktioniert korrekt
- ✅ Active-Tab State (Gold-Shine + Glow) wechselt korrekt
- ✅ TopBar mit Phasen-Label und Timer wird auf allen Seiten angezeigt
- ✅ Design stimmt mit D1 Style Guide überein (Farben, Fonts, Spacing)

## Offene Punkte / Nächste Schritte

- [ ] PWA-Icons erstellen (192x192, 512x512) — wartet auf D9
- [ ] Splash Screen implementieren — wartet auf D6
- [ ] Auth-Flow (Login/Register) → F2
- [ ] Home Screen (Match-Übersicht) → F3
- [ ] Lobby → F4
