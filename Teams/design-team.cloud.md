# Team: Design & Art

## Teamverantwortung

Das Design-Team erstellt alle visuellen Assets: die interaktive Europa-Karte, Einheiten-Grafiken, UI-Komponenten, Animationen, Icons und das gesamte visuelle Erscheinungsbild der App im militärisch-historischen Stil.

---

## Tools & Software

| Tool | Zweck |
|------|-------|
| **Figma** | UI/UX Design, Prototyping, Design System |
| **Adobe Illustrator** | Vektor-Assets (Karte, Icons, Wappen) |
| **Blender / Cinema 4D** | 3D-Modelle (Einheiten-Miniaturen) |
| **After Effects / Lottie** | Animationen (Befehlsauflösung, Raketen) |
| **Spine / Rive** | Interaktive Animationen (Einheiten auf Karte) |
| **Photoshop** | Texturen, Hintergründe, Compositing |

---

## Aufgabenpakete

### Paket D1: Design System & Style Guide
**Priorität:** Phase 1 (MVP) - Kritischer Pfad

- [ ] Farbpalette definieren:
  ```
  Primary:    Dunkelblau (#1B2838) - Hintergrund, Navigation
  Secondary:  Bordeaux (#8B0000) - Buttons "Erstellen", Raketen
  Accent:     Gold (#C5A55A) - Highlights, Ränge, VZ-Marker
  Success:    Dunkelgrün (#2D5016) - Buttons "Beitreten"
  Warning:    Bernstein (#D4A017) - Timer-Warnung
  Danger:     Rot (#CC0000) - Angriffe, Zerstörung
  Paper:      Pergament (#F4E8C1) - Hintergründe
  Wood:       Holz (#5C3A21) - Rahmen, Panels
  ```
- [ ] Typografie:
  - Überschriften: Serifenschrift (z.B. Playfair Display, Cinzel)
  - Body/Daten: Sans-Serif (z.B. Inter, Source Sans Pro)
  - Zahlen: Tabular Figures (gleichbreite Ziffern für Tabellen)
- [ ] Spacing & Grid System (8px Grid)
- [ ] Button-Stile (Primary, Secondary, Danger, Disabled)
- [ ] Input-Felder, Slider, Toggles
- [ ] Karten-Stil (Cards für Matches, Shop-Items, Verträge)
- [ ] Icon-Set (mindestens 40 Custom Icons)
- [ ] Figma Component Library aufbauen

### Paket D2: Nations-Design
**Priorität:** Phase 1 (MVP)

- [ ] Pro Nation definieren:
  ```
  Großbritannien:  Farbe Rosa/Pink, Wappen Löwe
  Deutsches Reich: Farbe Schwarz, Wappen Adler
  Österreich-Ung.: Farbe Rot, Wappen Doppeladler
  Frankreich:      Farbe Blau, Wappen Lilie
  Italien:         Farbe Grün, Wappen Stern
  Russland:        Farbe Gelb, Wappen Bär
  Osmn. Reich:     Farbe Türkis, Wappen Halbmond
  ```
- [ ] Flaggen-Icons (klein, für Match-Cards und Info-Leiste)
- [ ] Wappen-Assets (groß, für Länderwahl und Profil)
- [ ] Einheiten-Farbcodierung pro Nation
- [ ] Gebietsfärbung auf der Karte (halbtransparent, pro Nation)

### Paket D3: Europa-Karte
**Priorität:** Phase 1 (MVP) - Kritischer Pfad

- [ ] Vintage-Stil Europakarte (WW1-Ära)
- [ ] Alle 75 Gebiete als separate SVG-Pfade
- [ ] Versorgungszentren mit speziellem Marker (Stern oder Punkt)
- [ ] Hauptstädte hervorgehoben (größerer Marker)
- [ ] Küstenlinien, Meeres-Zonen, Grenzen klar unterscheidbar
- [ ] Gebiets-Labels (Name + Abkürzung)
- [ ] Zoom-Level: 3 Stufen (Übersicht, Detail, Nahansicht)
- [ ] Hover/Tap-State pro Gebiet (leichter Glow)
- [ ] Ausgewähltes Gebiet: Deutliche Hervorhebung
- [ ] Rahmen: Holz/Messing-Rahmen um die Karte (wie Brettspiel)
- [ ] Kompass-Rose als Dekoration
- [ ] See-Texturen (Wasser mit leichter Wellentextur)

### Paket D4: Einheiten-Grafiken
**Priorität:** Phase 1 (MVP)

- [ ] **Armee:** Miniaturfigur/Soldat oder Kreis-Token pro Nation
- [ ] **Flotte:** Kriegsschiff oder Dreieck-Token pro Nation
- [ ] **Luftwaffe (AF):** Doppeldecker-Flugzeug (WW1-Stil)
- [ ] **Spezialeinheiten (SF):** Schatten-Figur / Spion-Silhouette
- [ ] Einheiten in 7 Farbvarianten (pro Nation)
- [ ] Getarnte SF: Halbtransparenter Schatten-Effekt
- [ ] Enttarnte SF: Normaler Look + "Entdeckt"-Badge
- [ ] Zerstörte Einheit: Rauch/Trümmer-Icon

### Paket D5: Spieler-Icons & Avatare
**Priorität:** Phase 1 (MVP)

- [ ] Mindestens 20 wählbare Spieler-Icons:
  - Generäle (verschiedene Epochen/Nationen)
  - Admiräle
  - Diplomaten
  - Spione
  - Herrscher
- [ ] 3D-gerenderte Miniaturen (wie in Design-Ideen)
- [ ] Runder Rahmen (Gold, Silber, Bronze - je nach Rang)
- [ ] Icon-Auswahl-Galerie (Grid-Layout)

### Paket D6: UI Screens (Figma-Prototyp)
**Priorität:** Phase 1 (MVP)

- [ ] Splash Screen
- [ ] Login / Registrierung
- [ ] Hauptbildschirm (Home) - Portrait + Landscape
- [ ] Spiel erstellen (Konfiguration)
- [ ] Lobby / Warteraum
- [ ] Spielfeld (Game View) - Portrait + Landscape
- [ ] Befehlseingabe (alle Zustände)
- [ ] Rückzugsphase
- [ ] Aufbauphase (Winter)
- [ ] Chat-Fenster
- [ ] Shop
- [ ] Economy-Panel
- [ ] Smart Contract erstellen
- [ ] Hacker-Minute Overlay
- [ ] Befehlsauflösungs-Ergebnis
- [ ] Siegesscreen / Niederlagenscreen
- [ ] Settings
- [ ] Interaktiver Figma-Prototyp (klickbar, alle Flows)

### Paket D7: Animations-Assets
**Priorität:** Phase 2

- [ ] Befehlsauflösung:
  - Einheiten-Marsch (von A nach B gleiten)
  - Kampf/Konflikt (Schwerter-Clash Effekt)
  - Vertreibung (Einheit weicht zurück)
  - Patt (Blitz/Patt-Symbol)
- [ ] Rakete:
  - Abschuss (Raketenstart vom Absender-Land)
  - Flugbahn (Parabel über die Karte)
  - Einschlag (Explosion mit Rauch)
- [ ] Sabotage:
  - Glitch/Störsignal auf betroffener Einheit
  - Digital-Noise Overlay
- [ ] Hacker-Minute:
  - Countdown-Animation (pulsierend, grün/Matrix-Stil)
  - Befehl-Enthüllung (Dekodierungs-Animation)
- [ ] Lottie-Export für React Native Integration

### Paket D8: Sound & Music
**Priorität:** Phase 6

- [ ] Ambient-Musik: Strategisch/militärisch, loopbar
- [ ] UI-Sounds:
  - Button-Click (Metallisch)
  - Befehl setzen (Siegelstempel)
  - Befehle abgeben (Pergament-Rolle)
  - Timer-Tick (Uhr)
  - Timer-Warnung (Trommelwirbel)
  - Chat-Nachricht (Diplomatenkurier-Glocke)
  - Kauf im Shop (Münzen)
  - Raketen-Abschuss + Einschlag
  - Sabotage (elektronisches Glitch)
  - Sieg (Fanfare)
  - Niederlage (dramatische Streicher)
- [ ] Audio-Sprites für Performance
- [ ] Lautstärke-Regler in Settings

### Paket D9: Web-App & Marketing Assets
**Priorität:** Phase 7

- [ ] PWA Icon (512x512 + 192x192 + Favicon)
- [ ] PWA Splash Screen (verschiedene Größen für iPhone/iPad)
- [ ] Open Graph Image (für Social Media Sharing, 1200x630)
- [ ] Landing Page Design (falls separate Marketingseite)
- [ ] Screenshots für Social Media / Presskit (iPhone + iPad Mockups)
- [ ] Promotional Video (30-60 Sekunden Gameplay)
- [ ] Presskit zusammenstellen

---

## Design-Prinzipien

| Prinzip | Umsetzung |
|---------|-----------|
| **Militärisch-historisch** | WW1-Ära Ästhetik: Uniformen, Karten, Messing, Holz |
| **Modern + lesbar** | Klare Typografie, hoher Kontrast für Zahlen/Status |
| **Taktile Haptik** | Buttons fühlen sich "gedrückt" an (Schatten, Depth) |
| **Information Density** | Viele Infos kompakt aber übersichtlich (Economy, Karte) |
| **Emotionale Momente** | Raketen-Einschlag, Verrat enthüllt, Sieg → dramatisch |
| **Accessibility** | Farbe + Form (für Farbenblindheit), min. 44px Touch |

---

## Abhängigkeiten zu anderen Teams

| Von Team | Benötigt | Für Paket |
|----------|----------|-----------|
| Game Logic | Karten-Daten (Gebiete, Koordinaten, VZ) | D3 |
| Frontend | Asset-Formate (SVG, PNG, Lottie, Sprite Sheets) | Alle |
| Frontend | Animation-Integration (React Native Reanimated) | D7 |

---

## Deliverables pro Phase

| Phase | Pakete | Beschreibung |
|-------|--------|-------------|
| Phase 1 (MVP) | D1-D6 | Design System, Karte, Einheiten, Icons, alle Screens |
| Phase 2 | D7 | Animationen |
| Phase 6 | D8 | Sound & Music |
| Phase 7 | D9 | App Store Assets |
