# F2, F3, F4 — Backend Integration abgeschlossen
**Datum:** 09. April 2026
**Team:** Frontend-Team

## Abgeschlossene Aufgaben

Nachdem das Backend-Team (B1, B2, B3) die Endpunkte für Authentifizierung und Game-Management bereitgestellt hat, wurde die provisorische *Mock-API* des Frontends vollständig durch native HTTP-Calls ersetzt.

### 1. API Client (`api.ts`)
- **[x] Fetch-Helper:** Eine globale `fetchApi` Funktion, die dynamisch das Token aus dem `useAuthStore` zieht und als `Authorization: Bearer <token>` Mitzuschickt.
- **[x] URL Routing:** Alle Requests gehen an den Prefix `http://localhost:4000/api` (Konfigurierbar via `NEXT_PUBLIC_API_URL`).
- **[x] Error-Handling:** Die Fehler vom Backend (Code 400/401/409) werden entschlüsselt (`data.message`) und ins Frontend UI weitergeleitet.

### 2. Migration der Screens
- **[x] F2 Login / Register:** Rufen nun `POST /api/auth/login` und `POST /api/auth/register` auf.
- **[x] F3 Home:** Die "Neues Spiel erstellen" Funktion ruft `POST /api/games` auf. Das Beitreten nutzt `POST /api/games/join`.
- **[x] F4 Lobby:** Läd Spieldaten via `GET /api/games/:id`. Nation-Wechsel (`PATCH .../nation`), Statusänderung (`PATCH .../ready`) und Starten (`POST .../start`) sind voll angebunden.

### 3. Cleanup
- Das veraltete `mockApi.ts` Script wurde restlos aus der Codebase entfernt. Ein Type-Check (`npm run build`) bestätigte fehlerfreie Types.

## Start-Empfehlung
Stelle sicher, dass im Ordner `backend/` der Server mit `npm run start:dev` läuft und die via Prisma generierte Datenbank angebunden ist.
Das Frontend (Port 3000) kann nun native mit dem Backend (Port 4000) kommunizieren!
