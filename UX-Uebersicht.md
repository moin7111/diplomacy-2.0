# Diplomacy 2.0 - User Experience Übersicht

## 1. App-Flow (Gesamtübersicht)

```
┌──────────────┐     ┌──────────────┐     ┌──────────────────────┐
│  SPLASH      │────▸│  LOGIN /     │────▸│  HAUPTBILDSCHIRM     │
│  SCREEN      │     │  REGISTER    │     │  (Home)              │
└──────────────┘     └──────────────┘     └──────────┬───────────┘
                                                      │
                          ┌───────────────────────────┼──────────────────┐
                          │                           │                  │
                   ┌──────▾──────┐            ┌───────▾──────┐  ┌───────▾──────┐
                   │  SPIEL      │            │  SPIEL       │  │  SETTINGS    │
                   │  ERSTELLEN  │            │  BEITRETEN   │  │              │
                   └──────┬──────┘            └───────┬──────┘  └──────────────┘
                          │                           │
                          └───────────┬───────────────┘
                                      │
                              ┌───────▾───────┐
                              │  LOBBY /      │
                              │  WARTERAUM    │
                              └───────┬───────┘
                                      │
                              ┌───────▾───────┐
                              │  SPIELFELD    │
                              │  (Game View)  │
                              └───────┬───────┘
                                      │
              ┌───────────┬───────────┼───────────┬────────────┐
              │           │           │           │            │
       ┌──────▾────┐ ┌────▾────┐ ┌────▾────┐ ┌────▾────┐ ┌────▾────┐
       │  KARTE &  │ │ CHAT    │ │ SHOP    │ │ ECONOMY │ │ MATCH   │
       │  BEFEHLE  │ │ FENSTER │ │         │ │ PANEL   │ │ ÜBERSICHT│
       └───────────┘ └─────────┘ └─────────┘ └─────────┘ └─────────┘
```

---

## 2. Screen-by-Screen Beschreibung

### 2.1 Splash Screen & Onboarding

```
┌─────────────────────────┐
│                         │
│     DIPLOMACY 2.0       │
│       [Logo]            │
│                         │
│   "Hybride Kriegs-      │
│    führung beginnt"      │
│                         │
│   ■■■■□□ Loading...     │
│                         │
└─────────────────────────┘
```

- Animiertes Logo beim App-Start
- Kurzes Intro (beim ersten Mal): Tutorial-Slides

### 2.2 Login / Registrierung

```
┌─────────────────────────┐
│                         │
│     DIPLOMACY 2.0       │
│                         │
│  ┌───────────────────┐  │
│  │ E-Mail            │  │
│  └───────────────────┘  │
│  ┌───────────────────┐  │
│  │ Benutzername      │  │
│  └───────────────────┘  │
│  ┌───────────────────┐  │
│  │ Passwort          │  │
│  └───────────────────┘  │
│                         │
│  [■■■ REGISTRIEREN ■■■] │
│                         │
│  Bereits ein Konto?     │
│  → Einloggen            │
│                         │
└─────────────────────────┘
```

**UX-Prinzipien:**
- Minimale Felder (E-Mail, Username, Passwort)
- Ein-Klick-Wechsel zwischen Login und Registrierung
- Social Login optional (Google, Apple)

### 2.3 Hauptbildschirm (Home)

```
┌─────────────────────────────────────┐
│ ⚙                          🏆 📊  │  ← Settings | Achievements | Stats
│                                     │
│        ┌─────────────────┐          │
│        │  GENERAL MAX ✏  │          │  ← Spielername (editierbar)
│        └─────────────────┘          │
│           ┌───────────┐             │
│          ╱             ╲            │
│         │    [SPIELER   │           │  ← Großes rundes Spieler-Icon
│         │     ICON]     │           │     (klickbar → Icon-Auswahl)
│          ╲             ╱            │
│           └───────────┘             │
│                                     │
│  ┌──────────────┐ ┌──────────────┐  │
│  │ ➕ ERSTELLE   │ │ 🔑 CODE:XXXX │  │  ← Spiel erstellen / beitreten
│  │  EIN MATCH   │ │ BEITRETEN    │  │
│  └──────────────┘ └──────────────┘  │
│                                     │
│ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─  │
│                                     │
│    AKTUELLE MATCHES                 │
│  ┌─────────────┐ ┌─────────────┐   │
│  │🇦🇹Europa1914│ │🇫🇷Mittelmeer │   │
│  │  👥4/7      │ │  👥6/7      │   │
│  │  Runde 3    │ │  Runde 3    │   │
│  │ [BEITRETEN] │ │ [BEITRETEN] │   │
│  └─────────────┘ └─────────────┘   │
│  ┌─────────────┐ ┌─────────────┐   │
│  │  Europa     │ │  Europa1914 │   │
│  │  👥4/7      │ │  👥6/7      │   │
│  │ [BEITRETEN] │ │ [BEITRETEN] │   │
│  └─────────────┘ └─────────────┘   │
│                                     │
└─────────────────────────────────────┘
```

**UX-Prinzipien:**
- Spieler-Identität steht im Zentrum (großes Icon + Name)
- Zwei prominente CTAs: Erstellen & Beitreten
- Scrollbarer Bereich unten für laufende/offene Matches
- Match-Karten zeigen: Flagge, Name, Spieleranzahl, Runde, Status

**Interaktionen:**
- **Spieler-Icon klicken** → Overlay mit Icon-Galerie öffnet sich
- **Name klicken** → Inline-Edit des Spielernamens
- **"Erstelle ein Match"** → Konfigurationsscreen
- **"Code: XXXX"** → Eingabefeld für Raumcode + "Beitreten" Button
- **Match-Karte klicken** → Direkt ins Spiel / Lobby

### 2.4 Spiel erstellen (Konfiguration)

```
┌─────────────────────────────────────┐
│ ← Zurück     MATCH ERSTELLEN        │
│                                     │
│  Spielname                          │
│  ┌───────────────────────────────┐  │
│  │ Europa 1914                   │  │
│  └───────────────────────────────┘  │
│                                     │
│  Spielmodus                         │
│  ○ Klassisch (nur A + F)            │
│  ● Hybrid (alle Einheiten)          │
│                                     │
│  Raketen                            │
│  [═══════●] AN                      │
│                                     │
│  Zugdauer (Frühling)                │
│  [═══●═══] 10 Min                   │
│                                     │
│  Zugdauer (Herbst)                  │
│  [══●════] 7 Min                    │
│                                     │
│  Rückzugsdauer                      │
│  [●══════] 3 Min                    │
│                                     │
│  Baudauer (Winter)                  │
│  [=●═════] 5 Min                    │
│                                     │
│  [■■■ SPIEL ERSTELLEN ■■■]         │
│                                     │
│  Raumcode wird nach Erstellung      │
│  generiert und kann geteilt werden  │
│                                     │
└─────────────────────────────────────┘
```

**Nach Erstellung:**
- Raumcode wird groß angezeigt
- "Teilen"-Button (WhatsApp, SMS, Copy-to-Clipboard)
- Weiterleitung in Lobby/Warteraum

### 2.5 Lobby / Warteraum

```
┌─────────────────────────────────────┐
│ ← Zurück    EUROPA 1914   Code:A7X │
│                                     │
│    Spieler (3/7)                    │
│  ┌─────────────────────────────┐    │
│  │ 🦁 General Max       HOST  │    │
│  │ 🐺 Kaiser Wilhelm          │    │
│  │ 🦅 Czar Nikolaus           │    │
│  │ ···  Warte auf Spieler ··· │    │
│  │ ···  Warte auf Spieler ··· │    │
│  │ ···  Warte auf Spieler ··· │    │
│  │ ···  Warte auf Spieler ··· │    │
│  └─────────────────────────────┘    │
│                                     │
│  Länderwahl: (nach Beitritt aller)  │
│  ○ Zufällig  ● Wählen              │
│                                     │
│  [■■■ SPIEL STARTEN ■■■]           │
│  (nur Host, wenn alle bereit)       │
│                                     │
│  [📤 CODE TEILEN]                   │
│                                     │
└─────────────────────────────────────┘
```

---

## 3. Spielfeld (Game View) - Hauptscreen

### 3.1 Layout-Übersicht

```
┌─────────────────────────────────────────────────┐
│ [Exit]  Info-Leiste (Werte aller Länder)  Timer │
│         "Wähle von jedem Land ein Land,  ⏱10:00│
│          nur aus deinem werden Recht,           │
│          Gold und Resourcen"         [Aufgeben] │
├─────────────────────────────────────────────────┤
│                                                 │
│                                    ┌──────────┐ │
│                                    │ EXPORT   │ │
│                                    │ IMPORT   │ │
│            E U R O P A             │ ALLIANCE │ │
│            K A R T E               │ MILITARY │ │
│         (interaktiv, zoom,         │ DIPLOMACY│ │
│          pan, tap auf Gebiete)     └──────────┘ │
│                                                 │
│                                                 │
│                                                 │
│                                                 │
│               ┌────┐                            │
│               │ ↓  │ ← ein/ausklappbar          │
├───────────────┴────┴────────────────────────────┤
│                                                 │
│  ┌──────────┐┌──────────┐┌──────────┐┌────────┐│
│  │ Rüstung  ││  Match   ││  Shop    ││ Chat   ││
│  │ & Züge   ││ Übersicht││          ││ Fenster││
│  └──────────┘└──────────┘└──────────┘└────────┘│
└─────────────────────────────────────────────────┘
```

### 3.2 Obere Info-Leiste

```
┌─────────────────────────────────────────────────┐
│ 🇬🇧12CR 🇩🇪8CR 🇫🇷10CR 🇮🇹6CR 🇷🇺9CR 🇹🇷5CR 🇦🇹7CR │
│                                    ⏱ 07:23     │
│                              [BEFEHLE ABGEBEN]  │
└─────────────────────────────────────────────────┘
```

- Zeigt Credits/Ressourcen aller sichtbaren Nationen
- Timer mit Countdown
- "Befehle Abgeben"-Button (wird nach Abgabe zu "Abgegeben ✓")

### 3.3 Karten-Interaktion

**Basis-Gesten:**
- **Pinch-to-Zoom** → Karte vergrößern/verkleinern
- **Pan/Drag** → Karte verschieben

**Befehls-Gesten (Zusammenfassung):**

| Geste | Aktion | Ergebnis |
|-------|--------|----------|
| **Tap** auf eigenes Gebiet (mit Einheit) | **Auswählen** | Gebiet wird farblich hinterlegt, Einheit ist "aktiv" |
| **Tap** auf anderes Gebiet (nach Auswahl) | **Verschieben / Angreifen** | Pfeil: Eigenes Gebiet → Zielgebiet |
| **Tap** nochmal auf eigenes Gebiet (nach Auswahl) | **Halten** | Hold-Symbol erscheint auf der Einheit |
| **Tap** auf Support-Button ODER **Long-Press** auf Zielgebiet | **Support-Modus** | Support-Linien werden sichtbar |
| Support-Modus + **Tap** auf angegriffenes Gebiet | **Support-Angriff** | Gestrichelte Linie zum Angriffsfeld |
| **Extra-langes Halten** (2s+) auf Zielgebiet | **Convoy-Modus** | Wechselt von Support → Convoy (gepunktete Route) |
| **Long-Press** auf eigene SF ODER **Tap** + Sabotage-Button | **Sabotage** | Sabotage-Befehl auf aktuelles Feld/VZ |

**Detaillierter Gesten-Flow:**

```
VERSCHIEBEN / ANGREIFEN:
┌─────────────────────────────────────────────────────────────┐
│ 1. Tap auf eigene Armee in Wien                             │
│    → Wien wird farblich hinterlegt (ausgewählt)             │
│    → Erlaubte Zielfelder leuchten dezent auf                │
│                                                             │
│ 2. Tap auf Zielgebiet (z.B. Triest)                        │
│    → Pfeil erscheint: Wien → Triest                         │
│    → Befehl: "A Wien → Triest"                              │
│                                                             │
│ ⚠ Wenn Zug nicht möglich: Feld blinkt ROT + Fehlermeldung  │
│   z.B. "Nicht erreichbar" oder "Feld nicht adjacent"         │
└─────────────────────────────────────────────────────────────┘

HALTEN:
┌─────────────────────────────────────────────────────────────┐
│ 1. Tap auf eigene Armee in Wien                             │
│    → Wien wird farblich hinterlegt                          │
│                                                             │
│ 2. Tap NOCHMAL auf Wien                                     │
│    → Hold-Symbol (Schild-Icon) erscheint                    │
│    → Befehl: "A Wien hält"                                  │
└─────────────────────────────────────────────────────────────┘

SUPPORT:
┌─────────────────────────────────────────────────────────────┐
│ 1. Tap auf eigene Armee in Budapest                         │
│    → Budapest wird farblich hinterlegt                      │
│                                                             │
│ 2a. Tap auf [SUPPORT]-Button in der Toolbar                 │
│     ODER                                                    │
│ 2b. Long-Press (~0.5s) auf das Gebiet das man supporten will│
│     → Support-Modus aktiviert (visuelles Feedback: Icon)    │
│                                                             │
│ 3. Tap auf das Zielgebiet des Angriffs (z.B. Triest)       │
│    → Gestrichelte Linie: Budapest ⇢ Wien → Triest          │
│    → Befehl: "A Budapest S A Wien → Triest"                 │
│                                                             │
│ ★ Für Support-Hold: In Schritt 3 einfach auf das           │
│   zu haltende Gebiet tippen (statt Angriffsfeld)            │
│                                                             │
│ ⚠ Wenn Support nicht möglich: Fehlermeldung                 │
│   z.B. "Kann Triest nicht erreichen"                        │
└─────────────────────────────────────────────────────────────┘

CONVOY:
┌─────────────────────────────────────────────────────────────┐
│ 1. Tap auf eigene Flotte in der Nordsee                     │
│    → Nordsee wird farblich hinterlegt                       │
│                                                             │
│ 2. EXTRA LANG halten (~2s) auf das Zielgebiet               │
│    → Erst wechselt es in Support-Modus (~0.5s)              │
│    → Dann wechselt es in CONVOY-Modus (~2s)                 │
│    → Visuell: Icon wechselt von Support → Convoy            │
│    → Convoy-Route wird gepunktet angezeigt                  │
│                                                             │
│ ⚠ Nur für Flotten in Seegebieten möglich                    │
└─────────────────────────────────────────────────────────────┘

SABOTAGE (nur SF):
┌─────────────────────────────────────────────────────────────┐
│ 1a. Long-Press auf eigene SF-Einheit                        │
│     ODER                                                    │
│ 1b. Tap auf eigene SF + Tap auf [SABOTAGE]-Button           │
│                                                             │
│ 2. Sabotage-Modus aktiv:                                    │
│    → Wähle Ziel: Feindliche Einheit im Feld (Support-Cut)   │
│    → ODER: VZ auswählen (Infrastruktur-Sabotage)            │
│                                                             │
│ ⚠ Wenn keine Sabotage möglich: Fehlermeldung                │
└─────────────────────────────────────────────────────────────┘
```

**Ungültige Züge - Fehlerfeedback:**
- Feld blinkt **rot** auf (kurze Animation, ~0.5s)
- Toast-Nachricht am unteren Rand: "Zug nicht möglich: [Grund]"
- Gründe: "Nicht adjacent", "Flotte kann nicht auf Land", "Keine Einheit ausgewählt", "Kein Treibstoff", etc.
- Befehl wird NICHT gesetzt → Spieler kann sofort neu versuchen

**Visuelle Feedback-Elemente auf der Karte:**
- **Farbliche Hinterlegung:** Ausgewähltes eigenes Gebiet leuchtet in Nation-Farbe
- **Pfeile (solid):** Zeigen geplante Bewegungen/Angriffe
- **Stützlinien (gestrichelt):** Zeigen Support-Befehle
- **Konvoi-Route (gepunktet):** Zeigt Konvoi-Ketten über See
- **Hold-Symbol (Schild):** Zeigt Halte-Befehle
- **Raketen-Icon:** Zeigt Raketenziel an (wenn gekauft)
- **Fog of War:** Eigene SF als halbtransparente Icons
- **Farbcodierung:** Jedes Land hat eigene Farbe für Gebiete & Einheiten
- **Rotes Blinken:** Ungültiger Zug (sofortiges Feedback)

### 3.4 Untere Navigationsleiste (ein/ausklappbar)

Die untere Leiste ist **ein- und ausklappbar** (Pfeil-Button). Im eingeklappten Zustand sieht man nur die 4 Tab-Icons.

#### Tab 1: Rüstung & Züge
```
┌─────────────────────────────────────┐
│  DEINE BEFEHLE          Phase: FR  │
│                                     │
│  A Wien → Triest          [✏ Edit] │
│  F Triest hält             [✏ Edit]│
│  A Budapest S Wien→Tri     [✏ Edit]│
│  AF München → Berlin       [✏ Edit]│
│  SF [GETARNT] Sabotage Kie [✏ Edit]│
│                                     │
│  RÜCKZUGSMÖGLICHKEITEN:             │
│  (erscheint nur in Rückzugsphase)   │
│  F Triest kann nach: ALB, ADR, VEN │
│                                     │
│  ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─   │
│  LETZTE RUNDE (Ergebnisse):        │
│  ✓ A Wien → Triest (erfolgreich)   │
│  ✗ F Lon → NTH (Patt)             │
│  💥 Rakete auf MOS (Treffer)       │
└─────────────────────────────────────┘
```

#### Tab 2: Match-Übersicht / Economy Panel
```
┌─────────────────────────────────────┐
│  WIRTSCHAFTS-PANEL                  │
│                                     │
│  Dein Land: 🇩🇪 Deutsches Reich     │
│  Credits: 8 CR                      │
│  VZ kontrolliert: 5/18              │
│  Buff: High-Tech Marktführer ✓      │
│                                     │
│  ─ RESSOURCEN ─                     │
│  Energie: 2 Einheiten (Import)      │
│  Lizenzen: 1 Aktiv (Türkei)        │
│                                     │
│  ─ VERTRÄGE ─                       │
│  📋 Öl-Import RU → DE (2 Runden)   │
│  📋 Kredit von GB (4CR/Jahr)       │
│  [+ NEUEN VERTRAG ERSTELLEN]        │
│                                     │
│  ─ ALLE LÄNDER ─                    │
│  🇬🇧 GB: 12CR, 6VZ               │
│  🇫🇷 FR: 10CR, 5VZ               │
│  🇷🇺 RU: 9CR, 4VZ, 9⚡           │
│  ...                                │
└─────────────────────────────────────┘
```

#### Tab 3: Shop
```
┌─────────────────────────────────────┐
│  TECH-SHOP            Dein CR: 8    │
│                                     │
│  ┌───────────────────────────────┐  │
│  │ 🔓 STANDARD-HACK      3 CR   │  │
│  │ Enthüllt 1 feindlichen Befehl │  │
│  │ + 60s Anpassungszeit          │  │
│  │                    [KAUFEN]   │  │
│  └───────────────────────────────┘  │
│  ┌───────────────────────────────┐  │
│  │ 🛡 FIREWALL            1 CR   │  │
│  │ Blockiert alle Hacks gegen    │  │
│  │ dich diese Phase              │  │
│  │                    [KAUFEN]   │  │
│  └───────────────────────────────┘  │
│  ┌───────────────────────────────┐  │
│  │ 💣 INFRASTRUKTUR-SCHLAG 4 CR │  │
│  │ Sabotiert 1 VZ für 1 Jahr    │  │
│  │                    [KAUFEN]   │  │
│  └───────────────────────────────┘  │
│  ┌───────────────────────────────┐  │
│  │ ⛽ SCHWARZMARKT-FUEL   3 CR   │  │
│  │ 1 AF-Flug ohne Öl-Vertrag    │  │
│  │                    [KAUFEN]   │  │
│  └───────────────────────────────┘  │
│  ┌───────────────────────────────┐  │
│  │ 🚀 RAKETE            15 CR   │  │
│  │ Zerstört alles im Zielfeld   │  │
│  │ (Benötigt Seltene-Erden-Liz.)│  │
│  │                    [KAUFEN]   │  │
│  └───────────────────────────────┘  │
└─────────────────────────────────────┘
```

#### Tab 4: Chat-Fenster
```
┌─────────────────────────────────────┐
│  DIPLOMATIE               [+Neu]   │
│                                     │
│  Gespräche:                         │
│  ┌───────────────────────────────┐  │
│  │ 🇫🇷 Frankreich          2m ⬤ │  │
│  │ "Lass uns zusammenarbeiten..."│  │
│  └───────────────────────────────┘  │
│  ┌───────────────────────────────┐  │
│  │ 🇷🇺 Russland            5m   │  │
│  │ "Ich brauche Öl-Deal..."     │  │
│  └───────────────────────────────┘  │
│  ┌───────────────────────────────┐  │
│  │ 🇬🇧🇫🇷🇩🇪 Dreier-Allianz 1h │  │
│  │ "Treffen wir uns..."         │  │
│  └───────────────────────────────┘  │
│                                     │
│  [Nachricht eingeben...]     [➤]   │
└─────────────────────────────────────┘
```

---

## 4. Spezial-Screens

### 4.1 Hacker-Minute (Overlay)

```
┌─────────────────────────────────────┐
│         ⚠ HACKER-MINUTE ⚠          │
│              ⏱ 00:47                │
│                                     │
│  ENTHÜLLTER BEFEHL:                 │
│  ┌───────────────────────────────┐  │
│  │ 🇫🇷 Frankreich:              │  │
│  │ A Paris → Burgund             │  │
│  └───────────────────────────────┘  │
│                                     │
│  Du kannst deine Befehle jetzt     │
│  noch anpassen!                     │
│                                     │
│  [BEFEHLE ANPASSEN]  [BEIBEHALTEN] │
│                                     │
└─────────────────────────────────────┘
```

### 4.2 Smart Contract erstellen

```
┌─────────────────────────────────────┐
│ ← Zurück    NEUER VERTRAG           │
│                                     │
│  Vertragspartner:                   │
│  [▼ Russland auswählen       ]     │
│                                     │
│  Ich biete:                         │
│  [▼ Credits] Menge: [5 CR    ]     │
│                                     │
│  Ich erhalte:                       │
│  [▼ Energie] Menge: [2 Einh. ]     │
│  Dauer: [▼ 3 Runden          ]     │
│                                     │
│  Bedingung:                         │
│  [▼ Keine / Gebietskontrolle /     │
│     Befehlsausführung / ...]       │
│                                     │
│  Frist:                             │
│  [▼ Herbst 1903               ]    │
│                                     │
│  [■■■ VERTRAG VORSCHLAGEN ■■■]     │
│                                     │
└─────────────────────────────────────┘
```

### 4.3 Befehlsauflösung (Animation)

Nach Ablauf der Hacker-Minute wird die Befehlsauflösung als **kurze Animation** auf der Karte dargestellt:

```
Phase 1: 🚀 Raketeneinschläge (Explosions-Animation)
Phase 2: 🔇 Sabotage-Aktionen (Glitch-Effekt)
Phase 3: ➡️ Einheiten bewegen sich gleichzeitig (Pfeil-Animationen)
Phase 4: ⚔️ Konflikte werden aufgelöst (Kampf-Animation)
Phase 5: 📊 Ergebnis-Zusammenfassung einblenden
```

---

## 5. Responsive Design

### 5.1 iPhone (Portrait - Primär)

- Web-App im Safari/Chrome Browser (PWA-fähig, "Add to Homescreen")
- Karte nimmt den Großteil des Bildschirms ein
- Untere Leiste: 4 Tabs als Icons (minimiert)
- Wischen nach oben: Tabs expandieren zum Vollbild-Panel
- Info-Leiste oben: Kompakt (nur eigene CR + Timer)
- Touch-optimiert: Große Tap-Targets, Gesture-Support

### 5.2 iPad (Landscape - Sekundär)

- Karte links (70% der Breite)
- Side-Panel rechts (30%) mit Tabs: Befehle, Economy, Shop, Chat
- Info-Leiste oben: Alle Länder sichtbar
- Nutzt die größere Fläche für mehr Detail auf der Karte

---

## 6. Design-Richtung

Basierend auf den Design-Ideen:

### 6.1 Visueller Stil

- **Epoche:** Militärisch-historisch (WW1-Ära) mit modernen Tech-Elementen
- **Farbpalette:** Dunkle, warme Erdtöne (Braun, Gold, Dunkelblau, Bordeaux)
- **Karte:** Vintage-Weltkarten-Stil mit modernen interaktiven Elementen
- **Einheiten:** 3D-gerenderte Miniaturen (Generäle, Schiffe, Flugzeuge)
- **UI-Rahmen:** Holz- und Messing-Texturen, Pergament-Hintergründe
- **Buttons:** Geprägt, mit Metallrand, taktile Haptik
- **Typografie:** Serifenschrift für Überschriften, Sans-Serif für Daten

### 6.2 Animations-Konzept

- **Karten-Übergang:** Sanftes Zoom beim Betreten eines Spiels
- **Befehlseingabe:** Einheit "leuchtet auf" bei Auswahl
- **Befehlsauflösung:** Einheiten "marschieren" zu Zielfeldern
- **Rakete:** Dramatische Flugbahn-Animation + Explosion
- **Sabotage:** Glitch/Störsignal-Effekt auf betroffener Einheit
- **Timer:** Pulsiert rot bei letzter Minute

### 6.3 Sound-Design

- **Ambient:** Leiser Militärmarsch / Strategiemusik
- **Befehlsabgabe:** Siegelstempel-Geräusch
- **Rakete:** Abschuss + Einschlag
- **Chat-Nachricht:** Diplomatenkurier-Glocke
- **Timer-Warnung:** Trommelwirbel bei letzten 30 Sekunden

---

## 7. Accessibility & UX-Qualität

| Prinzip | Umsetzung |
|---------|-----------|
| **Farbenblindheit** | Einheiten haben sowohl Farbe als auch Symbol/Form |
| **Große Touch-Targets** | Min. 44x44px für alle interaktiven Elemente |
| **Offline-Toleranz** | Befehle werden lokal gecached, bei Reconnect synchronisiert |
| **Undo** | Befehle können bis zur Abgabe jederzeit geändert werden |
| **Bestätigungsdialoge** | Kritische Aktionen (Rakete, Aufgeben) erfordern Doppelbestätigung |
| **Tutorial** | Interaktives Tutorial-Match gegen Bot beim ersten Spielstart |
