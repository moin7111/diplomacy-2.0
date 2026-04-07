# Diplomacy 2.0 - Server & Projekt-Orientierung

## Quick-Start für KI-Agenten

```bash
# 1. Verbinden
ssh root@91.99.192.76

# 2. Status prüfen
bash /opt/diplomacy2/scripts/agent-connect.sh

# 3. Zum Projekt navigieren
cd /opt/diplomacy2
```

---

## Server-Daten

| Eigenschaft | Wert |
|-------------|------|
| **IP** | 91.99.192.76 |
| **OS** | Ubuntu 24.04 LTS |
| **RAM** | 8 GB |
| **CPU** | 4 vCPU |
| **Disk** | 150 GB SSD |
| **Docker** | 29.2.1 + Compose v5.1.0 |
| **Node.js** | v22.22.0 |
| **Webserver** | Caddy (HTTPS automatisch) |

---

## Verzeichnisstruktur

```
/opt/diplomacy2/                    ← PROJEKT-ROOT
├── README.md                       ← Diese Datei
├── docker-compose.yml              ← Docker Stack (DB, Redis, API)
├── .env                            ← Secrets & Config (chmod 600)
│
├── backend/                        ← NestJS Backend (TypeScript)
│   ├── package.json
│   └── src/
│       ├── modules/
│       │   ├── auth/               ← Authentifizierung (JWT)
│       │   ├── game/               ← Spiel-Management (CRUD, State)
│       │   ├── chat/               ← Chat & Diplomatie
│       │   ├── economy/            ← Credits, Ressourcen, Buffs
│       │   ├── shop/               ← Tech-Shop (Hacks, Raketen)
│       │   └── contracts/          ← Smart Contracts / Escrow
│       ├── common/                 ← Shared (Guards, Pipes, DTOs)
│       └── config/                 ← App-Konfiguration
│
├── frontend/                       ← Next.js Web-App (React)
│   └── (noch leer - wird aufgesetzt)
│
├── docs/                           ← Projekt-Dokumentation
│   └── (Konzept, UX, Team-Pläne → siehe lokales Projektverzeichnis)
│
├── scripts/                        ← Hilfsskripte
│   ├── agent-connect.sh            ← Server-Status anzeigen
│   ├── db-reset.sh                 ← Datenbank zurücksetzen
│   └── backup.sh                   ← DB-Backup erstellen
│
└── backups/                        ← Datenbank-Backups
```

---

## Docker Services

| Service | Container | Port (intern) | Image | Status |
|---------|-----------|---------------|-------|--------|
| **PostgreSQL** | diplomacy2-db | 127.0.0.1:5433 | postgres:16-alpine | Running |
| **Redis** | diplomacy2-redis | 127.0.0.1:6379 | redis:7-alpine | Running |
| **API** | diplomacy2-api | 127.0.0.1:4000 | node:22-alpine | Wartet auf Code |

### Docker-Befehle

```bash
cd /opt/diplomacy2

# Alle Services starten
docker compose up -d

# Nur DB + Redis starten (ohne API)
docker compose up -d db redis

# Logs ansehen
docker compose logs -f
docker compose logs -f api        # nur API

# Stoppen
docker compose down

# Neustart
docker compose restart api
```

---

## Datenbank-Zugang

```bash
# Interaktive Shell
docker exec -it diplomacy2-db psql -U diplomacy2 -d diplomacy2

# Einzelner Befehl
docker exec diplomacy2-db psql -U diplomacy2 -d diplomacy2 -c "SELECT 1;"

# Verbindungsstring (für Code)
postgresql://diplomacy2:D2_Pg_S3cur3_2026!@db:5432/diplomacy2      # aus Docker
postgresql://diplomacy2:D2_Pg_S3cur3_2026!@127.0.0.1:5433/diplomacy2  # vom Host
```

---

## Redis-Zugang

```bash
# Interaktive Shell
docker exec -it diplomacy2-redis redis-cli -a D2_Redis_S3cur3_2026!

# Test
docker exec diplomacy2-redis redis-cli -a D2_Redis_S3cur3_2026! PING

# Verbindungsstring (für Code)
redis://:D2_Redis_S3cur3_2026!@redis:6379          # aus Docker
redis://:D2_Redis_S3cur3_2026!@127.0.0.1:6379      # vom Host
```

---

## Web-Zugang (Caddy Reverse Proxy)

| URL | Ziel |
|-----|------|
| https://diplomacy.tum-s.de/api/* | → NestJS API (Port 4000) |
| https://diplomacy.tum-s.de/socket.io/* | → WebSocket (Port 4000) |
| https://diplomacy.tum-s.de/health | → Health-Check |

Frontend wird separat gehostet (Cloudflare Pages oder Vercel).

---

## Nächste Schritte (für KI-Agenten)

1. **Backend initialisieren:**
   ```bash
   cd /opt/diplomacy2/backend
   npx @nestjs/cli new . --skip-install --package-manager npm
   npm install
   npm install @nestjs/websockets @nestjs/platform-socket.io socket.io
   npm install @prisma/client prisma
   npm install @nestjs/jwt @nestjs/passport passport passport-jwt
   npm install ioredis
   ```

2. **Prisma Schema erstellen:**
   ```bash
   npx prisma init
   # Schema in prisma/schema.prisma bearbeiten
   npx prisma migrate dev --name init
   ```

3. **API starten:**
   ```bash
   docker compose up -d  # startet auch API-Container
   ```

---

## Andere Services auf diesem Server

> ACHTUNG: Folgende Services laufen ebenfalls - NICHT anfassen!

| Service | Port | Container |
|---------|------|-----------|
| simplelearn-app | 3000 | simplelearn-app |
| simplelearn-db | 5432 | simplelearn-db |
| Chromium Browser | 3030 | neo-browser |
| Openclaw | 18789 | - (PM2) |
| Abiball | 3005 | - (Node) |
| Qdrant | 6333-6334 | qdrant |
| Tor Proxy | 9050/8118 | tor-privoxy |

**Diplomacy 2.0 nutzt eigene Container und Ports (5433, 6379, 4000) - keine Konflikte.**
