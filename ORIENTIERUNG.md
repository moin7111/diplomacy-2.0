# Diplomacy 2.0 - Projekt-Orientierung

## Wo finde ich was?

---

### Lokale Dateien (Konzept & Planung)

```
C:\Users\leons\Downloads\Diplomacy 2.0\
│
├── ORIENTIERUNG.md              ← DIESE DATEI (Start hier)
├── Konzept.md                   ← Ausführliches Gesamtkonzept
│                                   (Spielregeln, Einheiten, Wirtschaft,
│                                    Smart Contracts, Tech-Architektur)
│
├── UX-Uebersicht.md            ← User Experience & Screen-Designs
│                                   (App-Flow, Wireframes, Gesten-System,
│                                    Befehlseingabe, Animationen, Design)
│
├── Projektplan.md               ← Zeitplan & Team-Übersicht
│                                   (7 Phasen, 22 Meilensteine, 42 Wochen,
│                                    wann welches Team was macht,
│                                    kritische Pfade, Abhängigkeiten)
│
├── Teams\                       ← Team-spezifische Aufgabenpakete
│   ├── frontend-team.cloud.md   ← 15 Pakete: Web-App, Karte, Befehle, Chat
│   ├── backend-team.cloud.md    ← 12 Pakete: API, WebSocket, Timer, Auth
│   ├── gamelogic-team.cloud.md  ← 11 Pakete: Auflösung, Einheiten, Karte
│   ├── economy-team.cloud.md    ← 9 Pakete: Credits, Buffs, Contracts
│   ├── infrastructure-team.cloud.md ← 10 Pakete: Hetzner, Docker, CI/CD
│   └── design-team.cloud.md     ← 9 Pakete: Karte, Einheiten, Animationen
│
├── UI Konzepte\                 ← Wireframe-Skizzen (handgezeichnet)
│   ├── WhatsApp Image ...59.jpeg    ← Spielfeld-Wireframe
│   │                                   (Karte, Toolbar, Bottom-Tabs)
│   └── WhatsApp Image ...59(1).jpeg ← Home-Screen-Wireframe
│                                       (Spieler-Icon, Match-Erstellen, Lobby)
│
└── Degsin ideen\                ← Design-Mockups (KI-generiert)
    ├── ...t6l33u...png          ← Home-Screen Mockup (Löwen-Icon, modern)
    ├── ...d6d4sx...png          ← Home-Screen Variante (General, Brettspiel)
    ├── ...hetxtr...png          ← Home-Screen Variante (General, horizontal)
    ├── ...c2wgwe...png          ← Spielfeld Mockup (Karte, Buttons, horizontal)
    └── ...1fcl6x...png          ← Spielfeld Mockup (iPhone, vertikal)
```

---

### Server (Hetzner Cloud - Production)

```
Server: 91.99.192.76 (Ubuntu 24.04, 8GB RAM, 4 vCPU)
Login:  ssh root@91.99.192.76
Passwort: VJtxPFM4dLVK

/opt/diplomacy2/                    ← PROJEKT-ROOT AUF SERVER
├── README.md                       ← Server-spezifische Orientierung
├── docker-compose.yml              ← Docker Stack Definition
├── .env                            ← Secrets (DB-Passwörter, JWT, etc.)
├── backend/                        ← NestJS Backend Code
│   └── src/modules/{auth,game,chat,economy,shop,contracts}/
├── frontend/                       ← Next.js Frontend Code
├── scripts/
│   ├── agent-connect.sh            ← Server-Status auf einen Blick
│   ├── db-reset.sh                 ← DB komplett zurücksetzen
│   └── backup.sh                   ← DB-Backup erstellen
└── backups/                        ← Gespeicherte DB-Backups
```

---

### Datenquellen (NotebookLM)

```
NotebookLM Notebook: "Deplomacy 2.0"
ID: f239b424-0001-4814-a28b-d4174e65dde0

Quellen:
1. "app aufbau"      ← App-Konzept (Screens, Navigation, Features)
2. "my new konzept"  ← Detailliertes Spielkonzept (Einheiten, Economy, Shop)
3. "diplomacy-*.pdf" ← Original Diplomacy Spielregeln (deutsch)
```

---

## Quick Reference

### Server-Verbindung

```bash
# SSH Verbindung
ssh root@91.99.192.76

# Server-Status prüfen
bash /opt/diplomacy2/scripts/agent-connect.sh

# Docker Services
cd /opt/diplomacy2
docker compose up -d          # Starten
docker compose down           # Stoppen
docker compose logs -f        # Logs
docker compose ps             # Status
```

### Datenbank

```bash
# DB Shell
docker exec -it diplomacy2-db psql -U diplomacy2 -d diplomacy2

# Connection Strings
# Aus Docker: postgresql://diplomacy2:D2_Pg_S3cur3_2026!@db:5432/diplomacy2
# Vom Host:   postgresql://diplomacy2:D2_Pg_S3cur3_2026!@127.0.0.1:5433/diplomacy2
```

### Redis

```bash
docker exec -it diplomacy2-redis redis-cli -a D2_Redis_S3cur3_2026!
```

### Web-Endpunkte

| Endpunkt | URL |
|----------|-----|
| API | https://diplomacy.tum-s.de/api/* |
| WebSocket | https://diplomacy.tum-s.de/socket.io/* |
| Health | https://diplomacy.tum-s.de/health |
| Frontend | (wird auf Cloudflare Pages gehostet) |

---

## Dokument-Zweck-Übersicht

| Ich will... | Dann lies... |
|-------------|-------------|
| Verstehen was Diplomacy 2.0 ist | `Konzept.md` |
| Sehen wie die App aussieht/funktioniert | `UX-Uebersicht.md` |
| Wissen wann welches Team was macht | `Projektplan.md` |
| Frontend-Aufgaben sehen | `Teams/frontend-team.cloud.md` |
| Backend-Aufgaben sehen | `Teams/backend-team.cloud.md` |
| Spiellogik-Aufgaben sehen | `Teams/gamelogic-team.cloud.md` |
| Wirtschafts-System verstehen | `Teams/economy-team.cloud.md` |
| Server/Deployment verstehen | `Teams/infrastructure-team.cloud.md` |
| Design-Aufgaben sehen | `Teams/design-team.cloud.md` |
| Server einrichten/debuggen | Server: `/opt/diplomacy2/README.md` |
| Wireframes ansehen | `UI Konzepte/` |
| Design-Mockups ansehen | `Degsin ideen/` |

---

## Tech-Stack Zusammenfassung

| Komponente | Technologie | Wo |
|------------|-------------|-----|
| **Frontend** | Next.js + React + Tailwind CSS | Cloudflare Pages |
| **Karte** | Canvas/WebGL (Pixi.js) | Im Frontend |
| **Backend** | NestJS (TypeScript) | Hetzner: Port 4000 |
| **Echtzeit** | Socket.io (WebSocket) | Hetzner: Port 4000 |
| **Datenbank** | PostgreSQL 16 (postgres:16-alpine) | Hetzner: Port 5433 |
| **Cache** | Redis 7 (redis:7-alpine, max 256MB) | Hetzner: Port 6379 |
| **Reverse Proxy** | Caddy (Auto-HTTPS) | Hetzner: Port 80/443 |
| **CDN** | Cloudflare (Free Tier) | DNS + DDoS-Schutz |
