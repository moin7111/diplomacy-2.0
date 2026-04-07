# Diplomacy 2.0 - Projektplan & Team-Übersicht

## Phasenübersicht (Gesamtbild)

```
PHASE 1: MVP              ████████████████████████████████████████
PHASE 2: Economy           ░░░░░░░░░░████████████████████
PHASE 3: Neue Einheiten    ░░░░░░░░░░░░░░░░░░████████████████
PHASE 4: Smart Contracts   ░░░░░░░░░░░░░░░░░░░░░░░░████████████████
PHASE 5: Raketen & Hacks   ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░████████████
PHASE 6: Polish            ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░████████
PHASE 7: Launch            ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░██
```

---

## Phase 1: MVP - Klassisches Diplomacy (spielbar)

> **Ziel:** Eine funktionsfähige Web-App in der man ein klassisches Diplomacy-Spiel erstellen, beitreten und komplett durchspielen kann (Armeen + Flotten, Befehle, Auflösung, Chat).

### Team-Einsatz Phase 1

```
                    Woche 1-2      Woche 3-4      Woche 5-6      Woche 7-8      Woche 9-10
                   ┌──────────┐   ┌──────────┐   ┌──────────┐   ┌──────────┐   ┌──────────┐
🎨 Design          │ D1 Style │   │ D2 Natio-│   │ D3 Karte │   │ D4 Units │   │ D5 Icons │
                   │ Guide    │   │ nen + D6 │   │ (SVG)    │   │ Grafiken │   │ D6 Screen│
                   │          │   │ Screens  │   │          │   │          │   │ Prototyp │
                   └──────────┘   └──────────┘   └──────────┘   └──────────┘   └──────────┘
                   ┌──────────┐   ┌──────────┐   ┌──────────┐   ┌──────────┐   ┌──────────┐
🖥 Frontend        │ F1 Setup │   │ F2 Login │   │ F5 Karten│   │ F6 Befeh-│   │ F7 Rück- │
                   │ Projekt  │   │ F3 Home  │   │ Renderer │   │ le Ein-  │   │ zug/Bau  │
                   │ Navigat. │   │ F4 Lobby │   │ F8 Timer │   │ gabe     │   │ F9 Chat  │
                   └──────────┘   └──────────┘   └──────────┘   └──────────┘   └──────────┘
                   ┌──────────┐   ┌──────────┐   ┌──────────┐   ┌──────────┐   ┌──────────┐
⚙ Backend          │ B1 Setup │   │ B2 Auth  │   │ B4 Web-  │   │ B6 Befeh-│   │ B8 Spiel-│
                   │ NestJS   │   │ B3 Game  │   │ Socket   │   │ ls-API   │   │ stand    │
                   │ Docker   │   │ API      │   │ B5 Timer │   │ B7 Chat  │   │          │
                   └──────────┘   └──────────┘   └──────────┘   └──────────┘   └──────────┘
                   ┌──────────┐   ┌──────────┐   ┌──────────┐   ┌──────────┐   ┌──────────┐
🧠 Game Logic      │ G1 Karte │   │ G2 Ein-  │   │ G4 Auf-  │   │ G4 Auf-  │   │ G5 Rück- │
                   │ Adjacency│   │ heiten   │   │ lösungs- │   │ lösung   │   │ zug      │
                   │ Graph    │   │ G3 Parser │   │ Engine   │   │ DATC     │   │ G6 Aufbau│
                   │          │   │          │   │ (Kern)   │   │ Tests    │   │ G11 Sieg │
                   └──────────┘   └──────────┘   └──────────┘   └──────────┘   └──────────┘
                   ┌──────────┐   ┌──────────┐   ┌──────────┐   ┌──────────┐   ┌──────────┐
🏗 Infrastruktur   │ I1 Cloud │   │ I2 CI/CD │   │ I4 Web-  │   │ I5 Moni- │   │ I9 QA    │
                   │ Setup    │   │ Pipeline │   │ Socket   │   │ toring   │   │ Load-    │
                   │          │   │ I3 Deploy│   │ Infra    │   │ I6 Logg. │   │ Tests    │
                   │          │   │          │   │ I7 Secur.│   │          │   │          │
                   └──────────┘   └──────────┘   └──────────┘   └──────────┘   └──────────┘
                   ┌──────────────────────────────────────────────────────────────────────┐
💰 Economy         │                        (wartet auf Phase 2)                          │
                   └──────────────────────────────────────────────────────────────────────┘
```

### Phase 1 - Detaillierte Aufgabenliste

| Woche | Design (D) | Frontend (F) | Backend (B) | Game Logic (G) | Infra (I) |
|-------|-----------|-------------|------------|----------------|----------|
| **1-2** | D1: Style Guide, Farben, Fonts, Komponenten | F1: Projektsetup, Navigation, State, Theming | B1: NestJS Setup, Docker, DB, Redis | G1: Karten-Datenmodell (75 Gebiete, Adjacency) | I1: Cloud-Setup, VPC, DB, Redis |
| **3-4** | D2: Nationen-Design + D6: Screen-Designs (Figma) | F2: Login/Register + F3: Home-Screen + F4: Lobby | B2: Auth-System + B3: Game-Management API | G2: Einheiten-System + G3: Befehls-Parser | I2: CI/CD + I3: Deployment + I7: Security |
| **5-6** | D3: Europa-Karte (SVG, alle 75 Gebiete) | F5: Karten-Renderer (interaktiv) + F8: Timer | B4: WebSocket-Server + B5: Timer-System | G4: Auflösungs-Engine (Kern-Algorithmus) | I4: WebSocket-Infra + I7: Security |
| **7-8** | D4: Einheiten-Grafiken (A + F pro Nation) | F6: Befehlseingabe (Point-and-Click) | B6: Befehls-API + B7: Chat-Service | G4: DATC-Testsuite (200+ Tests) | I5: Monitoring + I6: Logging |
| **9-10** | D5: Spieler-Icons + D6: Prototyp fertigstellen | F7: Rückzug/Aufbau + F9: Chat | B8: Spielstand-Verwaltung | G5: Rückzüge + G6: Aufbau + G11: Sieg | I9: QA, Load-Tests |

### Phase 1 - Kritische Pfade (Blocker)

```
Design D3 (Karte SVG) ──────────▸ Frontend F5 (Karten-Renderer)
Game Logic G1 (Adjacency) ──────▸ Frontend F5 (Karten-Renderer)
Game Logic G1 (Adjacency) ──────▸ Frontend F6 (Befehlseingabe)
Game Logic G4 (Auflösungs-Engine)▸ Backend B8 (Spielstand)
Backend B4 (WebSocket) ─────────▸ Frontend F6/F8/F9 (Befehle/Timer/Chat)
Infra I1 (Cloud) ──────────────▸ Backend B1 (Deployment)
Design D1 (Style Guide) ────────▸ Frontend F1-F4 (alle Screens)
```

**Blocker-Warnung:** Die Karte (D3 + G1) muss bis Woche 5 fertig sein, sonst blockiert sie das gesamte Frontend ab F5.

### Phase 1 - Meilensteine & Abnahme

| Meilenstein | Woche | Kriterium |
|-------------|-------|-----------|
| **M1: Infrastruktur steht** | 2 | Cloud, DB, CI/CD laufen, Dev-Umgebung für alle Teams |
| **M2: Auth + Lobby spielbar** | 4 | User kann sich registrieren, Spiel erstellen, beitreten |
| **M3: Karte interaktiv** | 6 | Karte zoombar, Gebiete klickbar, Einheiten sichtbar |
| **M4: Befehle funktionieren** | 8 | Befehle eingeben, abgeben, korrekt auflösen (DATC-konform) |
| **M5: MVP komplett** | 10 | Vollständiges Spiel möglich: Lobby → Befehle → Auflösung → Chat → Sieg |

---

## Phase 2: Economy-System

> **Ziel:** Credits, Ressourcen, nationale Buffs einführen. Das Spiel bekommt eine wirtschaftliche Dimension.

### Team-Einsatz Phase 2

```
                    Woche 11-12    Woche 13-14    Woche 15-16
                   ┌──────────┐   ┌──────────┐   ┌──────────┐
🎨 Design          │ D7 Anim- │   │ D7 Anim- │   │ D7 ferti-│
                   │ ationen  │   │ ationen  │   │ stellen  │
                   │ (Auflös.)│   │ (weiter) │   │          │
                   └──────────┘   └──────────┘   └──────────┘
                   ┌──────────┐   ┌──────────┐   ┌──────────┐
🖥 Frontend        │ F11 Wirt-│   │ F10 Auf- │   │ F10+F11  │
                   │ schafts- │   │ lösungs- │   │ integrie-│
                   │ Panel    │   │ Animation│   │ ren      │
                   └──────────┘   └──────────┘   └──────────┘
                   ┌──────────┐   ┌──────────┐   ┌──────────┐
⚙ Backend          │ B9 Wirt- │   │ B9 fertig│   │ B12 Push │
                   │ schafts- │   │ stellen  │   │ Notific. │
                   │ Engine   │   │          │   │          │
                   └──────────┘   └──────────┘   └──────────┘
                   ┌──────────────────────────────────────────┐
🧠 Game Logic      │        (kein neuer Scope in Phase 2)     │
                   │        Bug-Fixes + Balancing              │
                   └──────────────────────────────────────────┘
                   ┌──────────┐   ┌──────────────────────────┐
🏗 Infrastruktur   │ I8 DB    │   │ Monitoring erweitern     │
                   │ Optimier.│   │ für Economy-Metriken     │
                   └──────────┘   └──────────────────────────┘
                   ┌──────────┐   ┌──────────┐   ┌──────────┐
💰 Economy         │ E1 Cred- │   │ E2 Res-  │   │ E3+E4    │
                   │ its      │   │ sourcen  │   │ Nationale│
                   │ System   │   │ (Öl/Erz) │   │ Buffs    │
                   └──────────┘   └──────────┘   └──────────┘
```

### Phase 2 - Meilensteine

| Meilenstein | Woche | Kriterium |
|-------------|-------|-----------|
| **M6: Credits laufen** | 12 | VZ generieren CR nach Herbstzug, Saldo sichtbar |
| **M7: Ressourcen aktiv** | 14 | Russland produziert Energie, Türkei vergibt Lizenzen |
| **M8: Buffs funktionieren** | 16 | Alle 7 nationalen Buffs implementiert + Alles-oder-Nichts-Logik |

---

## Phase 3: Neue Einheiten (Luftwaffe + Spezialeinheiten)

> **Ziel:** AF und SF einführen, Fog of War implementieren. Das Spiel wird zur hybriden Kriegsführung.

### Team-Einsatz Phase 3

```
                    Woche 17-18    Woche 19-20    Woche 21-22
                   ┌──────────────────────────────────────────┐
🎨 Design          │ Einheiten-Grafiken AF + SF verfeinern    │
                   │ Fog-of-War Effekte, Tarnung-Animation    │
                   └──────────────────────────────────────────┘
                   ┌──────────┐   ┌──────────┐   ┌──────────┐
🖥 Frontend        │ F6 erwei-│   │ F14 Fog  │   │ F7 erwei-│
                   │ tern     │   │ of War   │   │ tern     │
                   │ (AF/SF   │   │ SF-Sicht-│   │ (AF/SF   │
                   │ Befehle) │   │ barkeit  │   │ Aufbau)  │
                   └──────────┘   └──────────┘   └──────────┘
                   ┌──────────────────────────────────────────┐
⚙ Backend          │ API-Erweiterung: AF/SF Befehle,          │
                   │ Fog-of-War Filterung (nur eigene SF)     │
                   └──────────────────────────────────────────┘
                   ┌──────────┐   ┌──────────┐   ┌──────────┐
🧠 Game Logic      │ G7 Luft- │   │ G8 Spez- │   │ G7+G8    │
                   │ waffe    │   │ ialein-  │   │ Tests +  │
                   │ (AF)     │   │ heiten   │   │ Integrat.│
                   │ Regeln   │   │ (SF)     │   │ Engine   │
                   └──────────┘   └──────────┘   └──────────┘
                   ┌──────────────────────────────────────────┐
💰 Economy         │ E1/E2 erweitern: AF-Bau kostet 4 CR,     │
                   │ SF-Bau kostet 3 CR + Lizenz               │
                   └──────────────────────────────────────────┘
                   ┌──────────────────────────────────────────┐
🏗 Infrastruktur   │ Performance-Tests mit neuen Einheiten     │
                   └──────────────────────────────────────────┘
```

### Phase 3 - Meilensteine

| Meilenstein | Woche | Kriterium |
|-------------|-------|-----------|
| **M9: Luftwaffe spielbar** | 18 | AF baubar (4 CR), fliegt 2 Felder, Extended Support funktioniert |
| **M10: SF + Fog of War** | 20 | SF baubar (3 CR + Lizenz), Sabotage funktioniert, Tarnung sichtbar |
| **M11: Phase 3 komplett** | 22 | AF + SF vollständig in Auflösungs-Engine integriert, alle Tests grün |

---

## Phase 4: Smart Contracts / Escrow-System

> **Ziel:** Das diplomatische Vertragssystem mit automatischer Abwicklung einführen.

### Team-Einsatz Phase 4

```
                    Woche 23-24    Woche 25-26    Woche 27-28
                   ┌──────────────────────────────────────────┐
🎨 Design          │ Vertrags-UI, Escrow-Visualisierung       │
                   └──────────────────────────────────────────┘
                   ┌──────────┐   ┌──────────┐   ┌──────────┐
🖥 Frontend        │ F11 erw.:│   │ Smart    │   │ Frankr.  │
                   │ Vertrag  │   │ Contract │   │ Einblick │
                   │ erstellen│   │ Status   │   │ alle     │
                   │ UI       │   │ Tracker  │   │ Verträge │
                   └──────────┘   └──────────┘   └──────────┘
                   ┌──────────┐   ┌──────────┐   ┌──────────┐
⚙ Backend          │ B10 Smart│   │ B10 fer- │   │ B10 Kre- │
                   │ Contract │   │ tig +    │   │ ditsystem│
                   │ API      │   │ Escrow   │   │ (GB)     │
                   └──────────┘   └──────────┘   └──────────┘
                   ┌──────────────────────────────────────────┐
🧠 Game Logic      │ G4 erweitern: Befehlsausführungs-Events  │
                   │ für taktische Vertragsbedingungen         │
                   └──────────────────────────────────────────┘
                   ┌──────────┐   ┌──────────┐   ┌──────────┐
💰 Economy         │ E6 Smart │   │ E7 Condi-│   │ E8 Kredit│
                   │ Contract │   │ tion     │   │ system   │
                   │ System   │   │ Engine   │   │ E9 Frank.│
                   └──────────┘   └──────────┘   └──────────┘
                   ┌──────────────────────────────────────────┐
🏗 Infrastruktur   │ DB-Erweiterung, Escrow-Transaktions-Tests │
                   └──────────────────────────────────────────┘
```

### Phase 4 - Meilensteine

| Meilenstein | Woche | Kriterium |
|-------------|-------|-----------|
| **M12: Verträge erstellbar** | 24 | Spieler können Verträge vorschlagen, annehmen, ablehnen |
| **M13: Escrow funktioniert** | 26 | CR/Ressourcen werden eingefroren, automatisch übertragen/zurückgeführt |
| **M14: Alle Bedingungen** | 28 | Territoriale + taktische + zeitliche Bedingungen + AND/OR + Kreditsystem |

---

## Phase 5: Raketen & Hacks (Tech-Shop)

> **Ziel:** Shop, Hacker-Minute, Raketen und alle Cyber-Kriegs-Elemente einführen.

### Team-Einsatz Phase 5

```
                    Woche 29-30    Woche 31-32    Woche 33-34
                   ┌──────────────────────────────────────────┐
🎨 Design          │ Shop-UI, Raketen-Animation, Hack-Overlay │
                   │ Hacker-Minute Design, Glitch-Effekte     │
                   └──────────────────────────────────────────┘
                   ┌──────────┐   ┌──────────┐   ┌──────────┐
🖥 Frontend        │ F12 Shop │   │ F13 Hack-│   │ Integra- │
                   │ UI       │   │ er-Minute│   │ tion +   │
                   │          │   │ Overlay  │   │ Testing  │
                   └──────────┘   └──────────┘   └──────────┘
                   ┌──────────┐   ┌──────────┐   ┌──────────┐
⚙ Backend          │ B11 Shop │   │ B11 Hack │   │ Integra- │
                   │ API      │   │ + Firewall│  │ tion     │
                   │          │   │ Logik    │   │          │
                   └──────────┘   └──────────┘   └──────────┘
                   ┌──────────┐   ┌──────────┐   ┌──────────┐
🧠 Game Logic      │ G9 Rake- │   │ G10 Hack-│   │ Gesamt-  │
                   │ ten-     │   │ er-Minute│   │ integrat.│
                   │ Mechanik │   │ Logik    │   │ + DATC   │
                   └──────────┘   └──────────┘   └──────────┘
                   ┌──────────┐   ┌──────────┐   ┌──────────┐
💰 Economy         │ E5 Tech- │   │ E5 Item- │   │ Balancing│
                   │ Shop     │   │ Effekte  │   │ Testing  │
                   │ Engine   │   │ (alle)   │   │          │
                   └──────────┘   └──────────┘   └──────────┘
                   ┌──────────────────────────────────────────┐
🏗 Infrastruktur   │ Load-Tests mit vollem Feature-Set         │
                   └──────────────────────────────────────────┘
```

### Phase 5 - Meilensteine

| Meilenstein | Woche | Kriterium |
|-------------|-------|-----------|
| **M15: Shop funktioniert** | 30 | Alle 5 Items kaufbar, CR werden korrekt abgebucht, IT-Provision + DE-Rabatt |
| **M16: Hacker-Minute** | 32 | 60s-Fenster nach Timer, Hack enthüllt Befehl, Firewall blockt |
| **M17: Raketen** | 34 | 15 CR + Lizenz, zerstört alles im Feld, korrekte Auflösungsreihenfolge |

---

## Phase 6: Polish & Balancing

> **Ziel:** UI verfeinern, Animationen, Sound, Performance-Optimierung, Balancing, Beta-Tests.

### Team-Einsatz Phase 6

```
                    Woche 35-36    Woche 37-38    Woche 39-40
                   ┌──────────────────────────────────────────┐
🎨 Design          │ D8: Sound & Music                        │
                   │ Finale Asset-Korrektur, Polishing        │
                   └──────────────────────────────────────────┘
                   ┌──────────────────────────────────────────┐
🖥 Frontend        │ F15: Responsive Polish, Accessibility,   │
                   │ Performance, Offline-Toleranz, PWA       │
                   └──────────────────────────────────────────┘
                   ┌──────────────────────────────────────────┐
⚙ Backend          │ Performance-Optimierung, Edge Cases,     │
                   │ Security Audit, Stress-Tests              │
                   └──────────────────────────────────────────┘
                   ┌──────────────────────────────────────────┐
🧠 Game Logic      │ Balancing: CR-Werte, Einheiten-Kosten,   │
                   │ Buff-Stärken, Raketen-Preis anpassen     │
                   └──────────────────────────────────────────┘
                   ┌──────────────────────────────────────────┐
💰 Economy         │ Wirtschafts-Balancing: Ist die Rakete zu │
                   │ billig? Ist GB zu stark? Sind SF fair?   │
                   └──────────────────────────────────────────┘
                   ┌──────────────────────────────────────────┐
🏗 Infrastruktur   │ Finale Security-Audits, Penetration-     │
                   │ Tests, Performance-Tuning, Backup-Tests  │
                   └──────────────────────────────────────────┘
```

### Phase 6 - Meilensteine

| Meilenstein | Woche | Kriterium |
|-------------|-------|-----------|
| **M18: Beta-Release** | 36 | Geschlossene Beta mit 50 Testern, Feedback sammeln |
| **M19: Balancing abgeschlossen** | 38 | 10+ vollständige Testspiele, keine Game-Breaking Issues |
| **M20: Release Candidate** | 40 | Alle Bugs gefixt, Performance OK, Security OK |

---

## Phase 7: Launch

> **Ziel:** Öffentlicher Launch der Web-App, Marketing, Community aufbauen.

### Team-Einsatz Phase 7

```
                    Woche 41-42
                   ┌──────────────────────────┐
🎨 Design          │ Marketing-Material,       │
                   │ Social Media Assets       │
                   └──────────────────────────┘
                   ┌──────────────────────────┐
🖥 Frontend        │ Letzte Bug-Fixes,         │
                   │ PWA-Optimierung           │
                   └──────────────────────────┘
                   ┌──────────────────────────┐
⚙ Backend          │ Production Readiness,     │
                   │ Monitoring scharf stellen │
                   └──────────────────────────┘
                   ┌──────────────────────────┐
🏗 Infrastruktur   │ I10: Production Deploy,   │
                   │ CDN, Auto-Scaling aktiv   │
                   └──────────────────────────┘
```

### Phase 7 - Meilensteine

| Meilenstein | Woche | Kriterium |
|-------------|-------|-----------|
| **M21: Go-Live** | 41 | Web-App öffentlich erreichbar |
| **M22: Stable** | 42 | 48h ohne kritische Bugs, Monitoring grün |

---

## Gesamt-Meilenstein-Übersicht

```
Woche  2 ── M1  Infrastruktur steht
Woche  4 ── M2  Auth + Lobby spielbar
Woche  6 ── M3  Karte interaktiv
Woche  8 ── M4  Befehle funktionieren
Woche 10 ── M5  ★ MVP KOMPLETT (klassisches Diplomacy spielbar)
Woche 12 ── M6  Credits laufen
Woche 14 ── M7  Ressourcen aktiv (Öl + Seltene Erden)
Woche 16 ── M8  Nationale Buffs funktionieren
Woche 18 ── M9  Luftwaffe spielbar
Woche 20 ── M10 SF + Fog of War
Woche 22 ── M11 ★ NEUE EINHEITEN KOMPLETT
Woche 24 ── M12 Verträge erstellbar
Woche 26 ── M13 Escrow funktioniert
Woche 28 ── M14 ★ SMART CONTRACTS KOMPLETT
Woche 30 ── M15 Shop funktioniert
Woche 32 ── M16 Hacker-Minute
Woche 34 ── M17 ★ ALLE FEATURES KOMPLETT
Woche 36 ── M18 Beta-Release
Woche 38 ── M19 Balancing abgeschlossen
Woche 40 ── M20 Release Candidate
Woche 41 ── M21 ★ GO-LIVE
Woche 42 ── M22 Stable
```

---

## Team-Auslastung pro Phase

| Team | Phase 1 | Phase 2 | Phase 3 | Phase 4 | Phase 5 | Phase 6 | Phase 7 |
|------|---------|---------|---------|---------|---------|---------|---------|
| 🎨 Design | ████ VOLL | ███░ | ██░░ | ██░░ | ██░░ | ██░░ | █░░░ |
| 🖥 Frontend | ████ VOLL | ███░ | ███░ | ██░░ | ███░ | ███░ | █░░░ |
| ⚙ Backend | ████ VOLL | ██░░ | █░░░ | ███░ | ██░░ | ██░░ | █░░░ |
| 🧠 Game Logic | ████ VOLL | █░░░ | ████ VOLL | █░░░ | ███░ | ██░░ | ░░░░ |
| 💰 Economy | ░░░░ | ████ VOLL | █░░░ | ████ VOLL | ███░ | ██░░ | ░░░░ |
| 🏗 Infra | ████ VOLL | ██░░ | █░░░ | █░░░ | ██░░ | ███░ | ██░░ |

---

## Abhängigkeits-Matrix (Wer wartet auf wen?)

```
Phase 1:
  Design D1 (Style Guide)     ──▸ Frontend (alle Screens)
  Design D3 (Karte SVG)       ──▸ Frontend F5 (Karten-Renderer)
  Game Logic G1 (Adjacency)   ──▸ Frontend F5 + F6
  Game Logic G4 (Engine)      ──▸ Backend B8 (Spielstand)
  Infra I1 (Cloud)            ──▸ Backend B1 (Deployment)
  Backend B2 (Auth)           ──▸ Frontend F2 (Login)
  Backend B4 (WebSocket)      ──▸ Frontend F6, F8, F9

Phase 2:
  Backend B9 (Economy API)    ──▸ Frontend F11 (Economy Panel)
  Economy E1-E4               ──▸ Backend B9

Phase 3:
  Game Logic G7+G8            ──▸ Backend (API-Erweiterung)
  Backend (API)               ──▸ Frontend (AF/SF UI)

Phase 4:
  Economy E6-E9               ──▸ Backend B10 (Contract API)
  Backend B10                 ──▸ Frontend (Contract UI)

Phase 5:
  Economy E5 (Shop)           ──▸ Backend B11 (Shop API)
  Game Logic G9+G10           ──▸ Backend + Frontend
```

---

## Risiken & Gegenmaßnahmen

| Risiko | Wahrscheinlichkeit | Impact | Gegenmaßnahme |
|--------|-------------------|--------|---------------|
| Karte (D3) verzögert sich | Mittel | Hoch (blockiert Frontend) | Platzhalter-Karte für Entwicklung, Design liefert nach |
| DATC-Auflösung hat Bugs | Hoch | Hoch (Kernmechanik) | Frühzeitig 200+ DATC-Tests, separates Test-Modul |
| WebSocket-Skalierung | Mittel | Mittel | Redis Pub/Sub von Anfang an, Load-Tests ab Woche 9 |
| Balancing der Wirtschaft | Hoch | Mittel | Alle Werte konfigurierbar, schnelle Iteration in Phase 6 |
| Smart Contract Komplexität | Mittel | Mittel | Einfache Bedingungen zuerst, komplexe (AND/OR) als V2 |
