# Erledigte Aufgaben: D5 + D6 — Avatar-Icons & Prototyp finalisiert

**Status:** ✅ Abgeschlossen  
**Datum:** 2026-04-26  
**Pakete:** D5 (Spieler-Icons & Rahmen) + D6 (Prototyp finalisiert) + D7 Konzept (Phase 2 Vorbereitung)

---

## D5 — Spieler-Icons mit Rahmen ✅

### Lieferobjekte

| Asset | Datei | Beschreibung |
|-------|-------|-------------|
| Avatar-Auswahl Screen | `screens/avatar-selection-screen.html` | 3 Phone-Frames: Galerie, Großansicht Caesar, Großansicht Zeus |
| Icon-Rahmen Design System | (in screen dokumentiert) | 3 Zustände: Default, Selected, Locked |

### Icon-Rahmen Design (D5 Core)

**Frame-Technologie:** CSS gradient padding ring (kein border — ermöglicht Gradient-Rahmen)

```css
/* DEFAULT */
.af {
  width: 100px; height: 100px; padding: 3px;
  border-radius: 50%;
  background: linear-gradient(145deg, #9E7E3A 0%, #EDD898 30%, #C5A55A 55%, #9E7E3A 78%, #EDD898 100%);
  box-shadow: 0 0 14px rgba(197,165,90,.28), 0 4px 14px rgba(0,0,0,.65);
}

/* SELECTED (aufleuchtend, Rosetten-Ornamente) */
.af.selected {
  padding: 4px;
  background: linear-gradient(145deg, #fff 0%, #EDD898 28%, #fff 52%, #EDD898 80%, #fff 100%);
  box-shadow: 0 0 36px rgba(237,216,152,.9), 0 0 72px rgba(197,165,90,.45);
}
/* ::before / ::after: Rosette ✦ oben-rechts + unten-links */

/* LOCKED */
.af.locked { opacity: .28; filter: grayscale(100%); }
```

### Großansicht-Modal Design

| Element | Spezifikation |
|---------|-------------|
| Hintergrund | Kategorie-`_background.png` · `background-size: cover` |
| Gradient | `linear-gradient(0deg, rgba(11,17,29,1) 0%, …, transparent 100%)` |
| Fullbody-Image | `position: absolute; bottom: 272px; width: 250px; height: 310px` |
| Charakter-Name | Cinzel 30px Bold · `text-shadow` mit Gold-Glow |
| Kategorie-Badge | Pill mit Border `rgba(197,165,90,.5)` |
| Beschreibungstext | 4 Zeilen max · `-webkit-line-clamp: 4` |
| CTA | Bordeaux Button 54px `CHARAKTER WÄHLEN` |

### Avatar-Asset Status (alle Kategorien)

| Kategorie | Icons | Fullbody | Hintergrund |
|-----------|-------|---------|-------------|
| antike-historisch | ✅ 5 | ✅ 5 | ✅ |
| antike-mythologie | ✅ 3 | ✅ 3 | ✅ |
| mittelalter | ✅ 4 | ✅ 4 | ✅ |
| fruehe-neuzeit | ✅ 3 | ✅ 3 | ✅ |
| 20-jahrhundert | ✅ 4 | ✅ 4 | ✅ |
| kalter-krieg | ✅ 3 | ✅ 3 | ✅ |
| griechische-goetter | ✅ 5 | ✅ 5 | ✅ |
| ikonische-figuren | ✅ 9 | ✅ 9 | ✅ |
| entwickler | ✅ 1 | ✅ 1 | ✅ |
| **Gesamt** | **37** | **37** | **9** |

---

## D6 — Prototyp finalisiert ✅

### Alle MVP-Screens

| Screen | Datei | Status |
|--------|-------|--------|
| Login / Register | `screens/login-screen.html` | ✅ (D2/D6 vorher) |
| Home Screen | `screens/home-screen.html` | ✅ (D2/D6 vorher) |
| Lobby + Nationen | `screens/lobby-screen.html` | ✅ (D2/D6 vorher) |
| Avatar-Auswahl (NEU) | `screens/avatar-selection-screen.html` | ✅ |
| Karte / Spielfeld (NEU) | `screens/karte-screen.html` | ✅ |
| Befehlseingabe (NEU) | `screens/befehlseingabe-screen.html` | ✅ |
| Auflösung / Replay (NEU) | `screens/aufloesung-screen.html` | ✅ |
| Sieg / Niederlage (NEU) | `screens/sieg-screen.html` | ✅ |

### Vollständiger Screen-Flow (D6 MVP)

```
Login ──► Register ──► Home ──► Lobby ──► Nationen-Auswahl
                                            │
                                            ▼
                                     Avatar-Auswahl
                                            │
                                            ▼
                                     Karte (Befehle-Phase)
                                            │
                                            ▼
                                     Befehlseingabe
                                        [3 Zustände:]
                                        1. Keine Auswahl
                                        2. Einheit ausgewählt → Befehlsauswahl
                                        3. Alle Befehle gesetzt → Bestätigung
                                            │
                                            ▼
                                     Karte (Warten auf andere)
                                            │
                                            ▼
                                     Auflösung / Replay
                                        [2 Ansichten:]
                                        1. Karte mit Bewegungspfeilen
                                        2. Vollständiges Ergebnis-Log
                                            │
                                     ┌──────┴──────┐
                                     ▼             ▼
                               Rückzug-Phase   [Kein Rückzug]
                               (falls nötig)       │
                                     └──────┬──────┘
                                            ▼
                                     Karte (neue Runde)
                                            │
                                       [18 VZ erreicht]
                                            │
                                            ▼
                                     Sieg / Niederlage
                                        [3 Ansichten:]
                                        1. Sieg (Gold, Particles, Fullbody)
                                        2. Niederlage (Desaturiert, Dunkel)
                                        3. Abschluss-Rangliste alle 7 Spieler
```

### Screen-Design-Highlights

**Karte:**
- Phase-Indikator-Bar (6 Schritte: Herbst → Winter → Befehle → Auflösung → Rückzug → Herbst)
- VZ-Counter (aktuell/18) permanent sichtbar rechts
- Timer (JetBrains Mono, Rot bei < 1min)
- Unit-Tokens auf Karte mit Nationalfarbe-Border
- "Warten auf Spieler" Banner mit Nation-Dots

**Befehlseingabe:**
- Fortschritts-Bar (0/3 → grün wenn vollständig)
- Mini-Karte-Thumbnail als Kontext
- Einheiten-Cards mit Bestell-Status
- Bottom-Sheet für Befehlsauswahl (4 Typen: Halten / Vorrücken / Unterstützen / Konvoi)
- Zielgebiet-Chips (inkl. Feind-Markierung ⚠)
- CTA: Aktiv erst wenn 3/3 Befehle gesetzt

**Auflösung:**
- SVG-Overlay mit farbcodierten Bewegungspfeilen
- Ereignis-Icons: ✅ Erfolg · ⚡ Bounce · ⚠️ Rückzug
- Summary-Row: Erfolge / Bounces / Rückzüge
- Replay-Controls: ⏮ ◀ ▶ ► + Fortschrittsbalken

**Sieg/Niederlage:**
- Sieg: Gold-Glow-Ring, CSS-Partikel-Animation (8 floating particles), 🏆 Trophy
- Niederlage: Grayscale-Filter, dunkles UI, Winner-Card mit gegnerischem Avatar
- Rangliste: Alle 7 Spieler sortiert nach VZ, eigener Platz markiert ("DU")

### Design-Konformität (D1)
- ✅ Farbpalette vollständig umgesetzt
- ✅ Typography: Cinzel (Headings), Inter (Body), JetBrains Mono (Zahlen/Timer/Codes)
- ✅ 8px Grid-System
- ✅ Mindest-Touch-Target 44px
- ✅ Gold-Borders, Corner-Ornamente
- ✅ Button-Varianten: Primary (Bordeaux), Success (Grün), Disabled States
- ✅ WCAG AA-konformer Kontrast

---

## D7 — Animation-Konzept (Phase 2 Vorbereitung) ✅

**Datei:** `Design System/_archive/D7-ANIMATION-KONZEPT.md`

### Dokumentierte Animations-Typen

| Typ | CSS-Technik | Dauer |
|-----|-------------|-------|
| Move Success | `@keyframes unit-move` · translate + scale | 600ms |
| Bounce / Patt | `@keyframes unit-bounce` · elastic ease | 800ms |
| Support | Gestrichelte Pfeile · opacity | 600ms |
| Dislodge | Shake + Glow + Fade · 3-Schritt-Sequenz | 1000ms |
| VZ-Capture | Scale + color + Sonar-Ring | 600ms |
| Partikel | Radiale burst · 8 Partikel | 400ms |
| Kamera-Pan | CSS transform matrix | 300ms |
| Log-Item-Einblenden | translateY + opacity | 200ms |

### Implementierungs-Reihenfolge (Phase 2)
1. **P0:** Move + Bounce + Event-Log (Basis-MVP)
2. **P1:** Support-Pfeile + VZ-Capture
3. **P2:** Dislodge + Rückzugs-Pfeile + Kamera-Pan
4. **P3:** Partikel + Vernichtung + Konvoi
5. **P4:** Sound-Cues

---

## Figma-Prototyp-Status

Da Figma Starter-Plan max. 3 Seiten erlaubt, werden die HTML-Reference-Screens
als **Figma-Import via Frame-Screenshot** genutzt.

**Empfohlenes Vorgehen für Figma-Upgrade:**
1. Alle 8 Screens als PNGs exportieren (1x, retina-fähig)
2. In Figma als Frames importieren (390×844px)
3. Hotspots / Klickbereiche als Figma-Prototyp-Links verknüpfen
4. Flow: Login → Home → Lobby → Avatar → Karte → Befehle → Auflösung → Sieg

**Hotspot-Spezifikation pro Screen:**

| Screen | Hotspot | Ziel |
|--------|---------|------|
| Login | "Anmelden" Button | Home |
| Home | Avatar-Klick | Avatar-Auswahl |
| Home | "Spiel Erstellen" | Lobby |
| Lobby | "Spiel Starten" | Karte |
| Karte | "Befehle Eingeben" | Befehlseingabe |
| Befehlseingabe | "Befehle Abschicken" | Karte (Warten) |
| Karte (Warten) | Auto-Transition | Auflösung |
| Auflösung | "Weiter" | Sieg oder neue Runde |
| Sieg | "Nochmal" | Lobby |

---

*Alle HTML-Reference-Screens sind pixelgenau für iPhone 14 (390×844px) und
orientieren sich vollständig am D1 Style Guide.*
