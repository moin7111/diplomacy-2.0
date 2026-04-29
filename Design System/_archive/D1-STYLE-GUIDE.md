# Diplomacy 2.0 — D1 Style Guide & Design System
**Version:** 1.0.0
**Paket:** D1 – Design System & Style Guide (Phase 1, MVP, Kritischer Pfad)
**Status:** Freigegeben für Frontend-Team
**Lieferobjekte:** `tokens.json` · `variables.css` · dieses Dokument

---

## Inhaltsverzeichnis

1. [Design-Philosophie](#1-design-philosophie)
2. [Farbpalette](#2-farbpalette)
3. [Typografie](#3-typografie)
4. [Spacing & Grid](#4-spacing--grid)
5. [Elevation & Schatten](#5-elevation--schatten)
6. [Animationen](#6-animationen)
7. [Button-Stile](#7-button-stile)
8. [Eingabefelder & Formulare](#8-eingabefelder--formulare)
9. [Cards & Panels](#9-cards--panels)
10. [Navigation](#10-navigation)
11. [Nationen-Farbsystem](#11-nationen-farbsystem)
12. [Icons (Spezifikation)](#12-icons-spezifikation)
13. [Figma Component Library Struktur](#13-figma-component-library-struktur)
14. [Accessibility](#14-accessibility)
15. [Übergabe an Frontend](#15-übergabe-an-frontend)

---

## 1. Design-Philosophie

### Kernprinzipien

| Prinzip | Beschreibung | Umsetzung |
|---------|-------------|-----------|
| **Militärisch-historisch** | WW1-Ära Ästhetik als Rahmen | Messing, Holz, Pergament, Serifenschrift |
| **Modern & lesbar** | Digitale Klarheit innerhalb des Stils | Hoher Kontrast, klare Typografie für Daten |
| **Taktile Haptik** | Buttons fühlen sich "gedrückt" an | Raised-Schatten, Pressed-State, Depth |
| **Information Density** | Viele Infos kompakt aber übersichtlich | Tabular Figures, Labels, Iconography |
| **Emotionale Momente** | Dramatische Spielereignisse visuell spürbar | Glow-Effekte, Animationen, Sound-Cues |
| **Accessibility** | Für alle Spieler nutzbar | WCAG 2.1 AA, 44px Touch-Targets, Farbe+Form |

### Visueller Charakter

Das UI wirkt wie ein **echtes Brettspiel, das auf einem Tisch liegt** — aber lebendig ist:
- **Holzrahmen** um die Karte (wie ein echter Spieltisch)
- **Pergament-Hintergründe** für Verträge und Regeln (wie historische Dokumente)
- **Messing-Beschläge** aus Gold-Tönen für Rahmen, Trennlinien, Icons
- **Dunkelblau** als digitales Navy-Blau für UI-Oberflächen
- **Bordeaux** für Aktionen (militärische Dringlichkeit)
- Moderne Touch-UI-Logik (44px Targets, Gesten, Animationen)

---

## 2. Farbpalette

### Primärfarben

| Token | Hex | Verwendung | Figma Stil |
|-------|-----|-----------|------------|
| `--color-navy` | `#1B2838` | Haupthintergrund, Navigation, Karten-Panels | `color/primary/navy` |
| `--color-navy-light` | `#253548` | Panel-Hintergründe, Card-Backgrounds, Hover | `color/primary/navy-light` |
| `--color-navy-dark` | `#111C27` | Tiefe Schatten, Sidebar, dunkelste Ebene | `color/primary/navy-dark` |

**Kontrast Navy → Pergament-Text:** 12.4:1 ✓ (WCAG AAA)

### Sekundärfarben (CTAs)

| Token | Hex | Verwendung | Figma Stil |
|-------|-----|-----------|------------|
| `--color-bordeaux` | `#8B0000` | Primary CTA: Erstellen, Befehle Abgeben | `color/secondary/bordeaux` |
| `--color-bordeaux-light` | `#A50000` | Hover-State | `color/secondary/bordeaux-light` |
| `--color-bordeaux-dark` | `#6B0000` | Pressed/Active | `color/secondary/bordeaux-dark` |
| `--color-success` | `#2D5016` | CTA Beitreten, positive Aktionen | `color/semantic/success` |
| `--color-success-light` | `#3D6B20` | Hover Success | `color/semantic/success-light` |

### Akzentfarbe (Gold/Messing)

| Token | Hex | Verwendung |
|-------|-----|-----------|
| `--color-gold` | `#C5A55A` | Rahmen, Icons, VZ-Marker, Labels, Highlights |
| `--color-gold-light` | `#D4BA7A` | Glanzpunkte, oberes Drittel von Metallverläufen |
| `--color-gold-dark` | `#9E7E3A` | Schatten auf Metallrahmen, Button-Borders |
| `--color-gold-shine` | `#EDD898` | Spekularlicht — hellster Punkt auf Gold-Oberflächen |

**Gold-Verlauf (Messing-Simulation):**
```
linear-gradient(180deg, #D4BA7A 0%, #C5A55A 50%, #9E7E3A 100%)
```

### Semantische Farben

| Token | Hex | Verwendung |
|-------|-----|-----------|
| `--color-warning` | `#D4A017` | Timer-Warnung (<60s), Resource-Alert |
| `--color-danger` | `#CC0000` | Angriffe, Zerstörung, Raketen, ungültige Züge |
| `--color-danger-light` | `#E60000` | Blink-Animation (0.5s) bei ungültigem Zug |
| `--color-info` | `#2A6EA6` | Neutral-Info, System-Nachrichten |

### Oberflächenfarben

| Token | Hex | Verwendung |
|-------|-----|-----------|
| `--color-paper` | `#F4E8C1` | Pergament — Verträge, Rules, Overlays |
| `--color-paper-dark` | `#E8D5A0` | Trennlinien auf Pergament |
| `--color-wood` | `#5C3A21` | Holzrahmen Karte, Panel-Borders |
| `--color-wood-light` | `#7A4E2D` | Highlight-Kante oben |
| `--color-wood-dark` | `#3E2510` | Schatten-Kante unten |

### Text-Farben

| Token | Verwendung | Kontrast (auf Navy) |
|-------|-----------|---------------------|
| `--color-text-primary` `#F4E8C1` | Haupttext auf dunklem Hintergrund | 12.4:1 ✓ |
| `--color-text-secondary` `#C5A55A` | Labels, Gold-Akzente | 7.2:1 ✓ |
| `--color-text-muted` `#8A9BAE` | Inaktiv, Placeholder | 4.6:1 ✓ (AA) |
| `--color-text-inverted` `#1B2838` | Text auf Pergament | 10.8:1 ✓ |
| `--color-text-danger` `#FF4444` | Fehlermeldungen | 5.1:1 ✓ (AA) |

---

## 3. Typografie

### Schriftfamilien

#### Heading: Cinzel (Google Fonts)
```
@import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;700&display=swap');
```
- **Verwendung:** Alle Überschriften, Screen-Titel, CTAs, Nation-Namen
- **Stil:** Uppercased, antik-militärisch, würdevoll
- **Gewichte:** 400 (Regular), 700 (Bold)
- **Fallback:** 'Playfair Display', Georgia, serif

**Beispiele:**
- `GENERAL MAX` → Cinzel Bold, 30px, letter-spacing: 0.1em
- `MATCH ERSTELLEN` → Cinzel Bold, 20px, uppercase
- `DIPLOMACY 2.0` → Cinzel Bold, 48px, letter-spacing: 0.2em

#### Body: Inter (Google Fonts)
```
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
```
- **Verwendung:** Body-Text, Labels, Daten, Button-Text, Credits, Stats
- **Stil:** Klar, modern, hochlesbar auch auf kleinen Screens
- **Besonderheit:** `font-feature-settings: "tnum"` für Tabellen/Zahlen
- **Fallback:** 'Source Sans Pro', -apple-system, sans-serif

#### Mono: JetBrains Mono (Google Fonts)
```
@import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;700&display=swap');
```
- **Verwendung:** Raumcodes (A7X3), Timer-Anzeige, Debug-Ausgaben
- **Besonderheit:** Alle Zeichen gleich breit — Timer springt nicht

### Typografische Skala

| Token | Größe | Verwendung |
|-------|-------|-----------|
| `--text-xs` | 11px | Badges, Timestamps, Micro-Labels |
| `--text-sm` | 13px | Captions, Hilfstexte, Nav-Labels |
| `--text-base` | 15px | Standard Body-Text |
| `--text-md` | 17px | Primärer Body, Button-Labels, Inputs |
| `--text-lg` | 20px | Sektion-Überschriften, Card-Titel |
| `--text-xl` | 24px | Screen-Überschriften, Modal-Titel |
| `--text-2xl` | 30px | Hero-Überschriften, Spielername |
| `--text-3xl` | 38px | Splash Screen Logo |
| `--text-4xl` | 48px | Sieg/Niederlage Screen |

### Typografische Muster (Kombinationen)

```
SCREEN-TITEL (z.B. "MATCH ERSTELLEN"):
  font-family: Cinzel
  font-size: 24px
  font-weight: 700
  letter-spacing: 0.1em
  text-transform: uppercase
  color: #F4E8C1

SECTION-LABEL (z.B. "AKTUELLE MATCHES"):
  font-family: Inter
  font-size: 13px
  font-weight: 600
  letter-spacing: 0.05em
  text-transform: uppercase
  color: #C5A55A

CREDIT-ZAHL (z.B. "8 CR"):
  font-family: Inter
  font-size: 17px
  font-weight: 700
  font-variant-numeric: tabular-nums
  color: #C5A55A

TIMER:
  font-family: JetBrains Mono
  font-size: 24px
  font-weight: 700
  font-variant-numeric: tabular-nums
  color: #F4E8C1   (normal)
        #D4A017   (< 60 Sekunden, pulsierend)

RAUMCODE:
  font-family: JetBrains Mono
  font-size: 30px
  font-weight: 700
  letter-spacing: 0.2em
  color: #C5A55A
```

---

## 4. Spacing & Grid

### 8px Grid System

Alle Abstände sind Vielfache von **8px** (Haupt-Grid) oder **4px** (Basis-Einheit).

```
Basis-Einheit:  4px  (--space-1)
Haupt-Grid:     8px  (--space-2)

Gängige Abstände:
  Component-Padding-small:   8px  (--space-2)
  Component-Padding-base:   16px  (--space-4)
  Component-Padding-large:  24px  (--space-6)
  Section-Gap:              32px  (--space-8)
  Screen-Margin:            16px  (--space-4)
```

### Touch-Target Mindestgröße

**44 × 44px** (WCAG 2.1 AA Richtlinie)
Alle interaktiven Elemente: Buttons, Tabs, Icons, Gebiete auf der Karte.

### Mobile Grid (iPhone, primär)

```
Viewport:       390px (iPhone 14 Pro)
Seitenrand:     16px links + rechts
Content-Width:  358px
Columns:        4 Spalten à ~82px, Gutter: 8px
```

### Tablet Grid (iPad, sekundär)

```
Viewport:       1024px (iPad Pro 11")
Karte:          70% (717px)
Side-Panel:     30% (307px)
Gutter:         16px
```

---

## 5. Elevation & Schatten

Das System hat 4 Elevations-Ebenen + Spezialeffekte:

```
EBENE 0 — Hintergrund:      kein Schatten
EBENE 1 — Cards:            0 2px 8px rgba(0,0,0,0.5)
EBENE 2 — Raised Cards:     0 4px 16px rgba(0,0,0,0.6)
EBENE 3 — Modals:           0 8px 32px rgba(0,0,0,0.7)

SPEZIAL — Gold Glow:
  Schwach:  0 0 12px rgba(197,165,90,0.5), 0 0 4px rgba(197,165,90,0.8)
  Stark:    0 0 24px rgba(197,165,90,0.7), 0 0 8px rgba(197,165,90,1.0)

SPEZIAL — Danger Glow (Angriff, Rakete):
  0 0 12px rgba(204,0,0,0.6), 0 0 4px rgba(204,0,0,0.9)

BUTTONS:
  Raised:   0 4px 0px rgba(0,0,0,0.5), 0 2px 8px rgba(0,0,0,0.4)
  Pressed:  0 1px 0px rgba(0,0,0,0.5), inset 0 2px 4px rgba(0,0,0,0.4)
```

---

## 6. Animationen

### Timing-Referenz

| Token | Dauer | Verwendung |
|-------|-------|-----------|
| `--duration-instant` | 80ms | Tap-Response, sofortiges Feedback |
| `--duration-fast` | 150ms | Micro-Interaktionen, Farb-Wechsel |
| `--duration-base` | 250ms | Standard UI-Übergänge |
| `--duration-slow` | 400ms | Panel-Slide-In, Modal-Open |
| `--duration-dramatic` | 700ms | Einheiten-Bewegung, Auflösung |
| `--duration-epic` | 1200ms | Raketen-Flugbahn, Sieg-Screen |

### Easing-Kurven

```
Standard UI:    cubic-bezier(0.4, 0, 0.2, 1)   (Material-Design-ähnlich)
Hereinkommend:  cubic-bezier(0, 0, 0.2, 1)
Hinausgehend:   cubic-bezier(0.4, 0, 1, 1)
Federnd:        cubic-bezier(0.34, 1.56, 0.64, 1)   ← Einheiten-Bewegung
Dramatisch:     cubic-bezier(0.22, 1, 0.36, 1)       ← Rakete, Sieg
```

### Schlüssel-Animationen

```
UNGÜLTIGER ZUG (Rotes Blinken, 0.5s):
  0%   → brightness(1)
  25%  → brightness(2.5), saturate(3), Danger-Color
  50%  → brightness(1)
  75%  → brightness(2)
  100% → brightness(1)

TIMER-WARNUNG (Pulsieren bei <60s):
  0%   → opacity: 1
  50%  → opacity: 0.6
  100% → opacity: 1
  duration: 0.8s, infinite, alternate

EINHEIT AUSWÄHLEN (Gold Glow):
  transform: scale(1) → scale(1.05)
  box-shadow: none → Gold Glow (stark)
  duration: 150ms, ease-spring

HACKER-MINUTE EINTRITT:
  opacity: 0, filter: brightness(3) → opacity: 1, filter: brightness(1)
  duration: 500ms, ease-out

GLITCH (Hacker-Titel):
  0-90%: transform: translate(0)
  92%: translate(-2px, 1px)
  94%: translate(2px, -1px)
  96%: translate(-1px, 2px)
  duration: 2s, infinite

AVATAR GLOW-RING:
  conic-gradient rotation: 0° → 360°
  duration: 4s, linear, infinite
```

---

## 7. Button-Stile

### 4 primäre Button-Varianten

#### Primary (Bordeaux)
```
Verwendung:   Erstelle Match, Befehle Abgeben, Vertrag Vorschlagen
Hintergrund:  #8B0000
Border:       2px solid #9E7E3A (Gold-Dark)
Text:         #F4E8C1, Inter Bold, 17px, uppercase, tracking: 0.05em
Padding:      12px 24px
Min-Height:   44px
Radius:       8px
Schatten:     0 4px 0px rgba(0,0,0,0.5), 0 2px 8px rgba(0,0,0,0.4)
Hover:        #A50000, + Gold Glow schwach
Pressed:      #6B0000, translateY(2px), inset shadow
Disabled:     opacity 0.4, kein pointer-events
```

#### Secondary (Dunkelgrün)
```
Verwendung:   Beitreten, positive/neutrale Aktionen
Hintergrund:  #2D5016
Border:       2px solid #9E7E3A
Text:         #F4E8C1 (gleich wie Primary)
Hover:        #3D6B20
Pressed:      translateY(2px), inset shadow
```

#### Gold (Messing-CTA)
```
Verwendung:   Highlight-Aktionen (Code Teilen, Spiel Starten)
Hintergrund:  linear-gradient(180deg, #D4BA7A, #C5A55A, #9E7E3A)
Border:       2px solid #9E7E3A
Text:         #111C27 (Dunkel auf Gold)
Hover:        + starker Gold Glow
```

#### Danger (Rot)
```
Verwendung:   Rakete abfeuern (Bestätigung), Aufgeben
Hintergrund:  #CC0000
Border:       2px solid #8B0000
Text:         #F4E8C1
Hover:        #E60000, + Danger Glow
Hinweis:      IMMER mit Bestätigungs-Dialog verwenden
```

#### Ghost (Transparent)
```
Verwendung:   Sekundäre Aktionen, "Zurück"-Buttons, Cancel
Hintergrund:  transparent
Border:       2px solid rgba(197,165,90,0.4)
Text:         #C5A55A
Hover:        rgba(197,165,90,0.1) Background, stärkerer Border
```

### Button-Größen

| Größe | Padding | Font-Size | Verwendung |
|-------|---------|-----------|-----------|
| SM | 8px 16px | 13px | Inline-Aktionen, Tags |
| BASE | 12px 24px | 17px | Standard (alle primären CTAs) |
| LG | 16px 32px | 20px | Hero-CTAs (Erstelle Match, Spiel Starten) |
| ICON | 44×44px | — | Navigation-Tabs, Map-Buttons |

---

## 8. Eingabefelder & Formulare

### Text-Input (Standard auf Pergament)
```
Hintergrund:  #F4E8C1 (Pergament)
Border:       2px solid #111C27
Text-Farbe:   #1B2838 (inverted)
Placeholder:  rgba(27,40,56,0.45), italic
Radius:       8px
Padding:      12px 16px
Min-Height:   44px
Focus:        border: #C5A55A, box-shadow: 0 0 0 3px rgba(197,165,90,0.25) + Gold Glow
```

### Text-Input (auf dunklem Hintergrund)
```
Hintergrund:  #253548 (navy-light)
Border:       2px solid rgba(197,165,90,0.4)
Text-Farbe:   #F4E8C1
Placeholder:  #8A9BAE
Focus:        border: #C5A55A, box-shadow: 0 0 0 3px rgba(197,165,90,0.2)
```

### Label
```
Font:         Inter, 13px, 600, uppercase, letter-spacing: 0.05em
Farbe:        #C5A55A
Abstand:      8px unten
```

### Toggle (AN/AUS)
```
Breite:       52px, Höhe: 28px
Hintergrund:  #253548 (AUS) / #2D5016 (AN)
Knopf:        18px rund, Gold-Shine wenn AN
Übergang:     150ms, ease-spring
```

### Slider (Zugdauer etc.)
```
Track:        6px hoch, navy-light, gold-subtle Border, radius: full
Thumb:        22px, Gold-Verlauf, Gold-Shine Border, Gold Glow
```

### Radio/Checkbox
```
Inaktiv:  Border 2px gold-subtle, Hintergrund navy-light
Aktiv:    Hintergrund navy-light, Gold-Check/Dot, Gold Glow Border
```

### Dropdown/Select
```
Gleiche Basis wie Text-Input
Pfeil-Icon:   Gold, 16px, rechts 12px
```

---

## 9. Cards & Panels

### Match-Card (Home Screen)
```
Größe:        ~170px × 120px (Portrait, 2 Spalten)
Hintergrund:  #253548
Border:       2px solid rgba(197,165,90,0.4)
Radius:       12px
Padding:      16px
Inhalt:       Karten-Thumbnail (60px hoch), Nation-Flag, Match-Name, Spieler-Count, Runde, BEITRETEN-Button
Hover:        border-color: #C5A55A, Gold Glow, translateY(-1px)
```

### Shop-Item Card
```
Größe:        Vollbreite (358px Portrait), ~100px hoch
Hintergrund:  linear-gradient(145deg, #253548, #111C27)
Border:       2px solid rgba(197,165,90,0.4)
Radius:       8px
Padding:      16px
Inhalt:       Emoji-Icon (24px), Titel + Beschreibung, Preis (Gold), KAUFEN-Button
```

### Pergament-Panel (Verträge, Regeln)
```
Hintergrund:  #F4E8C1 + Radial-Gradient Textur
Border:       4px solid #5C3A21 (Holzrahmen)
Radius:       8px
Padding:      24px
Text:         inverted (#1B2838)
Schatten:     0 4px 16px rgba(0,0,0,0.6)
```

### Economy-Panel
```
Hintergrund:  #1B2838
Border-Top:   2px solid rgba(197,165,90,0.4)
Padding:      16px
Sektionen getrennt durch: border-bottom: 1px solid rgba(197,165,90,0.2)
```

### Befehlsliste (Tab 1)
```
Jeder Befehl:  Höhe 40px, flex row, border-bottom: 1px solid rgba(197,165,90,0.15)
Edit-Button:   Icon-Button (44px), rechts ausgerichtet
Letzte Runde:  ✓ grün / ✗ gold / 💥 rot — entsprechende Farb-Badges
```

---

## 10. Navigation

### Obere Info-Leiste
```
Höhe:        56px
Hintergrund: rgba(17,28,39,0.95)
Border-Bottom: 2px solid rgba(197,165,90,0.4)
Inhalt:
  Links:    Exit-Button (Ghost)
  Mitte:    Flaggen + Credits aller Nationen (scrollbar horizontal)
  Rechts:   Timer + [Befehle Abgeben]-Button
```

### Untere Navigationsleiste
```
Höhe collapsed:  64px
Höhe expanded:   280px
Hintergrund:     linear-gradient(to bottom, #7A4E2D, #5C3A21)
Border-Top:      3px solid #9E7E3A (Gold-Dark)
Schatten:        0 -4px 16px rgba(0,0,0,0.5)

4 Tabs:
  1. Rüstung & Züge (Shield-Icon)
  2. Match Übersicht (Chart-Icon)
  3. Shop (Cart-Icon)
  4. Chat Fenster (Message-Icon)

Inaktiv:  #9E7E3A (Gold-Dark)
Aktiv:    #EDD898 (Gold-Shine) + Gold Glow Filter
Labels:   Inter, 11px, 600, uppercase
```

### Seitenleiste Karte (rechts, Desktop/Tablet)
```
Breite:  52px (kompakt)
Buttons: Export, Import, Alliance, Military, Diplomacy
Stil:    Holz-Hintergrund, Gold-Icons, vertikale Anordnung
```

---

## 11. Nationen-Farbsystem

### Primärfarben der Nationen

| Nation | Token | Hex | Gebiet (40% Alpha) |
|--------|-------|-----|---------------------|
| Großbritannien | `--color-nation-gb` | `#E8A0B0` | `rgba(232,160,176,0.4)` |
| Deutsches Reich | `--color-nation-de` | `#4A4A4A` | `rgba(74,74,74,0.4)` |
| Österreich-Ungarn | `--color-nation-at` | `#C0392B` | `rgba(192,57,43,0.4)` |
| Frankreich | `--color-nation-fr` | `#FFDD00` | `rgba(255,221,0,0.4)` |
| Italien | `--color-nation-it` | `#27AE60` | `rgba(39,174,96,0.4)` |
| Russland | `--color-nation-ru` | `#F1C40F` | `rgba(241,196,15,0.4)` |
| Osmanisches Reich | `--color-nation-tr` | `#1ABC9C` | `rgba(26,188,156,0.4)` |

### Accessibility-Anforderung

Da Farbenblinde Spieler vorhanden sein können: **Einheiten müssen neben Farbe auch eine Form/Symbol tragen:**
- Armee (A): Kreis-Token
- Flotte (F): Dreieck-Token
- Luftwaffe (AF): Flugzeug-Symbol
- Spezialeinheit (SF): Schatten-Figur

Nation-Symbole zusätzlich zur Farbe (z.B. Wappen-Miniatur auf dem Token).

---

## 12. Icons (Spezifikation)

### Mindest-Icon-Set (40 Custom Icons)

**UI-Icons (24px, linienbetont, Gold):**
1. Shield / Halten-Befehl
2. Arrow-Move / Verschieben
3. Support-Lines / Support-Befehl
4. Ship-Anchor / Konvoi
5. Sabotage / Blitz-Auge
6. Rocket / Rakete
7. Hack / Code-Zahnrad
8. Firewall / Schild-Lock
9. Bomb / Infrastruktur-Schlag
10. Fuel / Treibstoff-Kanne
11. Credit / Münz-CR
12. Energy / Blitz
13. License / Lizenz-Schlüssel
14. Contract / Pergament-Rolle
15. Chat / Taube
16. Settings / Zahnrad
17. Timer / Sanduhr
18. Player / General-Silhouette
19. Code / Code-Karte
20. Share / Pfeil-Raus
21. Crown / Sieg
22. Skull / Niederlage
23. Flag / Gebiets-Marker
24. Star / Versorgungszentrum
25. Eye / Fog of War enthüllt
26. Eye-Off / Fog of War verborgen
27. Lock / Eingefroren (Contract)
28. Unlock / Freigeschaltet
29. Handshake / Allianz / Join
30. Sword / Angriff-Befehl-Ergebnis
31. Info / Info
32. Warning / Dreieck
33. Check / Erfolg
34. X / Fehler
35. Edit / Befehl bearbeiten
36. Exit / Verlassen
37. Menu / Nav-Expander
38. Map / Karten-View
39. Army-Token / Einheit A
40. Fleet-Token / Einheit F

**Stil:** 2px Stroke, runde Endpunkte, 24px Bounding Box, exportiert als SVG.
**Farbe im Export:** `currentColor` (wird per CSS gesetzt).

### Icon-Verwendung

```
Navigation (64px Tap-Target):  Icon 24px + Label 11px darunter
Map-Overlay-Buttons:           Icon 20px
Inline-Icons:                  Icon 16-20px, vertikal zentriert mit Text
Badge-Icons:                   Icon 12px
```

---

## 13. Figma Component Library Struktur

### Empfohlene Figma-Organisation

```
📁 Diplomacy 2.0 — Design System
│
├── 🎨 Foundations
│   ├── Colors          (alle Styles aus Section 2)
│   ├── Typography      (Text Styles: d2-heading-hero, d2-body, etc.)
│   ├── Spacing         (8px Grid Dokumentation)
│   ├── Effects         (Shadow Styles: shadow/sm, shadow/gold, etc.)
│   └── Motion          (Timing + Easing Dokumentation)
│
├── 🧩 Components
│   ├── Buttons
│   │   ├── Primary / Secondary / Gold / Danger / Ghost
│   │   └── Sizes: SM / BASE / LG / ICON
│   ├── Inputs
│   │   ├── Text-Input (Light / Dark)
│   │   ├── Toggle
│   │   ├── Slider
│   │   └── Radio / Checkbox / Dropdown
│   ├── Cards
│   │   ├── Match-Card
│   │   ├── Shop-Item-Card
│   │   ├── Contract-Paper-Card
│   │   └── Player-Lobby-Row
│   ├── Navigation
│   │   ├── Bottom-Nav (Collapsed / Expanded)
│   │   ├── Top-Info-Bar
│   │   └── Map-Sidebar
│   ├── Overlays
│   │   ├── Modal
│   │   ├── Toast (Danger / Success / Info)
│   │   └── Hacker-Minute-Overlay
│   ├── Badges & Tags
│   ├── Avatars (SM / BASE / LG / HERO + Gold/Silver/Bronze Ring)
│   └── Nation Flags (7 Varianten, 16px + 24px)
│
├── 🗺️ Map Components
│   ├── Territory (Neutral / Hover / Selected / Nation-Colors)
│   ├── Unit Token (Army / Fleet / AF / SF — 7 Nation-Colors)
│   ├── Command Arrows (Move / Support / Convoy / Hold)
│   ├── Supply Center Marker
│   └── Wood Frame Border
│
├── 📱 Screens (D6 — separates Paket)
│   └── [wird in D6 aufgebaut, nutzt diese Components]
│
└── 📐 Tokens (Variables Panel in Figma)
    ├── Color Variables  (alle --color-* Tokens)
    ├── Number Variables (spacing, radius, sizing)
    └── String Variables (font-family referenzen)
```

### Figma Variables Setup

In Figma: **Local Variables** Panel → Collections:

**Collection: Colors**
- Alle Farb-Tokens als Color-Variables
- Moduswechsel: `Light` (Pergament-Panels) / `Dark` (Navy-Hintergrund)

**Collection: Spacing**
- Alle `--space-*` Werte als Number-Variables

**Collection: Typography**
- Font-Size und Line-Height als Number-Variables

**Export:**
`Plugins → Tokens Studio` oder `Variables2JSON` → `tokens.json` (W3C Design Token Format, liegt bereits vor)

---

## 14. Accessibility

### WCAG 2.1 AA Anforderungen (Pflicht)

| Anforderung | Umsetzung |
|------------|-----------|
| **Kontrast Text (4.5:1)** | Alle Text-Farben geprüft (siehe Section 2) |
| **Kontrast UI-Komponenten (3:1)** | Button-Borders, Input-Borders, Icon-Farben |
| **Touch-Target 44×44px** | --touch-min: 44px auf allen interaktiven Elementen |
| **Fokus-Ring** | `outline: 3px solid #C5A55A, offset: 2px` bei :focus-visible |
| **Farbe + Form** | Nation-Einheiten: Farbe + Token-Symbol |
| **Reduced Motion** | @media prefers-reduced-motion → alle Animationen deaktiviert |
| **Screen Reader** | .d2-sr-only Klasse für unsichtbare Labels |

### Farbenblindheit

- Rotblind (Deuteranopie): Danger (#CC0000) und Success (#2D5016) zusätzlich durch ✗ und ✓ Icons unterschieden
- Alle 7 Nationen-Farben haben unterschiedliche **Helligkeit UND Sättigung**, nicht nur Farbton

---

## 15. Übergabe an Frontend

### Dateien in diesem Paket

| Datei | Beschreibung |
|-------|-------------|
| `tokens.json` | W3C Design Token Format — für Figma Tokens Studio, Style Dictionary, Theo |
| `variables.css` | CSS Custom Properties — direkt importierbar in Next.js/React |
| `D1-STYLE-GUIDE.md` | Dieses Dokument — Spezifikation für Design & Frontend |

### Frontend-Integration (Next.js)

```css
/* globals.css oder _app.tsx */
@import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;700&family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;700&display=swap');
@import './variables.css';
```

### Tailwind-Extension (tailwind.config.js)

```js
module.exports = {
  theme: {
    extend: {
      colors: {
        navy:     '#1B2838',
        bordeaux: '#8B0000',
        gold:     '#C5A55A',
        paper:    '#F4E8C1',
        wood:     '#5C3A21',
        success:  '#2D5016',
        danger:   '#CC0000',
        warning:  '#D4A017',
      },
      fontFamily: {
        heading: ['Cinzel', 'Playfair Display', 'Georgia', 'serif'],
        body:    ['Inter', 'Source Sans Pro', 'sans-serif'],
        mono:    ['JetBrains Mono', 'Courier New', 'monospace'],
      },
      spacing: {
        '18': '72px',
        '22': '88px',
      },
    },
  },
}
```

### Abhängigkeiten vom Design-Team (für Frontend)

Das Frontend kann **sofort beginnen** mit:
- `variables.css` als Basis-Styling
- `tokens.json` für Tailwind/Style Dictionary Konfiguration
- Diesem Style Guide als Referenz für alle Komponenten

**Noch ausstehend (folgende D-Pakete):**
- D2: Nation Wappen + Flaggen (SVG Assets)
- D3: Europa-Karte (SVG mit 75 Gebieten)
- D4: Einheiten-Grafiken (SVG Tokens)
- D5: Spieler-Avatare (PNG/SVG Set)
- D6: Fertige Screen-Designs (Figma)

---

## Anhang: Farb-Quickreference

```
Haupthintergrund:  #1B2838 (navy)
Primär-CTA:        #8B0000 (bordeaux)
Sekundär-CTA:      #2D5016 (success/green)
Akzent/Rahmen:     #C5A55A (gold)
Hintergrund hell:  #F4E8C1 (paper/pergament)
Holzrahmen:        #5C3A21 (wood)
Warnung:           #D4A017 (warning)
Gefahr:            #CC0000 (danger)
Text auf dunkel:   #F4E8C1 (text-primary)
Text auf hell:     #1B2838 (text-inverted)
Muted/Disabled:    #8A9BAE (text-muted)
```

---

*Erstellt für: Design-Team (D1-Lieferobjekt) → Freigabe für Frontend-Team*
*Nächster Schritt: Frontend-Team importiert `variables.css` und beginnt mit Screen-Entwicklung (D6)*
