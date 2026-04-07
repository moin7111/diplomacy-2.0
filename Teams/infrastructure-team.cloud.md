# Team: Infrastructure, DevOps & QA

## Teamverantwortung

Das Infrastructure-Team verantwortet die gesamte Cloud-Infrastruktur, CI/CD, Deployment, Monitoring, Sicherheit und Qualitätssicherung. Zudem ist das Team für Performance, Skalierung und den reibungslosen Betrieb verantwortlich.

---

## Tech-Stack

| Technologie | Zweck |
|-------------|-------|
| **Hetzner Cloud CX31 (8GB RAM)** | VPS-Hosting (1 Server, Startphase) |
| **Docker + Docker Compose v5.1.0** | Container-Management |
| **GitHub Actions** | CI/CD Pipeline |
| **Caddy** | Reverse Proxy, automatisches HTTPS, WebSocket-Proxy |
| **PostgreSQL 16** | Datenbank (Docker-Container, postgres:16-alpine) |
| **Redis 7** | Session Store, Cache, Pub/Sub (Docker-Container, redis:7-alpine) |
| **Cloudflare (Free)** | DNS, CDN, DDoS-Schutz |
| **Sentry (Free Tier)** | Error Tracking |
| **Uptime Kuma** | Self-hosted Monitoring (leichtgewichtig) |
| **Docker Logs + Loki** | Logging (ressourcenschonend) |
| **Let's Encrypt (via Caddy)** | SSL Zertifikate (automatisch durch Caddy verwaltet) |

### RAM-Budget (8 GB Hetzner CX31)

```
Komponente              RAM (geschätzt)
─────────────────────────────────────
Caddy                    ~30 MB
NestJS Backend           ~200-400 MB
PostgreSQL               ~300-500 MB
Redis                    ~50-256 MB (max 256mb konfiguriert)
Andere Services          ~800 MB (simplelearn, abiball, qdrant, etc.)
System / Docker Overhead ~500 MB
─────────────────────────────────────
TOTAL                    ~1.9 - 2.5 GB (von 8 GB)
Reserve                  ~5 GB (für Peaks, Logs, weitere Services)
```

**Empfehlung:** Frontend als statische Build-Files auf Cloudflare Pages hosten (kostenlos, 0 MB RAM auf Hetzner). Dann bleibt der Hetzner-Server rein für Backend + DB + Redis.

---

## Aufgabenpakete

### Paket I1: Hetzner Cloud Setup ✅ ERLEDIGT
**Priorität:** Phase 1 (MVP) - Kritischer Pfad

- [x] Hetzner Cloud Account + CX31 Server (8 GB RAM, 4 vCPU, 150 GB SSD)
- [x] Ubuntu 24.04 LTS aufsetzen + Hardening (SSH Key-Only)
- [x] Docker 29.2.1 + Docker Compose v5.1.0 installiert
- [x] Cloudflare DNS konfiguriert (diplomacy.tum-s.de → 91.99.192.76)
- [x] SSL via Caddy (automatisches HTTPS mit Let's Encrypt)
- [x] Docker Compose Stack erstellt:
  ```yaml
  services:
    api:         # NestJS Backend (node:22-alpine, Port 4000)
    db:          # PostgreSQL 16 (postgres:16-alpine, Port 5433)
    redis:       # Redis 7 (redis:7-alpine, Port 6379)
  ```
  *Caddy läuft separat als Systemservice (nicht in Docker)*
- [x] PostgreSQL Datenbank + User angelegt (diplomacy2/diplomacy2)
- [x] Redis mit Passwort konfiguriert (maxmemory 256mb, allkeys-lru)
- [x] .env Secrets sicher abgelegt
- [ ] Hetzner Firewall Rules (nur 80, 443, 22) — *zu prüfen*
- [ ] Automatische Backups aktivieren (Hetzner Snapshots, täglich) — *zu prüfen*

### Paket I2: CI/CD Pipeline
**Priorität:** Phase 1 (MVP)

- [ ] GitHub Repository Setup (Monorepo oder Multi-Repo Strategie)
- [ ] GitHub Actions Workflows:
  ```
  PR erstellt → Lint + Type-Check + Unit-Tests
  PR merged → Build + Integration-Tests
  Tag erstellt → Build + Deploy to Staging
  Release → Deploy to Production
  ```
- [ ] Docker Image Build & Push (Container Registry)
- [ ] Automated Database Migrations
- [ ] Rollback-Strategie (Blue-Green oder Canary)
- [ ] Branch-Protection Rules (main, staging)
- [ ] Code Coverage Reports
- [ ] Dependency Scanning (Dependabot / Snyk)

### Paket I3: Deployment-Konfiguration
**Priorität:** Phase 1 (MVP)

- [ ] Docker-Compose für lokale Entwicklung (identisch zu Production):
  ```yaml
  services:
    nginx:      # Reverse Proxy
    api:        # NestJS Backend
    db:         # PostgreSQL
    redis:      # Redis
  ```
- [ ] Frontend separat: `npm run dev` lokal, Production auf Cloudflare Pages
- [ ] Gleiche Docker-Compose Datei für Dev + Hetzner (mit .env Override)
- [ ] Health-Check Endpoints (/health, /ready)
- [ ] Graceful Shutdown (WebSocket Connections draining)
- [ ] `docker compose up -d` als Deployment-Methode
- [ ] Watchtower für automatische Docker Image Updates (optional)

### Paket I4: WebSocket Infrastruktur
**Priorität:** Phase 1 (MVP) - Kritischer Pfad

- [ ] Caddy WebSocket Proxy konfigurieren (automatisch bei reverse_proxy)
- [ ] Cloudflare WebSocket Support aktivieren (automatisch bei Pro, Free = 100 Connections)
- [ ] Redis Pub/Sub vorbereiten (für späteren Multi-Server Ausbau)
- [ ] Connection Limit testen (realistisch: ~500-1000 auf 8GB Server)
- [ ] WebSocket Health Monitoring (Uptime Kuma Check)
- [ ] Reconnection-Strategie bei Server-Restart / Deploy
- [ ] Load-Test: 5-10 gleichzeitige Spiele (35-70 Spieler) als Ziel
- [ ] Fallback: Long-Polling wenn WebSocket nicht möglich

### Paket I5: Monitoring & Alerting
**Priorität:** Phase 1 (MVP)

- [ ] Uptime Kuma als leichtgewichtiges Self-Hosted Monitoring
- [ ] Monitoring-Checks:
  - HTTP Health Check (API /health)
  - WebSocket Ping Check
  - PostgreSQL Connection Check
  - Redis Ping Check
  - Disk Space Check
  - RAM Usage Check
- [ ] Sentry Integration (Backend + Frontend, Free Tier)
- [ ] Alert-Regeln (Uptime Kuma → Telegram/Discord/E-Mail):
  - API nicht erreichbar → Critical
  - Response Time > 1s → Warning
  - Disk > 80% → Warning
  - RAM > 85% → Warning
- [ ] `htop` / `docker stats` als manuelles Monitoring

### Paket I6: Logging
**Priorität:** Phase 1 (MVP)

- [ ] Structured Logging (JSON Format) im Backend
- [ ] Log Levels: Error, Warn, Info, Debug
- [ ] Request-ID Tracking (Correlation IDs)
- [ ] Docker Logs (`docker compose logs -f api`) als primäres Log-Tool
- [ ] Logrotate konfigurieren (verhindert Disk-Überlauf auf 40GB SSD)
- [ ] Log Retention: 14 Tage auf Disk (40GB SSD = sparsam sein)
- [ ] Game-Event Logging (für Debugging + Replay):
  - Befehlseingabe
  - Befehlsauflösung
  - Transaktionen
  - Vertragsaktionen

### Paket I7: Sicherheit
**Priorität:** Phase 1 (MVP)

- [ ] HTTPS Everywhere (TLS 1.3)
- [ ] Rate Limiting:
  - Login: 5 Versuche / 15 Min
  - API: 100 req/min (Auth), 30 req/min (Shop)
  - WebSocket: 50 Events/Sekunde
- [ ] Input Sanitization (alle API-Endpoints)
- [ ] SQL Injection Prevention (ORM + Parameterized Queries)
- [ ] XSS Prevention (Chat-Nachrichten escapen)
- [ ] CORS Konfiguration (nur erlaubte Origins)
- [ ] JWT Token Rotation + Refresh Token Flow
- [ ] DDoS-Schutz (Cloudflare)
- [ ] Dependency Audit (npm audit, regelmäßig)
- [ ] Data Encryption at Rest (Datenbank)
- [ ] GDPR Compliance (Daten-Export, Löschung auf Anfrage)

### Paket I8: Datenbank-Optimierung
**Priorität:** Phase 2

- [ ] Index-Strategie:
  ```sql
  -- Performance-kritische Queries
  CREATE INDEX idx_games_status ON games(status);
  CREATE INDEX idx_game_players ON game_players(game_id, user_id);
  CREATE INDEX idx_orders_game_phase ON orders(game_id, phase, year);
  CREATE INDEX idx_messages_conv ON messages(conversation_id, timestamp);
  CREATE INDEX idx_contracts_game ON smart_contracts(game_id, status);
  ```
- [ ] Query-Performance Monitoring (slow query log)
- [ ] Connection Pooling (PgBouncer oder NestJS Pool-Config, max 20 Connections)
- [ ] Backup-Strategie (Hetzner Snapshots täglich + pg_dump Cronjob)
- [ ] Archivierung abgeschlossener Spiele (nach 30 Tagen, Disk-Platz sparen)

### Paket I9: QA & Testing Infrastructure
**Priorität:** Phase 1 (MVP)

- [ ] Test-Umgebung: Lokal mit Docker Compose (identisch zu Production)
- [ ] E2E-Test-Suite (Playwright / Cypress)
- [ ] Load-Testing Setup (k6 / Artillery):
  ```
  Realistische Szenarien für 4GB Hetzner:
  - 5-10 gleichzeitige Spiele, 35-70 Spieler
  - Peak: 70 Befehle gleichzeitig (Phasenende)
  - WebSocket: 200-500 gleichzeitige Connections
  - Chat: 20 Nachrichten/Sekunde
  ```
- [ ] Game Logic Regression Tests (DATC Suite)
- [ ] API Contract Tests (OpenAPI Spec)
- [ ] Security Penetration Testing (OWASP Top 10)
- [ ] Performance Baseline festlegen:
  - API Response < 200ms (p95)
  - WebSocket Latenz < 100ms
  - Befehlsauflösung < 2 Sekunden

### Paket I10: Web-App Deployment & PWA
**Priorität:** Phase 7

- [ ] Production-Domain konfigurieren (Cloudflare DNS → Hetzner)
- [ ] Frontend-Hosting auf Cloudflare Pages (kostenlos, global CDN)
- [ ] PWA-Manifest + Service Worker verifizieren
- [ ] "Add to Homescreen"-Flow testen (iPhone Safari, iPad)
- [ ] Beta-Testing: Geschlossene URL mit Passwortschutz
- [ ] Release-Management (Versionierung, Changelog)
- [ ] Zero-Downtime Deployments (Blue-Green / Rolling)
- [ ] Error Tracking (Sentry Browser SDK)
- [ ] Analytics (Plausible / Mixpanel / PostHog)
- [ ] Performance Monitoring (Core Web Vitals, Lighthouse CI)

---

## Architektur-Diagramm (Hetzner 8GB Setup)

```
┌──────────────────┐    ┌─────────────────────────┐
│  Cloudflare      │    │  Cloudflare Pages       │
│  (DNS + CDN +    │    │  (Next.js Static Build) │
│   DDoS-Schutz)   │    │  = Frontend Hosting     │
└────────┬─────────┘    │  (KOSTENLOS, 0 RAM)     │
         │              └─────────────────────────┘
         │
┌────────▾──────────────────────────────────────┐
│  HETZNER CX31 (8 GB RAM, 4 vCPU, 150 GB SSD) │
│                                                │
│  ┌────────────────┐                            │
│  │  Caddy         │  Reverse Proxy (System)    │
│  │  (Port 80/443) │  Auto-HTTPS + WebSocket    │
│  └────────┬───────┘                            │
│           │                                    │
│  ┌────────▾──────────────────────────────────┐ │
│  │  Docker Compose                           │ │
│  │                                           │ │
│  │  ┌─────────────┐                          │ │
│  │  │  NestJS     │  REST API + WebSocket    │ │
│  │  │  Backend    │  Port 4000, ~300 MB RAM  │ │
│  │  └──┬──────┬───┘                          │ │
│  │     │      │                              │ │
│  │  ┌──▾────┐ ┌▾──────────┐                  │ │
│  │  │ Redis │ │ PostgreSQL│                  │ │
│  │  │ ~256MB│ │ ~400MB    │                  │ │
│  │  └───────┘ └───────────┘                  │ │
│  └───────────────────────────────────────────┘ │
│                                                │
│  Andere Services: simplelearn, abiball, etc.   │
│  Freier RAM: ~5+ GB Reserve                    │
└────────────────────────────────────────────────┘
```

### Skalierungs-Pfad (Zukunft)

```
Phase 1-6 (jetzt):   1x Hetzner CX31 (8GB)      → 10-20 Spiele
Wenn nötig:          1x Hetzner CX41 (16GB)      → 30-50 Spiele
Später:              CX41 + separater DB-Server   → 50+ Spiele
Groß:                Hetzner Cloud Load Balancer   → Unbegrenzt
```

---

## Abhängigkeiten zu anderen Teams

| Von Team | Benötigt | Für Paket |
|----------|----------|-----------|
| Backend | Dockerfile, Health Endpoints | I1, I3 |
| Backend | DB Migrations (Prisma/TypeORM) | I2 |
| Frontend | Build-Konfiguration (Next.js Build) | I10 |
| Alle Teams | Test-Suites | I9 |

---

## Deliverables pro Phase

| Phase | Pakete | Beschreibung |
|-------|--------|-------------|
| Phase 1 (MVP) | I1-I7, I9 | Cloud-Setup, CI/CD, WebSocket-Infra, Monitoring, Security, QA |
| Phase 2 | I8 | Datenbank-Optimierung |
| Phase 7 | I10 | Web-App Production Deployment & PWA |
