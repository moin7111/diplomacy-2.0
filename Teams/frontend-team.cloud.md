# Team: Frontend & UI/UX

## Teamverantwortung

Das Frontend-Team ist verantwortlich für die gesamte Client-Seite der Web-App: alle Screens, die interaktive Karte, Animationen, responsive Design (optimiert für iPhone & iPad im Browser) und die visuelle Umsetzung des Design-Konzepts.

---

## Tech-Stack

| Technologie | Zweck |
|-------------|-------|
| **React.js + Next.js** | Web-App Framework (SSR, Routing, PWA) |
| **Tailwind CSS / CSS Modules** | Styling (Mobile-First, responsive) |
| **Canvas / WebGL (Pixi.js)** | Kartenrendering (interaktive SVG/Canvas-Karte) |
| **Framer Motion / GSAP** | Flüssige Animationen (Befehlsauflösung, Raketen) |
| **Zustand / Redux** | Client-seitiger State Management |
| **Socket.io Client** | Echtzeit-Verbindung zum Backend |
| **Hammer.js / use-gesture** | Pinch-to-Zoom, Pan, Drag auf der Karte (Touch) |
| **Service Worker** | PWA: Offline-Caching, Web Push Notifications |

---

## Aufgabenpakete

### Paket F1: Web-App-Grundgerüst & Navigation
**Priorität:** Phase 1 (MVP)

- [ ] Projektsetup Next.js (TypeScript, App Router)
- [ ] PWA-Konfiguration (Manifest, Service Worker, "Add to Homescreen")
- [ ] Routing implementieren (Splash → Login → Home → Game)
- [ ] Tab-Navigation im Spielfeld (Rüstung, Match, Shop, Chat)
- [ ] Globaler State Store einrichten (Auth-State, Game-State)
- [ ] Theming-System (Farbpalette, Fonts, Spacing) gemäß Design-Richtung
- [ ] Mobile-First CSS (optimiert für iPhone Safari + iPad)
- [ ] Viewport-Meta-Tags (kein Zoom, safe-area-inset)

### Paket F2: Login / Registrierung
**Priorität:** Phase 1 (MVP)

- [ ] Login-Screen (E-Mail + Passwort)
- [ ] Registrierung-Screen (E-Mail, Username, Passwort)
- [ ] Wechsel Login ↔ Registrierung (Inline-Toggle)
- [ ] Social Login Integration (Google, Apple) - Optional
- [ ] Formular-Validierung mit Fehlermeldungen
- [ ] "Passwort vergessen"-Flow
- [ ] Secure Token Storage (HttpOnly Cookies / localStorage mit Encryption)

### Paket F3: Hauptbildschirm (Home)
**Priorität:** Phase 1 (MVP)

- [ ] Layout: Spieler-Icon (groß, rund, klickbar), Name, CTAs, Match-Liste
- [ ] Spieler-Icon-Auswahl (Overlay mit Icon-Galerie)
- [ ] Spielername Inline-Edit (Tap → Edit → Save)
- [ ] "Spiel erstellen"-Button → Konfigurationsscreen
- [ ] "Spiel beitreten"-Button → Code-Eingabe
- [ ] Match-Karten-Komponente (Flagge, Name, Spieleranzahl, Runde, Status)
- [ ] Scrollbare Match-Liste (aktuelle Spiele + offene Spiele)
- [ ] Pull-to-Refresh für Match-Liste
- [ ] Settings-Button (oben links) → Settings-Screen

### Paket F4: Spiel erstellen & Lobby
**Priorität:** Phase 1 (MVP)

- [ ] Konfigurationsscreen (Spielname, Modus, Raketen, Timer-Einstellungen)
- [ ] Slider-Komponenten für Timer-Werte
- [ ] Toggle-Komponente für Raketen AN/AUS
- [ ] Raumcode-Anzeige nach Erstellung
- [ ] Share-Funktion (WhatsApp, SMS, Copy-to-Clipboard)
- [ ] Lobby-Screen (Spielerliste, Bereit-Status, Host-Controls)
- [ ] Länderwahl-Interface (nach Beitritt aller Spieler)

### Paket F5: Karten-Renderer (Kernkomponente)
**Priorität:** Phase 1 (MVP) - Kritischer Pfad

- [ ] Europa-Karte als interaktive SVG/Canvas rendern (Pixi.js oder Canvas API)
- [ ] Gebiete als klickbare Polygone mit Farb-Codierung
- [ ] Touch: Pinch-to-Zoom (smooth, mit Min/Max-Grenzen, via Hammer.js/use-gesture)
- [ ] Touch: Pan/Drag (Karte verschieben)
- [ ] Tap auf Gebiet → Highlight + Info-Tooltip
- [ ] Einheiten auf der Karte darstellen (Icons pro Nation)
- [ ] Versorgungszentren markieren (mit Besitzer-Farbe)
- [ ] Küstenlinien, Grenzen, Meeres-Zonen visuell unterscheiden
- [ ] Performance-Optimierung (60fps auf iPhone 12+, iPad Air+)
- [ ] Mini-Map / Zoom-Indikator
- [ ] Safari-spezifische Optimierungen (Touch-Delay, Viewport)

### Paket F6: Befehlseingabe-System (Gesten-basiert)
**Priorität:** Phase 1 (MVP) - Kritischer Pfad

**Auswahl & Grundgesten:**
- [ ] Tap auf eigenes Gebiet (mit Einheit) → Gebiet farblich hinterlegen (ausgewählt)
- [ ] Erlaubte Zielfelder dezent hervorheben nach Auswahl
- [ ] Tap auf irgendwo anders / leeren Bereich → Auswahl aufheben

**Move / Angriff:**
- [ ] Nach Auswahl: Tap auf anderes Gebiet → Move/Angriff-Befehl
- [ ] Pfeil von Ursprung → Ziel auf Karte rendern

**Halten:**
- [ ] Nach Auswahl: Nochmal Tap auf das eigene Gebiet → Hold-Befehl
- [ ] Hold-Symbol (Schild-Icon) auf Einheit anzeigen

**Support:**
- [ ] Nach Auswahl: Tap auf [SUPPORT]-Button → Support-Modus aktivieren
- [ ] ODER: Long-Press (~0.5s) auf Gebiet das man supporten will → Support-Modus
- [ ] Im Support-Modus: Tap auf Angriffsfeld → Support-Angriff Befehl
- [ ] Für Support-Hold: Tap auf das zu haltende Gebiet
- [ ] Support-Linien (gestrichelt) auf Karte rendern

**Convoy:**
- [ ] Nach Auswahl: Extra-langes Halten (~2s) auf Zielgebiet
- [ ] Visueller Wechsel: Support-Modus → Convoy-Modus (Icon-Wechsel)
- [ ] Convoy-Route (gepunktet) auf Karte rendern
- [ ] Nur für Flotten in Seegebieten erlauben

**Sabotage (nur SF):**
- [ ] Long-Press auf eigene SF-Einheit → Sabotage-Modus
- [ ] ODER: Tap auf SF + Tap auf [SABOTAGE]-Button
- [ ] Ziel wählen: Feindliche Einheit (Support-Cut) oder VZ (Infrastruktur)

**Ungültige Züge - Fehlerfeedback:**
- [ ] Feld blinkt ROT bei ungültigem Zug (~0.5s Animation)
- [ ] Toast-Nachricht: "Zug nicht möglich: [Grund]"
- [ ] Befehl wird NICHT gesetzt → sofort neu versuchbar

**Allgemein:**
- [ ] Befehl rückgängig machen / ändern (vor Abgabe): Tap auf Pfeil → Delete
- [ ] "Befehle abgeben"-Button mit Bestätigungsdialog
- [ ] Visual Feedback nach Abgabe ("Abgegeben ✓")
- [ ] Gesten-Tutorial beim ersten Spiel (Overlay mit Erklärung)

### Paket F7: Rückzugs- und Aufbauphase UI
**Priorität:** Phase 1 (MVP)

- [ ] Rückzugsphase: Vertriebene Einheiten markieren
- [ ] Rückzugsoptionen anzeigen (erlaubte Felder)
- [ ] Auflösung wenn kein Rückzug möglich
- [ ] Aufbauphase (Winter): Heimatzentrenselektor
- [ ] Einheitentyp-Wahl (Armee oder Flotte, + AF/SF in Phase 3)
- [ ] Abbau-Interface (Einheit zum Abbau auswählen)

### Paket F8: Info-Leiste & Timer
**Priorität:** Phase 1 (MVP)

- [ ] Obere Info-Leiste: Credits aller Nationen (kompakt)
- [ ] Timer-Anzeige mit Countdown
- [ ] Timer pulsiert rot bei letzter Minute
- [ ] Phasen-Indikator (Frühling/Herbst/Winter + Jahr)
- [ ] "Befehle abgeben"-Button in der Leiste

### Paket F9: Chat-System
**Priorität:** Phase 1 (MVP)

- [ ] Chat-Tab mit Gesprächsliste
- [ ] 1:1 Chat zwischen Spielern
- [ ] Gruppenchat erstellen
- [ ] Nachrichten senden/empfangen (Echtzeit via WebSocket)
- [ ] Ungelesene-Nachrichten-Badge
- [ ] Timestamp pro Nachricht
- [ ] Scroll-to-Bottom bei neuer Nachricht
- [ ] Push-Notification Badge auf Chat-Tab

### Paket F10: Befehlsauflösung-Animation
**Priorität:** Phase 2

- [ ] Raketen-Einschlag-Animation (Flugbahn + Explosion)
- [ ] Sabotage-Animation (Glitch-Effekt)
- [ ] Einheiten-Bewegungs-Animation (gleichzeitiges Marschieren)
- [ ] Konflikt-Animation (Kampf-Effekt bei Patt/Vertreibung)
- [ ] Ergebnis-Zusammenfassung als Overlay nach Animation
- [ ] Skip-Button für Animation
- [ ] Replay-Funktion (letzter Zug nochmal ansehen)

### Paket F11: Wirtschafts-Panel
**Priorität:** Phase 2

- [ ] Economy-Tab: Eigene CR, VZ-Anzahl, Buff-Status
- [ ] Ressourcen-Anzeige (Energie, Lizenzen)
- [ ] Aktive Verträge-Liste
- [ ] Alle-Länder-Übersicht (CR, VZ pro Nation)
- [ ] Vertrag erstellen Interface (Partner, Angebot, Forderung, Bedingungen)
- [ ] Vertrag annehmen/ablehnen Interface
- [ ] Escrow-Fortschrittsanzeige

### Paket F12: Tech-Shop UI
**Priorität:** Phase 2

- [ ] Shop-Tab mit Produkt-Karten
- [ ] Kauf-Flow (Produkt wählen → Bestätigung → Feedback)
- [ ] CR-Saldo prominent anzeigen
- [ ] Deaktivierte Items (wenn CR nicht reicht / Voraussetzung fehlt)
- [ ] Italienische Provision visuell anzeigen ("+1 CR an Italien")
- [ ] Kauf-Historie

### Paket F13: Hacker-Minute Overlay
**Priorität:** Phase 2

- [ ] Fullscreen-Overlay mit 60s-Countdown
- [ ] Enthüllter feindlicher Befehl (animierte Einblendung)
- [ ] "Befehle anpassen" vs "Beibehalten" CTAs
- [ ] Schnellzugriff auf Befehlsänderung
- [ ] Visueller Alarm-Stil (Warnfarben, pulsierend)

### Paket F14: Fog of War (SF-Sichtbarkeit)
**Priorität:** Phase 3

- [ ] Eigene SF als halbtransparente Icons auf Karte
- [ ] Feindliche SF sind standardmäßig unsichtbar
- [ ] Enttarnte SF erscheinen mit "Entdeckt!"-Effekt
- [ ] Nächste Runde: SF verschwinden wieder (Fade-Out)

### Paket F15: Responsive Design, PWA & Polish
**Priorität:** Phase 6

- [ ] iPhone Portrait (375px-430px): Kompakt-Layout, Touch-optimiert
- [ ] iPad Landscape (1024px+): Split-View (Karte + Side-Panel)
- [ ] PWA-Optimierung: App-Like Experience (kein Browser-Chrome, Splash Screen)
- [ ] Safari-spezifisch: Safe-Area-Insets, Rubber-Band-Scrolling, Status-Bar
- [ ] Performance-Profiling & Optimierung (Lighthouse Score > 90)
- [ ] Accessibility: Farbenblindheit-Modus, große Touch-Targets (min. 44px)
- [ ] Offline-Modus via Service Worker: Befehle lokal cachen
- [ ] Web Push Notifications (Zug-Erinnerungen, Chat)
- [ ] Error-States und Retry-Logik für alle Screens
- [ ] Loading-Skeletons statt Spinner

---

## Abhängigkeiten zu anderen Teams

| Von Team | Benötigt | Für Paket |
|----------|----------|-----------|
| Backend | REST API Endpoints (Auth, Game, Chat) | F2, F3, F4, F9 |
| Backend | WebSocket Events (Züge, Timer, Chat) | F6, F8, F9, F13 |
| Game Logic | Befehlsvalidierung-API | F6 |
| Game Logic | Karten-Daten (Gebiete, Adjacency) | F5 |
| Economy | Shop-API, Vertrag-API | F11, F12 |
| Design | Asset-Delivery (Icons, Karte, Einheiten) | F5, F15 |

---

## Deliverables pro Phase

| Phase | Pakete | Beschreibung |
|-------|--------|-------------|
| Phase 1 (MVP) | F1-F9 | Spielbare Grundversion mit Karte, Befehlen, Chat |
| Phase 2 | F10-F13 | Animationen, Wirtschaft, Shop, Hacker-Minute |
| Phase 3 | F14 | Fog of War für Spezialeinheiten |
| Phase 6 | F15 | Polish, Responsive, Accessibility |
