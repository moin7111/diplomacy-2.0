# Security-Checklist: Diplomacy 2.0 MVP

Diese Checklist dokumentiert die durchgeführten Sicherheitsmaßnahmen für den MVP-Release.

## Server & Netzwerk (Infrastruktur)
- [x] **UFW Firewall:** Nur essentielle Ports (22 für SSH, 80 für HTTP, 443 für HTTPS) sind von außen erreichbar. Die Ports für PostgreSQL (5432) und Redis (6379) sind strikt auf das interne Docker-Netzwerk limitiert.
- [x] **Fail2Ban:** Installiert und aktiv, um Brute-Force-Attacken auf den SSH-Port (22) abzuwehren.
- [x] **Caddy Reverse Proxy:** Automatisches SSL/TLS Management via Let's Encrypt aktiv. HTTP-Traffic wird automatisch auf HTTPS umgeleitet.
- [x] **Interner Health-Check:** Der API-Health-Endpoint (`/api/health`) ist via Caddy nach außen blockiert (`403 Forbidden`) und nur intern (z.B. für Uptime Kuma) zugänglich.

## Applikation & Code (Backend)
- [x] **JWT Fail-Fast:** Alle statischen Fallbacks für das `JWT_SECRET` (z.B. in `auth.module.ts`, `jwt.strategy.ts` und `game.gateway.ts`) wurden entfernt. Startet das System ohne diese Variable, bricht es sofort mit einem Fehler ab.
- [x] **Rate-Limiting (Throttler):** Ein globaler NestJS Throttler wurde eingerichtet. Auth-Endpoints (`/auth/login`, `/auth/register`) sind durch einen `@UseGuards(ThrottlerGuard)` auf 10 Anfragen pro 15 Minuten limitiert, um Credential Stuffing zu verhindern.
- [x] **CORS:** Nur definierte Origins (oder in der Dev-Phase `*` via Caddy `@cors_preflight`) sind erlaubt.

## Token-Handling & Cookies
- [x] **Keine Auth-Cookies:** Da der Authentifizierungs-Flow auf JSON-Web-Token (JWT) im Authorization-Header (`Bearer Token`) und nicht auf Cookies basiert, sind wir vor CSRF-Angriffen, die Cookies ausnutzen, sicher.
- [x] (Hinweis: Sollte später auf Cookies umgestellt werden, müssen `HttpOnly`, `Secure` und `SameSite=Strict` zwingend gesetzt werden.)

## Backup & Disaster Recovery
- [x] **Backup-Skript:** Tägliche PostgreSQL-Backups via `pg_dump` im Docker-Container können automatisiert in einem Cronjob laufen.
- [x] **Restore-Test:** Ein Dump lässt sich manuell via folgendem Befehl problemlos wiederherstellen:
  ```bash
  cat backup_file.sql | docker exec -i diplomacy2-db psql -U diplomacy2 -d diplomacy2
  ```

---
**Status:** Audit Passed ✅
**Datum:** 29.04.2026
**Freigabe:** Security Team / Infrastructure Team
