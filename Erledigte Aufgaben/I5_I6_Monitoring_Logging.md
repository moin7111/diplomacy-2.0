# I5 + I6: Monitoring (Uptime Kuma) & Logging (Winston)

**Status:** ✅ Abgeschlossen  
**Datum:** 2026-04-25  
**Team:** Infrastructure-Team

---

## I5 — Monitoring (Uptime Kuma)

### Was umgesetzt wurde

**Uptime Kuma Container** (`infrastructure/docker-compose.server.yml`):
- Service `uptime-kuma` mit Image `louislam/uptime-kuma:1`
- Port intern auf `127.0.0.1:3001:3001` (nur Localhost, kein externer Zugriff)
- Dev-Override (`docker-compose.dev.yml`): Port `3001:3001` extern für lokale Kontrolle
- Datenpersistenz via Named Volume `diplomacy2_uptime_kuma`

**Health-Endpoint** (`backend/src/health/health.controller.ts`):
- Route: `GET /api/health`
- Prüft PostgreSQL via Prisma `SELECT 1`
- Prüft Redis via ioredis `PING`
- Response: `{ status, db, redis, uptime }`

**Caddy-Konfiguration** (`infrastructure/Caddyfile`):
- `/api/health` ist nach außen geblockt (HTTP 403)
- Uptime Kuma greift intern via `http://api:4000/api/health` zu (kein Caddy-Proxy dazwischen)
- Deploy auf Server: `sudo cp infrastructure/Caddyfile /etc/caddy/Caddyfile && sudo systemctl reload caddy`

**Monitor-Setup-Anleitung**: `infrastructure/uptime-kuma-setup.md`
- 3 Monitore: API Health (HTTP), PostgreSQL (TCP), Redis (TCP)
- Alert-Konfiguration dokumentiert

---

## I6 — Logging (Winston)

### Was umgesetzt wurde

**Winston Logger** (`backend/src/common/logger/winston.config.ts`):
- Log-Level: `debug` (dev) / `info` (production) — via `NODE_ENV`
- Console Transport: Colorized, timestamp, context
- File Transport: Daily Rotation — `logs/app-YYYY-MM-DD.log`
  - Max 7 Tage Retention (`maxFiles: '7d'`)
  - Max 10 MB pro Datei (`maxSize: '10m'`)
  - JSON-Format für Machine-Readability

**Integration** (`backend/src/main.ts`):
- `WinstonModule.createLogger(winstonConfig)` als globaler NestJS-Logger

**Logs-Verzeichnis** (`infrastructure/docker-compose.server.yml`):
- `mkdir -p logs` vor Start, sodass Winston direkt schreiben kann
- Logs landen auf Host via Volume-Mount `./backend:/app` → `./backend/logs/`

**Log-Events (bereits implementiert):**
| Modul | Events |
|-------|--------|
| Auth (`auth.service.ts`) | Login success/fail, Register success/conflict |
| Game (`game.service.ts`) | Game create, Game start |
| Timer (`timer.service.ts`) | Turn resolve, Timer start/expire |
| WebSocket (`game.gateway.ts`) | WS connect, WS disconnect, Orders submitted |
| Errors (`all-exceptions.filter.ts`) | Alle Exceptions mit Stack Trace |

---

## Deployment-Schritte (Server)

```bash
# 1. Caddy-Konfiguration deployen
sudo cp /opt/diplomacy2/infrastructure/Caddyfile /etc/caddy/Caddyfile
sudo caddy validate --config /etc/caddy/Caddyfile
sudo systemctl reload caddy

# 2. Docker Stack neu starten (mit Uptime Kuma)
cd /opt/diplomacy2
docker compose up -d

# 3. Health-Check testen (intern)
curl http://localhost:4000/api/health

# 4. Uptime Kuma aufrufen (via SSH-Tunnel)
# ssh -L 3001:127.0.0.1:3001 root@91.99.192.76
# → http://localhost:3001
# Monitore gemäß infrastructure/uptime-kuma-setup.md einrichten
```
