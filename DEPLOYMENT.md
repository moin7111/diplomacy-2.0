# Diplomacy 2.0 — Deployment-Anleitung

> **Für alle Teams:** Diese Anleitung erklärt, wie ihr lokal entwickelt und auf den Server deployed.

---

## 1. Voraussetzungen

| Tool | Version | Installation |
|------|---------|-------------|
| **Git** | 2.40+ | [git-scm.com](https://git-scm.com) |
| **Node.js** | 22 LTS | [nodejs.org](https://nodejs.org) |
| **Docker Desktop** | 4.x | [docker.com](https://docker.com/products/docker-desktop) |
| **Docker Compose** | v2+ | (in Docker Desktop enthalten) |

## 2. Repository klonen

```bash
git clone https://github.com/DEIN-ACCOUNT/diplomacy-2.0.git
cd diplomacy-2.0
```

## 3. Lokale Entwicklung starten

### 3.1 Environment-Datei erstellen

```bash
cp infrastructure/.env.example infrastructure/.env
# → Passwörter in .env anpasse (für lokal können die Defaults bleiben)
```

### 3.2 Docker Services starten (DB + Redis)

```bash
cd infrastructure
docker compose up -d db redis
```

Prüfen ob alles läuft:
```bash
docker compose ps
# Erwartung: db (healthy), redis (healthy)
```

### 3.3 Backend starten

```bash
cd ../backend
npm install
npm run start:dev
```

Das Backend läuft jetzt auf `http://localhost:4000`.

### 3.4 Frontend starten

```bash
cd ../frontend
npm install
npm run dev
```

Das Frontend läuft jetzt auf `http://localhost:3000`.

---

## 4. Feature entwickeln (Git-Workflow)

### 4.1 Branch erstellen

```bash
# Immer von develop abzweigen!
git checkout develop
git pull origin develop
git checkout -b feature/F1-project-setup    # Siehe BRANCH_STRATEGY.md für Namenskonventionen
```

### 4.2 Committen

```bash
git add .
git commit -m "feat(frontend): add project setup with Next.js"
```

**Commit-Format:** `type(scope): message`
- `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`, `infra`
- Scope = `frontend`, `backend`, `gamelogic`, `infra`, `design`

### 4.3 PR erstellen

```bash
git push origin feature/F1-project-setup
```

Dann auf GitHub: **Pull Request** erstellen → Ziel: `develop`

Die CI-Pipeline läuft automatisch (Lint + Tests).

---

## 5. Server-Zugang (nur Infra-Team)

```bash
# SSH-Verbindung
ssh root@91.99.192.76

# Projekt-Verzeichnis
cd /opt/diplomacy2

# Server-Status
bash scripts/agent-connect.sh
```

### Datenbank-Shell

```bash
docker exec -it diplomacy2-db psql -U diplomacy2 -d diplomacy2
```

### Redis-Shell

```bash
docker exec -it diplomacy2-redis redis-cli -a D2_Redis_S3cur3_2026!
```

---

## 6. Server-Architektur

```
Internet → Cloudflare (DNS + DDoS) → Hetzner Server (91.99.192.76)
                                            │
                                      ┌─────▾─────┐
                                      │   Caddy    │  Auto-HTTPS
                                      │  :80/:443  │  Reverse Proxy
                                      └─────┬──────┘
                                            │
                                      ┌─────▾──────┐
                                      │  NestJS API │  REST + WebSocket
                                      │   :4000     │
                                      └──┬──────┬───┘
                                         │      │
                                   ┌─────▾┐  ┌──▾─────────┐
                                   │Redis │  │ PostgreSQL  │
                                   │:6379 │  │ :5433       │
                                   └──────┘  └─────────────┘
```

### Endpunkte

| URL | Beschreibung |
|-----|-------------|
| `https://diplomacy.tum-s.de/api/*` | REST API |
| `https://diplomacy.tum-s.de/socket.io/*` | WebSocket |
| `https://diplomacy.tum-s.de/health` | Health-Check |

---

## 7. Troubleshooting

### Docker-Container laufen nicht?

```bash
docker compose ps              # Status prüfen
docker compose logs -f api     # API-Logs ansehen
docker compose restart api     # API neustarten
```

### Datenbank-Verbindung fehlgeschlagen?

```bash
# Vom Host aus testen:
docker exec diplomacy2-db psql -U diplomacy2 -d diplomacy2 -c "SELECT 1;"
```

### Redis-Verbindung fehlgeschlagen?

```bash
docker exec diplomacy2-redis redis-cli -a D2_Redis_S3cur3_2026! PING
# Erwartung: PONG
```

### Port bereits belegt?

```bash
# Prüfen welcher Prozess den Port nutzt
sudo lsof -i :4000
sudo lsof -i :5433
```

---

## 8. Wichtige Dateien

| Datei | Beschreibung |
|-------|-------------|
| `infrastructure/docker-compose.yml` | Production Docker Stack |
| `infrastructure/docker-compose.dev.yml` | Lokale Entwicklung Override |
| `infrastructure/.env.example` | Environment Template |
| `.github/BRANCH_STRATEGY.md` | Branch-Strategie & Naming |
| `.github/workflows/ci.yml` | CI Pipeline (Lint + Tests) |
| `.github/workflows/deploy.yml` | CD Pipeline (Deploy to Hetzner) |
| `Konzept.md` | Gesamtkonzept |
| `Projektplan.md` | Zeitplan & Team-Aufgaben |
| `Teams/*.cloud.md` | Team-spezifische Aufgabenpakete |
