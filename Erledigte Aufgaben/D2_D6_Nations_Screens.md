# Erledigte Aufgaben: D2 + D6 — Nationen-Design & Screen-Designs

**Status:** ✅ Abgeschlossen
**Datum:** 2026-04-09
**Pakete:** D2 (Nationen-Design) + D6 (UI Screens)

---

## D2 — Nationen-Design ✅

### Erstellte Assets

| Asset | Datei | Format | Größe |
|-------|-------|--------|-------|
| GB Wappen | `Nations/emblems/GB-grossbritannien.svg` | SVG | 120×140px |
| DE Wappen | `Nations/emblems/DE-deutsches-reich.svg` | SVG | 120×140px |
| AT Wappen | `Nations/emblems/AT-oesterreich-ungarn.svg` | SVG | 120×140px |
| FR Wappen | `Nations/emblems/FR-frankreich.svg` | SVG | 120×140px |
| IT Wappen | `Nations/emblems/IT-italien.svg` | SVG | 120×140px |
| RU Wappen | `Nations/emblems/RU-russland.svg` | SVG | 120×140px |
| TR Wappen | `Nations/emblems/TR-osmanisches-reich.svg` | SVG | 120×140px |
| Alle Badges | `Nations/badges/nation-badges.svg` | SVG | 560×80px |
| Referenz | `Nations/nations-reference.md` | Markdown | — |

### Nationen-Identitäten

| Nation | Farbe | Hex | Emblem-Motiv |
|--------|-------|-----|--------------|
| Großbritannien | Rosa/Pink | `#E8A0B0` | Löwe rampant mit Krone |
| Deutsches Reich | Anthrazit | `#4A4A4A` | Reichsadler (gold) mit Kaiserkrone |
| Österreich-Ungarn | Rot | `#C0392B` | Doppeladler weiß, rot-weiß-rot Brust |
| Frankreich | Gelb | `#FFDD00` | Fleur-de-lis (schwarz), Lilien-Streuung |
| Italien | Grün | `#27AE60` | Stella d'Italia + Zahnrad |
| Russland | Gelb | `#F1C40F` | Braunbär mit Krone |
| Osmn. Reich | Türkis | `#1ABC9C` | Halbmond + Stern, osmanische Ornamente |

### Farbcodes (D1-konform)

```css
--nation-gb: #E8A0B0;   /* Gebiet: rgba(232,160,176,0.4) */
--nation-de: #4A4A4A;   /* Gebiet: rgba(74,74,74,0.4)    */
--nation-at: #C0392B;   /* Gebiet: rgba(192,57,43,0.4)   */
--nation-fr: #FFDD00;   /* Gebiet: rgba(255,221,0,0.4)   */
--nation-it: #27AE60;   /* Gebiet: rgba(39,174,96,0.4)   */
--nation-ru: #F1C40F;   /* Gebiet: rgba(241,196,15,0.4)  */
--nation-tr: #1ABC9C;   /* Gebiet: rgba(26,188,156,0.4)  */
```

---

## D6 — UI Screen Designs ✅ (Prioritäts-Screens)

### Figma-Datei

**URL:** https://www.figma.com/design/HXza1VeP4O6smfjaVMc5nI
**Name:** Diplomacy 2.0 — D2+D6 Nations & Screens
**Pages:** 3 (Starter-Plan Maximum)
- `🔐 Login · Register` — Login + Register Varianten
- `🏠 Home Screen` — (HTML-Referenz)
- `🚪 Lobby + 🛡️ Nations` — (HTML-Referenz)

### HTML-Referenz-Screens (pixelgenau, 390×844px iPhone 14)

| Screen | Datei | Beschreibung |
|--------|-------|-------------|
| Login | `screens/login-screen.html` | Login + Register (2 Varianten nebeneinander) |
| Home | `screens/home-screen.html` | Spieler-Profil, Match erstellen, Beitreten, Match-Cards |
| Lobby | `screens/lobby-screen.html` | Host-View + Gast-View nebeneinander |

### Login / Register Screen
- Cinzel-Serif Logo "DIPLOMACY 2.0" mit Schild-Icon und Goldglühen
- Tab-Toggle: Anmelden (Bordeaux) / Registrieren (Grün)
- E-Mail + Passwort Inputs mit Passwort-Toggle
- "Passwort vergessen?" Link
- Primär-CTA mit 3D-Press-Effekt (Gold-Border, Box-Shadow)
- Oder-Divider + Google-Login
- Corner-Ornamente (Gold), diagonale Hintergrundlinien
- Register-Variante: zusätzliches Benutzername- und Passwort-Confirm-Feld

### Home Screen
- Top-Nav: Logo links, Settings/Achievements/Stats rechts
- Hero-Sektion: **Avatar (klickbar → Galerie)**, Rang-Badge, Spieler-Name, Stats-Row (Siege/Spiele/Rang/W-Rate)
- Avatar ist das persönliche Nationssymbol — überall im Spiel sichtbar statt Länderflagge
- CTA-Sektion: "Spiel Erstellen" (Bordeaux) + Raumcode-Input + "Beitreten" (Grün)
- Match-Cards Grid (2 Spalten): **Spieler-Avatar** der eigenen Nation + Nationalfarbe-Ring, Titel, Spieleranzahl, Runde, Join-Button
- Scroll-Bereich für weitere Matches

### Lobby Screen
- Top-Bar: Exit-Button, "WARTERAUM", Raumcode (JetBrains Mono, anklickbar zum Kopieren)
- Spieler-Liste (3/7): **Avatar** + Spielername, Host-Badge (Gold), Bereit-Badge (Grün), Warte-Badge (Grau), leere Slots (gestrichelt)
- Nationen-Wahl: 4×2 Grid, Farb-Kreis + Kürzel + Vollname + **Avatar-Vorschau des zugeordneten Spielers**, selected/taken/random States
- Spieleinstellungen: Spielmodus, Phasen-Dauer, Raketen-Toggle (nur Host)
- Bottom-Bar Host: Share-Button + "Spiel Starten" (disabled bis alle bereit)
- Bottom-Bar Gast: Share-Button + "Bereit"-Toggle
- Gast-View: Ausgewählte Nation prominent mit Buff-Info + eigenem Avatar

### Design-Konformität
- ✅ D1 Farbpalette vollständig umgesetzt
- ✅ Typography: Cinzel (Headings), Inter (Body), JetBrains Mono (Code/Codes)
- ✅ 8px Grid-System
- ✅ Mindest-Touch-Target 44px
- ✅ Gold-Borders, Corner-Ornamente, Wood/Navy Ästhetik
- ✅ Button-Varianten: Primary (Bordeaux), Secondary (Grün), Disabled States
- ✅ Hover/Active-States dokumentiert
- ✅ WCAG AA-konformer Kontrast

---

## Offene Aufgaben (D2/D6 Folge-Pakete)

- [ ] D4: Einheiten-Tokens in 7 Nationalfarben (A, F, AF, SF)
- [ ] D3: Gebietsfärbung in Europa-Karten-SVG integrieren
- [ ] D6: Restliche Screens (Spielfeld, Shop, Chat, Hacker-Minute, Sieg/Niederlage)
- [ ] Figma: Screens als interaktiven Prototyp verknüpfen (wenn Plan-Upgrade)
- [ ] Export: Wappen als PNG (2×, 3× für Retina)
