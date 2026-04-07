# Team: Economy & Diplomatie-System

## Teamverantwortung

Das Economy-Team entwickelt das gesamte Wirtschaftssystem: Credits, Ressourcen, nationale Buffs, den Tech-Shop, das Smart-Contract/Escrow-System und das britische Kreditsystem.

---

## Tech-Stack

| Technologie | Zweck |
|-------------|-------|
| **TypeScript** | Wirtschaftslogik als eigenständiges Modul |
| **PostgreSQL** | Persistenz (Transaktionen, Verträge, Kontostände) |
| **Jest** | Unit-Tests für Wirtschaftsregeln |
| **Event-Emitter** | Integration mit Game-Logic (Phase-End Events) |

---

## Aufgabenpakete

### Paket E1: Credit-System (Grundlage)
**Priorität:** Phase 2

- [ ] PlayerEconomy-Modell:
  ```typescript
  interface PlayerEconomy {
    gameId: string;
    playerId: string;
    nation: Nation;
    credits: number;
    energyUnits: number;
    rareEarthLicenses: number;
    activeBuffs: NationalBuff[];
    sabotaged_vz: string[];  // VZ die sabotiert sind
  }
  ```
- [ ] Credit-Generierung nach Herbstzug:
  - Standard: 1 CR pro kontrolliertem VZ
  - GB-Hauptstädte: 2 CR statt 1
  - Sabotierte VZ: 0 CR
- [ ] Credit-Abbuchung (atomar, mit Validierung)
- [ ] Credit-Transfer zwischen Spielern
- [ ] Transaktions-Log (jede CR-Bewegung protokollieren)
- [ ] Startguthaben festlegen (z.B. 0 CR, erst nach 1. Herbst)

### Paket E2: Ressourcen-System
**Priorität:** Phase 2

- [ ] **Energie (Gas/Öl) - Russland:**
  - 3 Energie pro kontrollierter russischer Hauptstadt pro Jahr (Winter)
  - Eroberung: Neuer Besitzer produziert sofort
  - Verbrauch: 1 Energie = 1 AF-Flugbewegung
  - Energie-Export über Smart Contracts
- [ ] **Seltene Erden - Türkei:**
  - 1 Lizenz pro kontrollierter türkischer Hauptstadt
  - Eroberung: Neuer Besitzer kontrolliert Lizenz sofort
  - Lizenz-Vergabe: Türkei (oder Besitzer) entscheidet, an wen
  - Ohne Lizenz: Kein SF-Bau, kein Raketenstart
- [ ] Ressourcen-Produktion im Winter-Phase-Event
- [ ] Ressourcen-Verbrauch bei Einheiten-Aktionen

### Paket E3: Nationale Buffs
**Priorität:** Phase 2

#### Produktions-Länder (Pro Stadt):
- [ ] **Russland - Energie-Hegemonie:**
  - 3 Energie/Hauptstadt/Jahr
  - Bei Eroberung: Sofort an Besitzer
- [ ] **Türkei - Technologie-Veto:**
  - 1 Lizenz/Hauptstadt
  - Bei Eroberung: Sofort an Besitzer

#### Eigenschafts-Länder (Alles-oder-Nichts):
- [ ] **Großbritannien - Finanz-Zentrum:**
  - 2 CR/Hauptstadt (statt 1)
  - Kreditsystem: Credits verleihen, automatische Rückzahlung
  - Buff verloren wenn ALLE GB-Hauptstädte fallen
  - Eroberer erhält Buff erst wenn er ALLE GB-Hauptstädte kontrolliert
- [ ] **Italien - Digitaler Backbone:**
  - 1 CR Provision auf jeden Shop-Kauf aller Gegner
  - Passive Einnahme
  - Alles-oder-Nichts-Regel wie GB
- [ ] **Deutsches Reich - High-Tech Marktführer:**
  - 1 CR Rabatt auf alle Shop-Käufe (min. 0.5 CR Kosten)
  - Passives Tracing: Hack-Versuch gegen DE enthüllt Angreifer-Identität kostenlos
  - Alles-oder-Nichts-Regel
- [ ] **Frankreich - Nachrichtendienst:**
  - Vollständiger Einblick in ALLE Smart Contracts aller Spieler
  - Sieht Summen, Ressourcen, Bedingungen
  - Alles-oder-Nichts-Regel
- [ ] **Österreich-Ungarn - Logistik-Knoten:**
  - 1x pro Jahr: Eilmarsch für genau 1 Armee
  - Armee zieht 2 Felder (Transit-Feld muss leer sein)
  - Wenn Zielort blockiert → Armee fällt ins Transit-Feld zurück
  - Alles-oder-Nichts-Regel

### Paket E4: Buff-Verwaltungslogik
**Priorität:** Phase 2

- [ ] Hauptstadt-Tracking pro Nation
- [ ] Alles-oder-Nichts Check:
  ```
  Wenn Nation X alle Hauptstädte von Nation Y kontrolliert:
    → Nation X erhält den Buff von Nation Y
    → Nation Y verliert den Buff
  ```
- [ ] Buff-Transfer bei Eroberung
- [ ] Buff-Verlust bei Rückeroberung
- [ ] Buff-Events an Frontend senden (Overlay: "Du hast Buff XY gewonnen!")

### Paket E5: Tech-Shop
**Priorität:** Phase 5

- [ ] Shop-Item-Registry:
  ```typescript
  const SHOP_ITEMS = {
    HACK:               { cost: 3, requires: null },
    FIREWALL:           { cost: 1, requires: null },
    INFRASTRUCTURE_HIT: { cost: 4, requires: null },
    BLACK_MARKET_FUEL:  { cost: 3, requires: null },
    MISSILE:            { cost: 15, requires: 'rare_earth_license' },
  };
  ```
- [ ] Kauf-Logik:
  1. CR-Check (genug Guthaben?)
  2. Voraussetzungs-Check (Lizenz vorhanden?)
  3. Deutschland-Rabatt anwenden (wenn zutreffend)
  4. CR abbuchen
  5. Italien-Provision abbuchen (1 CR an Italien-Besitzer)
  6. Item aktivieren
- [ ] Hack-Aktivierung: Signal an Game-Logic für Hacker-Minute
- [ ] Firewall-Aktivierung: Markierung für aktuelle Phase
- [ ] Infrastruktur-Schlag: VZ als sabotiert markieren (1 Jahr)
- [ ] Schwarzmarkt-Treibstoff: 1 AF-Bewegung ohne Öl-Vertrag
- [ ] Raketen-Kauf: Signal an Game-Logic

### Paket E6: Smart Contract / Escrow-System
**Priorität:** Phase 4

- [ ] Contract-Datenmodell:
  ```typescript
  interface SmartContract {
    id: string;
    gameId: string;
    proposer: string;
    accepter: string;
    status: 'proposed' | 'active' | 'fulfilled' | 'expired' | 'cancelled';
    offer: { type: 'credits' | 'energy' | 'license'; amount: number; duration?: number };
    demand: { type: 'credits' | 'energy' | 'license'; amount: number; duration?: number };
    conditions: ContractCondition[];
    deadline: { phase: string; year: number } | null;
    escrow: { locked_credits: number; locked_resources: any };
    installments?: { amount: number; interval: number; remaining: number };
  }
  ```
- [ ] Vertrag vorschlagen (Spieler A → Spieler B)
- [ ] Vertrag annehmen → Escrow Lock (CR + Ressourcen einfrieren)
- [ ] Vertrag ablehnen
- [ ] Vertrag kündigen (beide Parteien müssen zustimmen)

### Paket E7: Contract Condition Engine
**Priorität:** Phase 4

- [ ] Bedingungstypen implementieren:
  ```typescript
  type ContractCondition =
    | { type: 'territory_control'; player: string; territory: string }
    | { type: 'all_capitals'; player: string; nation: Nation }
    | { type: 'order_executed'; unit: string; orderType: string; target: string }
    | { type: 'attack_successful'; territory: string }
    | { type: 'resource_deposited'; resourceType: string; amount: number }
    | { type: 'time_elapsed'; rounds: number }
    | { type: 'and'; conditions: ContractCondition[] }
    | { type: 'or'; conditions: ContractCondition[] };
  ```
- [ ] Condition-Evaluator: Nach jeder Phase alle aktiven Verträge prüfen
- [ ] Territoriale Bedingungen gegen GameState prüfen
- [ ] Taktische Bedingungen gegen Order-History prüfen
- [ ] Ressourcen-Trigger gegen Escrow-State prüfen
- [ ] Zeitfaktoren: Laufzeit, Deadline, Ratenzahlung
- [ ] AND/OR-Logik rekursiv auswerten
- [ ] Auto-Transfer bei Erfüllung
- [ ] Auto-Rückabwicklung bei Deadline-Überschreitung
- [ ] Ratenzahlung: Automatische periodische CR-Übertragung

### Paket E8: Britisches Kreditsystem
**Priorität:** Phase 4

- [ ] Kredit-Vertrag als Sonderform des Smart Contracts
- [ ] GB kann CR an andere Spieler verleihen
- [ ] App zieht Rückzahlung (CR/Jahr) automatisch ab
- [ ] Zinsen konfigurierbar im Vertrag
- [ ] Rückzahlung nur wenn Schuldner CR hat (sonst aufgeschoben)
- [ ] Verrat bei Rückzahlung systemseitig unmöglich
- [ ] Kredit-Default: Wenn Spieler eliminiert → Kredit verfällt

### Paket E9: Frankreichs Informations-Monopol
**Priorität:** Phase 4

- [ ] Frankreich-Besitzer sieht ALLE aktiven Smart Contracts
- [ ] API-Endpoint: GET /games/:id/contracts/all (nur Frankreich-Buff)
- [ ] Frontend-Event: Vertrags-Updates in Echtzeit an Frankreich
- [ ] Anonymität für alle anderen Spieler wahren

---

## Wirtschafts-Balancing

### Einnahmen pro Jahr (Beispiel: Mittlerer Spielstand)

| Quelle | CR/Jahr (Durchschnitt) |
|--------|----------------------|
| 5 VZ × 1 CR | 5 CR |
| GB-Bonus (2 Hauptstädte) | +2 CR |
| IT-Provision (ca. 3 Shop-Käufe) | +3 CR |
| **Typisch: 5-10 CR/Jahr** | |

### Ausgaben-Referenz

| Ausgabe | Kosten |
|---------|--------|
| Luftwaffe | 4 CR |
| Spezialeinheit | 3 CR |
| Hack | 3 CR |
| Firewall | 1 CR |
| Infrastruktur-Schlag | 4 CR |
| Schwarzmarkt-Treibstoff | 3 CR |
| Rakete | 15 CR |

**Balancing-Prinzip:** Eine Rakete kostet ~2-3 Jahre Einkommen → Höchste Eskalationsstufe, nicht spammbar.

---

## Abhängigkeiten zu anderen Teams

| Von Team | Benötigt | Für Paket |
|----------|----------|-----------|
| Game Logic | Phase-End Events (Herbst, Winter) | E1, E2 |
| Game Logic | Befehlsausführungs-Ergebnisse | E7 |
| Backend | Datenbank-Persistenz (Transaktionen, Verträge) | Alle |
| Backend | API-Endpoints für Shop/Contracts | E5, E6 |
| Frontend | UI-Events (Kauf-Bestätigung, Vertrag-Vorschlag) | E5, E6 |

---

## Deliverables pro Phase

| Phase | Pakete | Beschreibung |
|-------|--------|-------------|
| Phase 2 | E1-E4 | Credits, Ressourcen, Nationale Buffs |
| Phase 4 | E6-E9 | Smart Contracts, Escrow, Kreditsystem |
| Phase 5 | E5 | Tech-Shop (Hacks, Firewall, Raketen) |
