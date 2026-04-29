# Team: Backend & Server

## Teamverantwortung

Das Backend-Team baut die gesamte Server-Infrastruktur: REST API, WebSocket-Server, Datenbank, Authentifizierung, Chat-Service und die Schnittstellen zu allen anderen Systemen.

---

## Tech-Stack

| Technologie | Zweck |
|-------------|-------|
| **Node.js + NestJS** | Backend Framework (modularer Aufbau) |
| **Socket.io** | WebSocket-Server für Echtzeit (Züge, Chat, Timer) |
| **PostgreSQL** | Primäre Datenbank (Spielstände, User, Transaktionen) |
| **Redis** | Session-Store, Cache, Pub/Sub für Echtzeit-Events |
| **Prisma / TypeORM** | ORM für Datenbank-Zugriff |
| **JWT** | Token-basierte Authentifizierung |
| **Web Push API** | Push Notifications (via Service Worker) |
| **Docker** | Containerisierung |
| **Nginx** | Reverse Proxy & Load Balancing |

---

## Aufgabenpakete

### Paket B1: Projektsetup & Grundinfrastruktur
**Priorität:** Phase 1 (MVP)

- [ ] NestJS Projekt initialisieren (Module, Controller, Services)
- [ ] Docker-Setup (Dockerfile, docker-compose für Dev)
- [ ] PostgreSQL-Datenbank aufsetzen (Dev + Staging)
- [ ] Redis-Server konfigurieren
- [ ] Basis-Logging & Error-Handling Middleware
- [ ] Environment-Config (.env, Secrets Management)
- [ ] CI/CD Pipeline (Build, Test, Deploy)
- [ ] API-Dokumentation Setup (Swagger/OpenAPI)

### Paket B2: Authentifizierung & User-Management
**Priorität:** Phase 1 (MVP)

- [ ] User-Datenmodell (id, email, username, password_hash, avatar_id, created_at)
  - `avatar_id` referenziert den gewählten Avatar — dieser wird **in-game als Nationssymbol** des Spielers angezeigt (ersetzt Länderflagge in Chat, Economy-Panel, Lobby und HUD)
- [ ] POST /auth/register - Registrierung (E-Mail, Username, Passwort)
- [ ] POST /auth/login - Login (E-Mail + Passwort → JWT)
- [ ] POST /auth/refresh - Token Refresh
- [ ] GET /auth/me - Aktueller User
- [ ] PATCH /users/me - Profil updaten (Username, Avatar)
- [ ] Passwort-Hashing (bcrypt)
- [ ] JWT-Middleware für geschützte Routes
- [ ] Rate Limiting (Login-Versuche)
- [ ] Social Auth (Google, Apple) - Optional

### Paket B3: Spiel-Management API
**Priorität:** Phase 1 (MVP)

- [ ] Game-Datenmodell:
  ```
  Game: id, name, host_id, status (lobby/active/finished),
        config (rockets, timers, mode), room_code,
        current_phase, current_year, created_at
  GamePlayer: game_id, user_id, nation, is_ready
  ```
- [ ] POST /games - Spiel erstellen (Config + Raumcode generieren)
- [ ] POST /games/:id/join - Spiel beitreten (via Raumcode)
- [ ] GET /games - Eigene Spiele + öffentliche Spiele listen
- [ ] GET /games/:id - Spieldetails inkl. Spieler
- [ ] POST /games/:id/start - Spiel starten (nur Host)
- [ ] POST /games/:id/leave - Spiel verlassen
- [ ] POST /games/:id/surrender - Aufgeben
- [ ] Raumcode-Generierung (kurz, eindeutig, z.B. "A7X3K")
- [ ] Deep-Link Support für Raumcode-Sharing

### Paket B4: WebSocket-Server (Echtzeit)
**Priorität:** Phase 1 (MVP) - Kritischer Pfad

- [ ] Socket.io Server Setup mit JWT-Auth
- [ ] Game-Rooms (jedes Spiel = eigener Socket-Room)
- [ ] Events definieren:
  ```
  Client → Server:
  - join_game(game_id)
  - submit_orders(game_id, orders[])
  - send_message(game_id, recipient, text)

  Server → Client:
  - game_state_update(state)
  - phase_change(phase, year, timer)
  - timer_tick(remaining_seconds)
  - orders_resolved(results)
  - new_message(from, text, timestamp)
  - player_joined(player)
  - player_left(player)
  ```
- [ ] Connection Recovery (Reconnect-Logik)
- [ ] Heartbeat / Ping-Pong für Connection Health
- [ ] Redis Pub/Sub für Multi-Server Scaling

### Paket B5: Timer-System
**Priorität:** Phase 1 (MVP)

- [ ] Server-seitiger Timer pro Game-Phase
- [ ] Timer-Start bei Phasenbeginn
- [ ] Timer-Broadcast an alle Clients (jede Sekunde)
- [ ] Auto-Hold: Wenn Timer abläuft und Spieler keinen Befehl gegeben hat → automatisch Halten
- [ ] Hacker-Minute: Zusätzliches 60s-Fenster nach Haupttimer
- [ ] Timer-Konfiguration aus Game-Config lesen
- [ ] Pause/Resume (für Host oder bei Disconnects)

### Paket B6: Befehls-API
**Priorität:** Phase 1 (MVP)

- [ ] Order-Datenmodell:
  ```
  Order: id, game_id, player_id, phase, year,
         unit_type, origin, target, order_type,
         support_target, convoy_route, is_final
  ```
- [ ] POST /games/:id/orders - Befehle einreichen
- [ ] PUT /games/:id/orders/:order_id - Befehl ändern (vor Abgabe)
- [ ] DELETE /games/:id/orders/:order_id - Befehl löschen
- [ ] POST /games/:id/orders/submit - Befehle final abgeben
- [ ] GET /games/:id/orders/mine - Eigene Befehle der aktuellen Phase
- [ ] GET /games/:id/orders/history - Vergangene Befehle (nach Auflösung)
- [ ] Befehlsvalidierung (Grundprüfung, Details bei Game-Logic-Team)
- [ ] Hacker-Minute: Befehle nach Timer noch änderbar (für Hack-Käufer)

### Paket B7: Chat-Service
**Priorität:** Phase 1 (MVP)

- [ ] Message-Datenmodell:
  ```
  Conversation: id, game_id, type (1v1/group), participants[]
  Message: id, conversation_id, sender_id, text, timestamp, is_read
  ```
- [ ] WebSocket: send_message / receive_message Events
- [ ] GET /games/:id/conversations - Alle Gespräche im Spiel
- [ ] GET /conversations/:id/messages - Nachrichten eines Gesprächs
- [ ] POST /conversations - Neues Gespräch erstellen
- [ ] Ungelesen-Counter pro Conversation
- [ ] Push Notification bei neuer Nachricht (FCM)
- [ ] Message-Persistenz in PostgreSQL

### Paket B8: Spielstand-Verwaltung
**Priorität:** Phase 1 (MVP)

- [ ] GameState-Datenmodell:
  ```
  GameState: game_id, phase, year,
             territories[] (owner, unit),
             supply_centers[] (owner),
             eliminated_players[]
  ```
- [ ] Spielstand nach jeder Phasenauflösung speichern
- [ ] GET /games/:id/state - Aktueller Spielstand
- [ ] GET /games/:id/history - Komplette Spielhistorie
- [ ] Siegbedingung prüfen (18 VZ → Spiel beenden)
- [ ] Replay-Daten speichern (für spätere Wiedergabe)

### Paket B9: Wirtschafts-Engine API
**Priorität:** Phase 2

- [ ] Economy-Datenmodell:
  ```
  PlayerEconomy: game_id, player_id, credits, energy_units,
                 rare_earth_licenses, active_buffs[]
  Transaction: id, game_id, type, from, to, amount, timestamp
  ```
- [ ] Credit-Generierung nach Herbstzug (1 CR/VZ, 2 CR für GB-Hauptstädte)
- [ ] Ressourcen-Produktion (Energie: RU, Lizenzen: TR) im Winter
- [ ] GET /games/:id/economy - Wirtschaftsdaten aller Spieler
- [ ] GET /games/:id/economy/mine - Eigene Wirtschaftsdaten
- [ ] Nationale Buffs berechnen und anwenden
- [ ] Buff-Verlust/Gewinn bei Hauptstadt-Kontrolle prüfen

### Paket B10: Smart Contract Engine
**Priorität:** Phase 4

- [ ] Contract-Datenmodell:
  ```
  SmartContract: id, game_id, proposer_id, accepter_id,
                 status (proposed/active/fulfilled/expired/cancelled),
                 offer (type, amount), demand (type, amount),
                 conditions[], deadline_phase, deadline_year,
                 escrow_locked_values
  ```
- [ ] POST /games/:id/contracts - Vertrag vorschlagen
- [ ] POST /contracts/:id/accept - Vertrag annehmen (Escrow Lock)
- [ ] POST /contracts/:id/reject - Vertrag ablehnen
- [ ] GET /games/:id/contracts - Eigene Verträge
- [ ] GET /games/:id/contracts/all - Alle Verträge (nur Frankreich-Buff)
- [ ] Escrow-Engine: CR/Ressourcen einfrieren bei Vertragsannahme
- [ ] Condition-Checker: Bedingungen nach jeder Phase prüfen
  - Territoriale Bedingungen (Gebietskontrolle)
  - Taktische Bedingungen (Befehlsausführung)
  - Ressourcen-Trigger (Gegenseitiger Tausch)
  - Zeitfaktoren (Laufzeit, Deadline, Raten)
  - AND/OR Logik für Multi-Trigger
- [ ] Auto-Transfer bei Bedingungserfüllung
- [ ] Auto-Rückabwicklung bei Fristablauf
- [ ] Britisches Kreditsystem (automatische Rückzahlung)

### Paket B11: Shop-API
**Priorität:** Phase 5

- [ ] ShopItem-Datenmodell + Preistabelle
- [ ] POST /games/:id/shop/buy - Item kaufen
- [ ] Hack-Logik: Zufälligen feindlichen Befehl enthüllen
- [ ] Firewall-Logik: Hack-Schutz für aktuelle Phase
- [ ] Infrastruktur-Schlag: VZ markieren als sabotiert
- [ ] Schwarzmarkt-Treibstoff: AF-Bewegung ohne Öl-Vertrag
- [ ] Raketen-Kauf: Prüfe 15 CR + Seltene-Erden-Lizenz
- [ ] Italien-Provision automatisch abbuchen (1 CR pro Kauf)
- [ ] Deutschland-Rabatt anwenden (1 CR weniger, min 0.5 CR)

### Paket B12: Push Notifications
**Priorität:** Phase 2

- [ ] Web Push API Integration (VAPID Keys, Service Worker)
- [ ] Notification-Events:
  - Neue Phase beginnt
  - Timer läuft fast ab (letzte Minute)
  - Neue Chat-Nachricht
  - Spiel-Einladung
  - Vertrag vorgeschlagen
  - Dein Zug wird erwartet
- [ ] Notification-Preferences (User kann Typen an/aus stellen)
- [ ] Batch-Notifications (mehrere Nachrichten zusammenfassen)

---

## Datenbank-Schema (Übersicht)

```
Users
├── id (UUID)
├── email (unique)
├── username (unique)
├── password_hash
├── avatar_id
└── created_at

Games
├── id (UUID)
├── name
├── host_id → Users
├── status (lobby|active|finished)
├── config (JSONB)
├── room_code (unique)
├── current_phase
├── current_year
└── created_at

GamePlayers
├── game_id → Games
├── user_id → Users
├── nation
└── is_ready

GameStates (pro Phase gespeichert)
├── id
├── game_id → Games
├── phase, year
├── territories (JSONB)
└── supply_centers (JSONB)

Orders
├── id
├── game_id, player_id
├── phase, year
├── unit_type, origin, target
├── order_type
└── is_final

Conversations & Messages
PlayerEconomy
SmartContracts
ShopTransactions
```

---

## API Design Prinzipien

- RESTful für CRUD-Operationen
- WebSocket für alle Echtzeit-Events
- JWT Auth auf allen Endpoints
- Pagination für Listen (Matches, Messages, History)
- Consistent Error Format: `{ error: string, code: number, details?: any }`
- Rate Limiting: 100 req/min (Auth), 30 req/min (Shop)

---

## Abhängigkeiten zu anderen Teams

| Von Team | Benötigt | Für Paket |
|----------|----------|-----------|
| Game Logic | Befehlsauflösungs-Engine (Library/Module) | B6, B8 |
| Game Logic | Karten-Daten (Adjacency-Graph) | B6 |
| Frontend | API-Verträge (Request/Response Format) | Alle |
| Infrastructure | Server-Setup, DNS, SSL | B1 |
| Economy | Smart Contract Regel-Engine | B10 |

---

## Deliverables pro Phase

| Phase | Pakete | Beschreibung |
|-------|--------|-------------|
| Phase 1 (MVP) | B1-B8 | Auth, Game CRUD, WebSocket, Timer, Orders, Chat, State |
| Phase 2 | B9, B12 | Wirtschafts-Engine, Push Notifications |
| Phase 4 | B10 | Smart Contract Engine |
| Phase 5 | B11 | Shop-API + Hack/Firewall/Raketen |
