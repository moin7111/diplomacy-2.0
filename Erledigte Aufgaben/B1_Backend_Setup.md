# B1: Projektsetup & Grundinfrastruktur (Backend)
**Datum:** 08. April 2026
**Team:** Backend-Team (B1)

## Abgeschlossene Aufgaben

Im Rahmen dieses Pakets wurde die grundlegende Infrastruktur für das NestJS-Backend "Diplomacy 2.0" erstellt.

### 1. NestJS & Module
- [x] Das grundlegende NestJS-Projekt wurde im Ordner `backend/` per CLI initialisiert.
- [x] TypeScript ist vollständig konfiguriert.
- [x] Die vier Platzhalter-Module (`Auth`, `Game`, `Chat`, `Economy`) wurden generiert und in das `AppModule` eingebunden.

### 2. Datenbank (Prisma)
- [x] Ein initiales Datenbank-Schema (`prisma/schema.prisma`) wurde etabliert.
- [x] Die Modelle `User` und `Game` inkl. der Verbindungs-Tabelle `GamePlayer` wurden als Startpunkt integriert.
- [x] Prisma Client (v5) wurde installiert und erfolgreich lokal generiert.

### 3. Docker-Umgebung (Dev)
- [x] Eine globale `docker-compose.yml` im Hauptverzeichnis wurde angelegt (PostgreSQL Port `5433`, Redis Port `6379`).
- [x] Im Ordner `backend/` existiert ein zweistufiges `Dockerfile` (Multi-Stage Build), um die API schlank in Produktion betreiben zu können.

### 4. Configuration & API
- [x] Es gibt `.env`-Dateien für das Environment-Secret-Management.
- [x] Swagger/OpenAPI wurde in der `main.ts` eingebunden.
- [x] Globale Validation-Pipes und ein übergreifender Error-Filter (`AllExceptionsFilter`) schützen die Endpunkte ab sofort vor fehlerhaften Requests.

## Ergebnisse & Test
Der Nest-Buildvorgang (`npm run build`) läuft erfolgreich durch. Alles ist bereit, damit die API in den nächsten Schritten mithilfe von Docker auf dem Hetzner-Server hochgefahren oder testweise lokal gestartet werden kann.
