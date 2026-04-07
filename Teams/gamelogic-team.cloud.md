# Team: Game Logic & Regelwerk

## Teamverantwortung

Das Game-Logic-Team implementiert die gesamte Spielmechanik: Befehlsauflösung, Kartenlogik, Einheiten-Regeln, Rückzüge, Aufbau, Siegbedingungen und die neuen Diplomacy-2.0-Mechaniken (Luftwaffe, SF, Raketen).

---

## Tech-Stack

| Technologie | Zweck |
|-------------|-------|
| **TypeScript** | Spiellogik als eigenständiges Modul/Library |
| **Jest** | Unit-Tests für alle Regelwerke |
| **Graph-Datenstruktur** | Karten-Adjacency (Gebiete + Verbindungen) |

Die Game-Logic wird als **eigenständiges TypeScript-Modul** gebaut, das vom Backend importiert wird. Keine eigene Datenbank - arbeitet mit In-Memory State.

---

## Aufgabenpakete

### Paket G1: Karten-Datenmodell
**Priorität:** Phase 1 (MVP) - Kritischer Pfad

- [ ] Territory-Interface definieren:
  ```typescript
  interface Territory {
    id: string;           // z.B. "VIE", "BUD", "NTH"
    name: string;         // "Wien", "Budapest", "Nordsee"
    type: 'land' | 'coast' | 'sea';
    isSupplyCenter: boolean;
    homeNation: Nation | null;    // Heimat-VZ
    isCapital: boolean;           // Hauptstadt?
    coasts?: ('nc' | 'sc' | 'ec')[];  // Doppelküsten
    adjacency: string[];  // IDs angrenzender Gebiete
    armyAccessible: boolean;
    fleetAccessible: boolean;
  }
  ```
- [ ] Kompletten Adjacency-Graph der Diplomacy-Karte implementieren
- [ ] Alle 75 Gebiete mit korrekten Verbindungen
- [ ] Alle 34 Versorgungszentren markieren
- [ ] Sonderregeln: Doppelküsten (BUL, STP, SPA), Gibraltar, Kiel, Konstantinopel
- [ ] Dänemark-Schweden Landverbindung
- [ ] Validierungstests: Kein Gebiet ohne Verbindung, alle VZ korrekt

### Paket G2: Einheiten-System
**Priorität:** Phase 1 (MVP)

- [ ] Unit-Interface:
  ```typescript
  interface Unit {
    id: string;
    type: 'army' | 'fleet' | 'airforce' | 'special_forces';
    nation: Nation;
    territory: string;
    isCloaked?: boolean;   // nur SF
    energy?: number;       // nur AF
  }
  ```
- [ ] Armee: Bewegt sich auf Land, besetzt VZ
- [ ] Flotte: Bewegt sich auf See/Küste, besetzt VZ, kann konvoyen
- [ ] Bewegungsvalidierung: Ist Zielfeld erreichbar? Richtiger Gebietstyp?
- [ ] 1 Einheit pro Feld (Ausnahme: SF im Schatten-Modus)

### Paket G3: Befehls-Parser & Validierung
**Priorität:** Phase 1 (MVP)

- [ ] Order-Interface:
  ```typescript
  interface Order {
    unitId: string;
    type: 'hold' | 'move' | 'support' | 'convoy' | 'sabotage';
    target?: string;           // Zielgebiet (move)
    supportUnit?: string;      // Unterstützte Einheit
    supportTarget?: string;    // Wohin wird unterstützt
    convoyFrom?: string;       // Konvoi-Start
    convoyTo?: string;         // Konvoi-Ziel
  }
  ```
- [ ] Hold-Validierung: Immer erlaubt
- [ ] Move-Validierung: Zielgebiet muss adjacent sein + richtiger Typ
- [ ] Support-Validierung: Unterstützer muss selbst ins Zielgebiet ziehen können
- [ ] Convoy-Validierung: Flotte in See, Armee an Küste, zusammenhängende Kette
- [ ] Ungültiger Befehl → automatisch Hold
- [ ] Fehlender Befehl → automatisch Hold

### Paket G4: Befehlsauflösungs-Engine (Kern-Algorithmus)
**Priorität:** Phase 1 (MVP) - Kritischster Pfad

- [ ] Implementiere den DATC (Diplomacy Adjudicator Test Cases) konformen Resolver:
  ```
  Auflösungs-Reihenfolge:
  1. Berechne Stärke jeder Einheit (1 + Anzahl Support)
  2. Support-Cuts: Angegriffener Supporter verliert Support
  3. Konflikte: Stärkste Einheit gewinnt
  4. Patt: Gleiche Stärke → niemand bewegt sich
  5. Dislodged: Vertriebene Einheiten markieren
  6. Konvoi-Unterbrechung: Wenn Konvoi-Flotte vertrieben → Konvoi scheitert
  ```
- [ ] Head-to-Head Battles (2 Einheiten tauschen Platz → Patt, außer Ringtausch)
- [ ] Circular Movement (Ringtausch mit 3+ Einheiten → erlaubt)
- [ ] Convoy Paradox korrekt handhaben
- [ ] Self-Dislodgement verhindern (eigene Einheit kann sich nicht selbst vertreiben)
- [ ] Support-Cut: Angriff auf Supporter schneidet Support (auch ohne Vertreibung)
- [ ] DATC-Testsuite als Regressionstests implementieren (200+ Testfälle)

### Paket G5: Rückzugs-Logik
**Priorität:** Phase 1 (MVP)

- [ ] Vertriebene Einheiten identifizieren
- [ ] Erlaubte Rückzugsfelder berechnen:
  - Adjacent zum aktuellen Standort
  - Nicht besetzt
  - Nicht das Feld, aus dem der Angreifer kam
  - Nicht ein Feld, das durch Patt frei blieb
- [ ] Rückzugskonflikte: Zwei Einheiten in dasselbe Feld → beide aufgelöst
- [ ] Kein Rückzug möglich → Einheit aufgelöst
- [ ] Freiwillige Auflösung erlaubt

### Paket G6: Aufbau- & Abbau-Logik (Winter)
**Priorität:** Phase 1 (MVP)

- [ ] Nach Herbstzug: VZ-Besitz aktualisieren
- [ ] Pro Nation: Einheiten vs. kontrollierte VZ zählen
- [ ] Mehr VZ als Einheiten → Aufbau erlaubt
- [ ] Weniger VZ als Einheiten → Abbau erzwungen
- [ ] Aufbau nur in eigenen, freien Heimat-VZ
- [ ] Einheitentyp-Wahl: Armee oder Flotte (+ AF/SF in späteren Phasen)
- [ ] Elimination: 0 VZ → Spieler scheidet aus

### Paket G7: Luftwaffe (AF) - Neue Mechanik
**Priorität:** Phase 3

- [ ] AF-Baukosten: 4 CR, freies Heimatzentrum (Winter)
- [ ] Bewegung: 2 Felder Reichweite
- [ ] Transit: Fliegt über alles hinweg (freundlich, feindlich, neutral, See)
- [ ] Kein Angriff: Kann nur in unbesetzte Felder oder Felder mit eigenen Einheiten ziehen
- [ ] Extended Support: Support über 2 Felder Entfernung (über dazwischenliegendes Feld)
- [ ] Verteidigung: Stärke 0 → sofort zerstört bei Feindkontakt
- [ ] Kein Rückzug: AF kann nicht retreaten
- [ ] Treibstoff: Bewegung kostet 1 Energie. Support kostenlos
- [ ] Ohne Treibstoff: Immobil (kann nur supporten)
- [ ] 2-Feld-Reichweiten-Berechnung im Adjacency-Graph
- [ ] Tests für alle AF-Szenarien

### Paket G8: Spezialeinheiten (SF) - Neue Mechanik
**Priorität:** Phase 3

- [ ] SF-Baukosten: 3 CR + Seltene-Erden-Lizenz (Winter)
- [ ] Bewegung: 2 Felder Reichweite
- [ ] Schatten-Modus: Betritt besetzte Felder ohne Kampf (koexistiert)
- [ ] Unsichtbar für alle außer Besitzer
- [ ] Sabotage-Befehl:
  - Unterbricht jeglichen Support der feindlichen Einheit im Feld
  - ODER sabotiert VZ-Infrastruktur (kein CR + keine Ressource für 1 Jahr)
- [ ] Enttarnung: Nach Sabotage sichtbar
- [ ] Sichtbar-Modus: Bewegt sich wie normale Einheit (1 Feld), nur in leere Felder, kein Angriff, kein Support
- [ ] Nächste Runde: Wird wieder unsichtbar
- [ ] Verteidigung (sichtbar): Stärke 0 → bei Feindkontakt zerstört
- [ ] Raketen töten SF immer (auch getarnt)
- [ ] Tests für alle SF-Szenarien

### Paket G9: Raketen-Mechanik
**Priorität:** Phase 5

- [ ] Raketen-Voraussetzung: 15 CR + Seltene-Erden-Lizenz
- [ ] Auflösungs-Reihenfolge: Raketen VOR allen anderen Befehlen
- [ ] Wirkung: Zerstört ALLES im Zielfeld (Freund + Feind)
- [ ] Durchbruch-Szenario: Verteidiger zerstört → Angreifer rückt ein
- [ ] Friendly-Fire-Szenario: Eigene/verbündete Einheit wird auch zerstört
- [ ] Leerschlag-Szenario: Zielfeld wird leer, niemand zieht ein
- [ ] SF-Kill: Rakete zerstört auch getarnte SF
- [ ] Erweiterte Auflösungs-Engine um Raketen-Phase ergänzen
- [ ] Tests für alle Raketen-Szenarien

### Paket G10: Hacker-Minute Logik
**Priorität:** Phase 5

- [ ] Nach Haupttimer: 60-Sekunden-Fenster öffnen
- [ ] Für Hack-Käufer: 1 zufälligen Befehl eines gewählten Gegners enthüllen
- [ ] Firewall-Check: Wenn Gegner Firewall hat → Hack scheitert
- [ ] Deutschland Tracing: Hack gegen DE → Angreifer-Identität kostenlos enthüllt
- [ ] Hack-Käufer dürfen Befehle in der Hacker-Minute noch ändern
- [ ] Nicht-Hack-Käufer: Befehle sind gelockt
- [ ] Nach 60 Sekunden: Endgültige Auflösung

### Paket G11: Siegbedingungen & Spielende
**Priorität:** Phase 1 (MVP)

- [ ] Solo-Sieg: 18 VZ nach Herbstzug
- [ ] Geteilter Sieg: Alle verbleibenden Spieler stimmen zu
- [ ] Aufgabe: Spieler gibt auf → Einheiten werden neutral / aufgelöst
- [ ] Elimination: 0 VZ → Spieler scheidet aus
- [ ] Spielende-Event an Backend senden

---

## Testanforderungen

| Testbereich | Mindestabdeckung | Beschreibung |
|-------------|------------------|-------------|
| Adjacency-Graph | 100% | Jede Verbindung muss bidirektional korrekt sein |
| Befehlsauflösung | DATC-konform (200+ Tests) | Standardisierte Diplomacy-Testfälle |
| Rückzüge | 100% | Alle Randfälle (keine Option, Konflikte) |
| Aufbau/Abbau | 100% | Heimatzentren, Elimination |
| Luftwaffe | 95%+ | Alle neuen Mechaniken |
| Spezialeinheiten | 95%+ | Sabotage, Tarnung, Enttarnung |
| Raketen | 95%+ | Alle Szenarien (Durchbruch, Friendly Fire, etc.) |

---

## Abhängigkeiten zu anderen Teams

| Von Team | Benötigt | Für Paket |
|----------|----------|-----------|
| Backend | Integration als NestJS Module | Alle |
| Economy | CR/Ressourcen-Validierung für Bau | G7, G8, G9 |
| Frontend | Karten-Daten Export (Gebiete, Adjacency als JSON) | G1 |

---

## Deliverables pro Phase

| Phase | Pakete | Beschreibung |
|-------|--------|-------------|
| Phase 1 (MVP) | G1-G6, G11 | Klassisches Diplomacy: Karte, Einheiten, Auflösung, Aufbau |
| Phase 3 | G7, G8 | Luftwaffe + Spezialeinheiten |
| Phase 5 | G9, G10 | Raketen + Hacker-Minute |
