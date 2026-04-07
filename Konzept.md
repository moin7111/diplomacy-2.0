# Diplomacy 2.0 - Gesamtkonzept

## 1. Vision & Kernidee

**Diplomacy 2.0** ist eine mobile Web-App (optimiert für iPhone & iPad, läuft im Browser), die das klassische Brettspiel Diplomacy in eine moderne, hybride Kriegsführungs-Simulation transformiert. Das Spiel erweitert die bewährte Diplomacy-Mechanik (Verhandlung, gleichzeitige Befehlsabgabe, Verrat) um digitale Elemente: eine **Cyber-Wirtschaft**, **neue Einheitentypen**, **Raketen**, **Smart Contracts** und einen **Tech-Shop**.

**Kernprinzip:** Diplomatie + Ökonomie + Cyberkrieg = Hybride Kriegsführung

---

## 2. Spielübersicht

### 2.1 Spieler & Nationen

- **7 Spieler** (Varianten für 2-6 möglich)
- **Nationen:** Großbritannien, Deutsches Reich, Österreich-Ungarn, Frankreich, Italien, Russland, Osmanisches Reich (Türkei)
- Jede Nation hat **einzigartige Fähigkeiten** (Buffs) und **Startpositionen**

### 2.2 Siegbedingung

- **Solo-Sieg:** Kontrolle über 18 Versorgungszentren (VZ)
- **Geteilter Sieg:** Alle beteiligten Spieler einigen sich auf gemeinsamen Sieg

### 2.3 Spielphasen pro Jahr

```
FRÜHLING (Diplomatische Phase + Befehlsphase)
    → Timer: 10 Minuten
    → Hacker-Minute: +1 Minute (nach Timer-Ablauf, exklusiv für Hacks)
    → Befehlsauflösung
    → Rückzugsphase

HERBST (Diplomatische Phase + Befehlsphase)
    → Timer: 7 Minuten
    → Hacker-Minute: +1 Minute
    → Befehlsauflösung
    → Rückzugsphase
    → Credit-Generierung (1 CR pro VZ)

WINTER (Aufbauphase)
    → Einheiten aufbauen / abbauen
    → Ressourcen-Produktion (Energie, Lizenzen)
    → Smart Contracts abrechnen
```

---

## 3. Einheiten-System

### 3.1 Klassische Einheiten (an VZ gebunden)

| Einheit | Symbol | Reichweite | Besetzt VZ? | Kosten | Beschreibung |
|---------|--------|------------|-------------|--------|-------------|
| **Armee (A)** | Kreis | 1 Feld (Land) | Ja | Frei (VZ-basiert) | Klassische Landeinheit. Kann halten, angreifen, unterstützen. |
| **Flotte (F)** | Dreieck | 1 Feld (See/Küste) | Ja | Frei (VZ-basiert) | Seeeinheit. Kann konvoyen, halten, angreifen, unterstützen. |

### 3.2 Neue Einheiten (Credit-basiert, nicht an VZ gebunden)

| Einheit | Reichweite | Besetzt VZ? | Kosten | Voraussetzung |
|---------|------------|-------------|--------|---------------|
| **Luftwaffe (AF)** | 2 Felder | Nein | 4 CR | Freies Heimatzentrum (Winter) |
| **Spezialeinheiten (SF)** | 2 Felder | Nein | 3 CR | Aktive Seltene-Erden-Lizenz (Türkei) |

### 3.3 Luftwaffe (AF) - Detailregeln

- **Mobilität:** Fliegt über beliebige Einheiten und Meeresfelder hinweg (Transit)
- **Kein Angriff:** Kann nur in unbesetzte Felder ziehen ODER Felder mit eigenen Einheiten
- **Extended Support:** Kann Support über 2 Felder Entfernung geben
- **Verteidigung:** Stärke 0 - wird sofort zerstört wenn Feind das Feld betritt
- **Treibstoff:** Bewegung kostet 1 Energie-Einheit. Support ist kostenlos
- **Ohne Treibstoff:** Immobil, kann aber weiterhin supporten

### 3.4 Spezialeinheiten (SF) - Detailregeln

- **Schatten-Modus:** Für Gegner in der App unsichtbar (Fog of War)
- **Infiltration:** Kann feindliche Linien ohne Kampf passieren, koexistiert mit feindlichen Einheiten
- **Sabotage-Befehl:** Unterbricht jeglichen Support einer feindlichen Einheit im selben Feld ODER sabotiert Infrastruktur (blockiert CR-Generierung + Ressourcenproduktion eines VZ für 1 Jahr)
- **Enttarnung:** Wird nach Sabotage sichtbar. Nächste Runde wieder unsichtbar
- **Wenn sichtbar:** Bewegt sich wie normale Einheit (1 Feld), kann nicht angreifen/supporten, nur in leere Felder ziehen
- **Verteidigung (sichtbar):** Stärke 0 - wird bei Feindkontakt zerstört
- **Raketen:** Zerstören SF immer, auch im Schatten-Modus

---

## 4. Wirtschaftssystem

### 4.1 Credits (CR)

- **Generierung:** Jedes kontrollierte Versorgungszentrum generiert **1 CR pro Herbst**
- **Verwendung:** Einheiten kaufen, Shop-Items, Raketen, Smart Contracts
- **Sonderfall GB:** Generiert 2 CR pro Hauptstadt (statt 1)

### 4.2 Strategische Ressourcen

#### A. Energie (Gas/Öl) - Russisches Monopol
- **Produktion:** Russland erhält 3 Energie pro kontrollierter Hauptstadt pro Jahr
- **Eroberung:** Wer eine russische Hauptstadt hält, produziert dort Energie
- **Verbrauch:** 1 Energie = 1 Flugbewegung einer Luftwaffe
- **Export:** Über Smart Contracts an andere Spieler verkaufbar

#### B. Seltene Erden - Türkisches Gatekeeper-Monopol
- **Produktion:** 1 Lizenz pro türkischer Hauptstadt
- **Zweck:** Ohne Lizenz kein Bau von SF und kein Raketenstart
- **Eroberung:** Wer eine türkische Hauptstadt hält, kontrolliert deren Lizenz

### 4.3 Nationale Buffs (Länderfähigkeiten)

| Land | Buff | Effekt | Verlust-Regel |
|------|------|--------|---------------|
| **Russland** | Energie-Hegemonie | 3 Energie/Hauptstadt/Jahr | Pro Stadt |
| **Türkei** | Technologie-Veto | 1 Seltene-Erden-Lizenz/Hauptstadt | Pro Stadt |
| **Großbritannien** | Finanz-Zentrum | 2 CR/Hauptstadt + Kreditsystem | Alles-oder-Nichts |
| **Italien** | Digitaler Backbone | 1 CR Gebühr auf jeden Shop-Kauf anderer | Alles-oder-Nichts |
| **Deutsches Reich** | High-Tech Marktführer | 1 CR Rabatt auf Shop (min. 0.5 CR) + Passives Tracing | Alles-oder-Nichts |
| **Frankreich** | Nachrichtendienst | Sieht alle Smart Contracts aller Spieler | Alles-oder-Nichts |
| **Österr.-Ungarn** | Logistik-Knoten | 1x/Jahr Eilmarsch (Armee zieht 2 Felder) | Alles-oder-Nichts |

**Produktions-Länder (RU, TR):** Effekt pro einzelner Hauptstadt. Wer eine Stadt hält, erhält sofort deren Produktion.

**Eigenschafts-Länder (GB, IT, DE, FR, AT):** Buff geht erst verloren wenn ALLE Hauptstädte fallen. Eroberer erhält den Buff erst wenn er ALLE Hauptstädte gleichzeitig kontrolliert.

---

## 5. Tech-Shop (Digitale Assets)

Der Shop ist über die App jederzeit zugänglich. Italien erhält 1 CR Provision auf jeden Kauf.

| Item | Kosten | Effekt |
|------|--------|--------|
| **Standard-Hack** | 3 CR | Nach Timer-Ablauf: 60s Hacker-Fenster öffnet sich. Enthüllt 1 zufälligen Befehl eines gewählten Gegners. Eigener Zug darf in dieser Minute noch angepasst werden. |
| **Firewall** | 1 CR | Blockiert alle Hacks und Tracing gegen eigenes Land für die laufende Phase (inkl. Hacker-Minute). |
| **Infrastruktur-Schlag** | 4 CR | Sabotiert ein VZ: Kein CR im nächsten Herbst, keine nationale Ressource für 1 Jahr. |
| **Schwarzmarkt-Treibstoff** | 3 CR | 1 AF-Flugbewegung ohne offiziellen Energie-Exportvertrag mit Russland. |

### 5.1 Hacker-Minute (Ablauf)

```
1. Regulärer Timer läuft ab (10 Min Frühling / 7 Min Herbst)
2. Alle Befehle werden "eingefroren"
3. 60-Sekunden Hacker-Fenster öffnet sich
4. Spieler mit gekauftem Hack sehen 1 zufälligen feindlichen Befehl
5. Spieler MIT Hack können ihren eigenen Zug final anpassen
6. Nach 60 Sekunden: Endgültige Auflösung aller Befehle
```

---

## 6. Taktische Raketen

| Eigenschaft | Wert |
|-------------|------|
| **Kosten** | 15 CR |
| **Voraussetzung** | Aktive Seltene-Erden-Lizenz (Türkei) |
| **Zeitliche Auflösung** | VOR allen Land-/Seebewegungen |
| **Wirkung** | Zerstört ALLES im Zielfeld (Freund & Feind) |

### 6.1 Raketen-Szenarien

- **Durchbruch:** Rakete zerstört Verteidiger → eigene Armee rückt in leeres Feld
- **Friendly Fire:** Eigene/verbündete Einheit zieht ins Zielfeld → wird auch zerstört
- **Leerschlag:** Gegner zieht ab, niemand zieht rein → 15 CR verschwendet
- **SF-Kill:** Raketen zerstören Spezialeinheiten IMMER (auch getarnte)

---

## 7. Smart Contracts (Escrow / Treuhand-System)

### 7.1 Funktionsweise

```
1. VERTRAGSERSTELLUNG
   → Spieler A schlägt Vertrag in der App vor
   → Definiert: Handelsgüter (CR, Ressourcen, Lizenzen), Bedingungen, Fristen

2. EINFRIEREN (LOCKING)
   → Beide Seiten stimmen zu
   → App zieht CR/Ressourcen sofort ab und friert sie ein

3. AUTOMATISCHE ÜBERTRAGUNG
   → App registriert Eintritt der Bedingung
   → Credits/Ressourcen werden automatisch übertragen

4. RÜCKABWICKLUNG
   → Bedingung nicht erfüllt bis Frist
   → Alles fließt automatisch zurück
```

### 7.2 Verfügbare Vertragsbedingungen

**Territoriale Bedingungen:**
- Besitzwechsel: "Zahlung wenn Spieler X das VZ Y kontrolliert"
- Hauptstadt-Kontrolle: "Zahlung wenn alle Hauptstädte von Land Z fallen"

**Taktische Bedingungen:**
- Befehlsausführung: "Zahlung wenn Einheit A Support für Einheit B gibt"
- Erfolgreicher Angriff: "Zahlung wenn Angriff auf Feld C erfolgreich"

**Ressourcen-Trigger:**
- Gegenseitiger Tausch: "CR gegen Öl-Lizenz"

**Zeitfaktoren:**
- Laufzeit: "1 Energie/Runde für 3 Runden"
- Deadline: "Vertrag verfällt nach Herbst 1905"
- Ratenzahlung: "12 CR in 3 Jahresraten"

**Kombinierte Logik:** AND/OR-Verknüpfung mehrerer Bedingungen

### 7.3 Transparenz

- Verträge sind **nur für Beteiligte** sichtbar
- **Frankreich** sieht als einzige Macht **ALLE** aktiven Verträge aller Spieler

### 7.4 Britisches Kreditsystem

- GB kann Credits verleihen
- App zieht Rückzahlungen (inkl. Zinsen) automatisch vom Schuldner ab
- Verrat bei Rückzahlung ist systemseitig ausgeschlossen

---

## 8. Befehlssystem

### 8.1 Klassische Befehle

| Befehl | Einheiten | Beschreibung |
|--------|-----------|-------------|
| **Halten (Hold)** | A, F, AF | Einheit bleibt stehen und verteidigt |
| **Verschieben (Move)** | A, F, AF, SF | Einheit bewegt sich in angrenzendes Feld |
| **Unterstützen (Support)** | A, F, AF | Verstärkt Angriff oder Verteidigung einer anderen Einheit |
| **Konvoi (Convoy)** | F | Flotte transportiert Armee über Seefelder |

### 8.2 Neue Befehle

| Befehl | Einheiten | Beschreibung |
|--------|-----------|-------------|
| **Sabotage** | SF | Unterbricht Support einer feindlichen Einheit oder sabotiert VZ-Infrastruktur |
| **Rakete** | Jedes Land (Shop) | Zerstört alles im Zielfeld, wird vor allen anderen Befehlen aufgelöst |

### 8.3 Befehlseingabe (Touch-Gesten)

| Geste | Ergebnis |
|-------|----------|
| **Tap** auf eigenes Gebiet | Auswählen (farblich hinterlegt) |
| **Tap** auf anderes Gebiet | Move / Angriff |
| **Tap** nochmal auf eigenes Gebiet | Halten |
| **Long-Press** (~0.5s) auf Gebiet ODER Support-Button | Support-Modus |
| Support-Modus + **Tap** auf Angriffsfeld | Support-Angriff |
| **Extra-langes Halten** (~2s) auf Gebiet | Convoy-Modus (Support → Convoy) |
| **Long-Press** auf SF ODER Sabotage-Button | Sabotage |

**Ungültige Züge:** Werden sofort angezeigt (rotes Blinken + Fehlermeldung).

### 8.3 Befehlsauflösung (Reihenfolge)

```
1. Raketen schlagen ein (zerstören alles im Zielfeld)
2. Sabotage wird ausgeführt (SF werden enttarnt)
3. Support-Ketten werden berechnet (sabotierte Supports fallen weg)
4. Bewegungen werden gleichzeitig aufgelöst
5. Pattsituationen werden erkannt (gleiche Stärke = niemand bewegt sich)
6. Vertriebene Einheiten müssen Rückzug antreten
```

---

## 9. Karte & Gebiete

### 9.1 Kartengrundlage

Die Karte basiert auf der klassischen Diplomacy-Europakarte (politische Grenzen vor dem 1. Weltkrieg) mit folgenden Gebietstypen:

- **Landgebiete** (nur Armeen)
- **Küstengebiete** (Armeen und Flotten)
- **Seegebiete** (nur Flotten)
- **Versorgungszentren (VZ)** - generieren CR und ermöglichen Einheitenbau

### 9.2 Startpositionen

| Land | Armeen in | Flotten in |
|------|-----------|------------|
| Österreich-Ungarn | Wien, Budapest | Triest |
| Großbritannien | Liverpool | London, Edinburgh |
| Frankreich | Paris, Marseille | Brest |
| Deutsches Reich | Berlin, München | Kiel |
| Italien | Rom, Venedig | Neapel |
| Russland | Moskau, Warschau | Sewastopol, St. Petersburg (Süd) |
| Osmanisches Reich | Konstantinopel, Smyrna | Ankara |

### 9.3 Topographische Besonderheiten

- **Doppelküsten:** Bulgarien (Ost/Süd), St. Petersburg (Nord/Süd), Spanien (Nord/Süd)
- **Gibraltar:** Keine Landverbindung Spanien-Nordafrika (Konvoi nötig)
- **Kiel & Konstantinopel:** Durchfahrbare Wasserstraßen
- **Dänemark-Schweden:** Gemeinsame Landgrenze

---

## 10. Fog of War

- **Spezialeinheiten** sind im Schatten-Modus nur für den Besitzer sichtbar
- Alle anderen Einheiten sind für alle Spieler auf der Karte sichtbar
- **Hacks** enthüllen einzelne geheime Befehle
- **Frankreichs Buff** enthüllt alle Smart Contracts

---

## 11. Kommunikation

### 11.1 Chat-System

- **1:1 Chat** zwischen allen Spielern
- **Gruppenchats** möglich
- In-Game Press (Nachrichten) innerhalb der Phasen
- Chat ist jederzeit zugänglich (auch zwischen Phasen)

### 11.2 Spielcode-System

- **Raumcode** wird beim Erstellen generiert
- Teilbar über WhatsApp, SMS etc.
- Alternativ: Lobby mit öffentlichen Spielen zum Beitreten

---

## 12. Spielkonfiguration

Beim Erstellen eines Spiels konfigurierbar:

| Einstellung | Optionen |
|-------------|----------|
| Raketen an/aus | Mit/Ohne Raketen |
| Dauer pro Zug (Frühling) | z.B. 10 Minuten |
| Dauer pro Zug (Herbst) | z.B. 7 Minuten |
| Rückzugsdauer | z.B. 3 Minuten |
| Baudauer (Winter) | z.B. 5 Minuten |
| Spieleranzahl | 2-7 Spieler |
| Kartenvariante | Standard Europa |

---

## 13. Technische Architektur (Überblick)

```
┌─────────────────────────────────────────────────┐
│                   CLIENT (App)                   │
│  ┌───────────┐ ┌──────────┐ ┌────────────────┐ │
│  │ Karten-   │ │ Chat &   │ │ Wirtschafts-   │ │
│  │ Renderer  │ │ Diplom.  │ │ Panel          │ │
│  ├───────────┤ ├──────────┤ ├────────────────┤ │
│  │ Befehls-  │ │ Shop &   │ │ Smart Contract │ │
│  │ System    │ │ Items    │ │ Manager        │ │
│  └───────────┘ └──────────┘ └────────────────┘ │
└────────────────────┬────────────────────────────┘
                     │ WebSocket + REST API
┌────────────────────┴────────────────────────────┐
│                  BACKEND (Server)                 │
│  ┌───────────┐ ┌──────────┐ ┌────────────────┐ │
│  │ Game      │ │ Auth &   │ │ Wirtschafts-   │ │
│  │ Engine    │ │ User Mgmt│ │ Engine         │ │
│  ├───────────┤ ├──────────┤ ├────────────────┤ │
│  │ Befehls-  │ │ Chat     │ │ Smart Contract │ │
│  │ Resolver  │ │ Service  │ │ Engine         │ │
│  └───────────┘ └──────────┘ └────────────────┘ │
└────────────────────┬────────────────────────────┘
                     │
┌────────────────────┴────────────────────────────┐
│                  DATENBANK                        │
│  ┌───────────┐ ┌──────────┐ ┌────────────────┐ │
│  │ Spielstand│ │ User     │ │ Transaktionen  │ │
│  │ & History │ │ Accounts │ │ & Contracts    │ │
│  └───────────┘ └──────────┘ └────────────────┘ │
└─────────────────────────────────────────────────┘
```

### 13.1 Tech-Stack (Empfehlung)

| Komponente | Technologie |
|------------|-------------|
| **Frontend** | React.js + Next.js (Web-App, PWA-fähig) |
| **Karten-Rendering** | Canvas/WebGL (Pixi.js, interaktive SVG-Karte) |
| **Styling** | Tailwind CSS / CSS Modules |
| **Backend** | Node.js / NestJS (TypeScript) |
| **Echtzeit** | WebSockets (Socket.io) |
| **Datenbank** | PostgreSQL 16 (Spielstand) + Redis 7 (Sessions, Cache, Pub/Sub) |
| **Auth** | NextAuth.js / Supabase Auth |
| **Reverse Proxy** | Caddy (automatisches HTTPS, WebSocket-Proxy) |
| **Push Notifications** | Web Push API + Service Worker |
| **Hosting** | Cloudflare Pages (Frontend) + Hetzner Cloud CX31 8GB (Backend) |

---

## 14. Monetarisierung (Optional)

| Modell | Beschreibung |
|--------|-------------|
| **Kosmetische Items** | Spieler-Icons, Kartenthemen, Einheiten-Skins |
| **Premium-Mitgliedschaft** | Mehr gleichzeitige Spiele, Statistiken, Replays |
| **Werbefreiheit** | Einmaliger Kauf |

---

## 15. Meilensteine

| Phase | Inhalt | Dauer (geschätzt) |
|-------|--------|-------------------|
| **Phase 1: MVP** | Klassisches Diplomacy + Karte + Chat + Auth | - |
| **Phase 2: Economy** | Credits, Shop, Ressourcen, nationale Buffs | - |
| **Phase 3: Neue Einheiten** | Luftwaffe, Spezialeinheiten, Fog of War | - |
| **Phase 4: Smart Contracts** | Escrow-System, Vertragsbedingungen | - |
| **Phase 5: Raketen & Hacks** | Tech-Shop Items, Hacker-Minute, Raketen | - |
| **Phase 6: Polish** | UI-Feinschliff, Balancing, Beta-Test | - |
| **Phase 7: Launch** | Store-Release, Marketing, Community | - |
