# I2, I3, I7: Infrastruktur, Deployment & Security
**Datum:** 10. April 2026
**Team:** Infrastructure-Team

## Abgeschlossene Aufgaben

Es wurden essenzielle Schritte in Richtung Production-Readiness und Server-Absicherung unternommen.

### 1. I2: CI/CD Pipeline
- `.gitignore` wurde bereinigt, sodass die Dateien `.github/workflows/ci.yml` und `.github/workflows/deploy.yml` jetzt durch Git getrackt werden können.
- Ein Pfad-Fehler in `ci.yml` wurde korrigiert (der alte Pfad `infrastructure/docker-compose.yml` wurde auf das Root-Directory `docker-compose.yml` umgeleitet).
- **Achtung:** Aufgrund eines fehlenden Git-Tokens mit `workflow`-Berechtigung auf deinem Client musste der automatische Push von GitHub Actions Dateien abbrechen. Die verbleibenden Dateien wurden auf GitHub in den Branch `develop` geschoben.

### 2. I7: Security Basics
- **UFW (Uncomplicated Firewall)**: Auf dem Server (91.99.192.76) installiert und aktiviert. Alle eingehenden Ports sind standardmäßig gesperrt (`default deny incoming`). Es sind nur explizit die Ports `22` (SSH), `80` (HTTP) und `443` (HTTPS) offen.
- **Fail2ban**: Installiert, konfiguriert und als System-Dienst aktiviert, um den SSH-Port vor Bruteforce-Loginangriffen zu bewahren.
- **Datenbank & Session-Sicherheit**: Der Redis-Port (`6379`) wurde aus der `docker-compose.yml` Port-Map gelöscht. Redis ist von nun an ein reiner "Backend-Container", unsichtbar im öffentlichen Internet. Des Weiteren ist verifiziert, dass Konfigurations-Secrets (`.env`) korrekt von Git ausgeschlossen werden.

### 3. I3: Deployment Flow
- Das Repository auf dem Live-Server (`/opt/diplomacy2`) wurde via Remote SSH nahtlos auf den Stand von `develop` gebracht.
- Ein Test Build und Deployment Cycle verlief fehlerfrei:
  - `docker compose build` (Images gebaut)
  - `docker compose up -d` (Test-Stack gestartet)
  - `docker exec diplomacy2-api npx prisma migrate deploy` (Datenbank Migration durchgeführt)
- Ein Health-Check Request via `curl` auf `localhost:4000/api/docs` gab erfolgreich grünes Licht zurück – die Anwendung läuft in der Production-Struktur!
