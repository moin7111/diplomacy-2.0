# Erledigte Aufgaben — Infrastructure Team (I1)

> Zuletzt aktualisiert: 2026-04-07

---

## ✅ Paket I1: Hetzner Cloud Setup — KOMPLETT ERLEDIGT

| Aufgabe | Status | Details |
|---------|--------|---------|
| Hetzner Cloud Server bestellt | ✅ | CX31: 8 GB RAM, 4 vCPU, 150 GB SSD |
| Ubuntu aufgesetzt | ✅ | Ubuntu 24.04.4 LTS |
| Docker installiert | ✅ | Docker 29.2.1 + Compose v5.1.0 |
| Cloudflare DNS konfiguriert | ✅ | diplomacy.tum-s.de → 91.99.192.76 |
| SSL/HTTPS konfiguriert | ✅ | Via Caddy (automatisches Let's Encrypt) |
| Docker Compose Stack erstellt | ✅ | PostgreSQL 16 + Redis 7 + API (Placeholder) |
| PostgreSQL Datenbank + User | ✅ | DB: diplomacy2, User: diplomacy2 |
| Redis mit Passwort | ✅ | 256MB maxmemory, allkeys-lru Policy |
| .env Secrets erstellt | ✅ | Auf Server unter /opt/diplomacy2/.env |
| Server-Orientierung (README) | ✅ | /opt/diplomacy2/README.md |
| Hilfsskripte | ✅ | agent-connect.sh, db-reset.sh, backup.sh |

### Server-Daten

```
IP:       91.99.192.76
SSH:      ssh root@91.99.192.76
Domain:   diplomacy.tum-s.de
OS:       Ubuntu 24.04 LTS
RAM:      8 GB
CPU:      4 vCPU
Disk:     150 GB SSD
Docker:   29.2.1 + Compose v5.1.0
Caddy:    Reverse Proxy (Auto-HTTPS)
```

### Laufende Docker-Container

| Container | Image | Port | Status |
|-----------|-------|------|--------|
| diplomacy2-db | postgres:16-alpine | 127.0.0.1:5433 | ✅ Running (healthy) |
| diplomacy2-redis | redis:7-alpine | 127.0.0.1:6379 | ✅ Running (healthy) |
| diplomacy2-api | node:22-alpine | 127.0.0.1:4000 | ✅ Running (wartet auf Code) |

---

## ✅ Konzept-Dateien korrigiert

| Datei | Was korrigiert |
|-------|----------------|
| `Teams/infrastructure-team.cloud.md` | Nginx→Caddy, CX21→CX31 8GB, RAM-Budget, Architektur-Diagramm, I1-Tasks als erledigt markiert |
| `Konzept.md` | Tech-Stack: Caddy, Pixi.js, PostgreSQL 16, Redis 7, CX31 8GB |
| `ORIENTIERUNG.md` | Docker-Image-Details, Cloudflare-Details präzisiert |

---

## ✅ Infrastructure-Dateien erstellt

| Datei | Beschreibung |
|-------|-------------|
| `infrastructure/docker-compose.server.yml` | Kopie des Production-Stacks vom Server |
| `infrastructure/docker-compose.dev.yml` | Override für lokale Entwicklung |
| `infrastructure/.env.example` | Environment-Template (ohne echte Secrets) |
| `.gitignore` | Umfassendes Gitignore für das Projekt |

---

## ✅ GitHub Repository erstellt

| Eigenschaft | Wert |
|-------------|------|
| **URL** | https://github.com/moin7111/diplomacy-2.0 |
| **Clone** | `git clone https://github.com/moin7111/diplomacy-2.0.git` |
| **Default Branch** | `develop` |
| **Branches** | `main` (Production), `develop` (Integration) |
| **Branch-Strategie** | `.github/BRANCH_STRATEGY.md` |
| **PR-Template** | `.github/PULL_REQUEST_TEMPLATE.md` |

---

## ✅ Deployment-Anleitung erstellt

| Datei | Beschreibung |
|-------|-------------|
| `DEPLOYMENT.md` | Vollständige Anleitung für alle Teams (Lokale Dev, Git-Workflow, Server-Zugang, Troubleshooting) |

---

## ⏳ Noch offen (Paket I1)

| Aufgabe | Status | Priorität |
|---------|--------|-----------|
| Hetzner Firewall Rules prüfen | ⏳ | Mittel |
| Automatische Snapshots/Backups | ⏳ | Mittel |
| Fail2Ban installieren | ⏳ | Niedrig |
| UFW Firewall konfigurieren | ⏳ | Mittel |
| GitHub Repository erstellen | ✅ | https://github.com/moin7111/diplomacy-2.0 |
| CI/CD Workflows (lokal) | ✅ | `.github/workflows/ci.yml` + `deploy.yml` (lokal vorhanden, müssen über GitHub UI hochgeladen werden — Token braucht `workflow` Scope) |
| SSH Shortcut eingerichtet | ✅ | `ssh diplomacy` funktioniert |
| Team Quick-Connect Guide | ✅ | `infrastructure/QUICK-CONNECT.md` |

---

## ⏳ Offen: Weitere Pakete (Phase 1)

| Paket | Beschreibung | Status |
|-------|-------------|--------|
| **I2** | CI/CD Pipeline | ✅ Workflow-Dateien erstellt, repo fehlt noch |
| **I3** | Deployment-Konfiguration | ✅ docker-compose + Anleitung erstellt |
| **I4** | WebSocket Infrastruktur | ⏳ Konfiguration vorbereitet |
| **I5** | Monitoring & Alerting | ⏳ |
| **I6** | Logging | ⏳ |
| **I7** | Sicherheit | ⏳ Teilweise (SSH Key-Only, Caddy HTTPS) |
| **I9** | QA & Testing | ⏳ |
