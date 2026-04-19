# B2 & B3: Auth-System und Game-API
**Datum:** 08. April 2026
**Team:** Backend-Team (B1)

## Abgeschlossene Aufgaben

Es wurden zwei zentrale Module umgesetzt: Die Authentifizierung und die Basis-Logik für Lobbies/Spiele.

### 1. Prisma & System Config
- Ein globales `PrismaModule` stellt ab sofort den `PrismaService` für sämtliche Backend-Module transparent bereit.

### 2. B2: Authentifizierung (Auth-Modul)
- **Registrierung (`/api/auth/register`)**: Neue Benutzer Accounts werden jetzt mit `bcrypt`-Passworthashing sicher gespeichert. Ein Schutz vor doppelten E-Mails oder Usernamen (ConflictException) ist eingebaut.
- **Login (`/api/auth/login`)**: Führt ein Credentials-Check durch und signiert via `@nestjs/jwt` den Token.
- **Autorisierung**: Eine `JwtStrategy` gekoppelt mit einem `JwtAuthGuard` wurden geschrieben. Alle restlichen Routen (inkl. `/api/auth/me`) sind fortan global gesichert; Swagger integriert nahtlos den entsprechenden API-Key.

### 3. B3: Game-Management (Lobby-Logik)
- **Erstellung (`/api/games - POST`)**: Neue Spiele kreieren jetzt sofort einen einzigartigen 6-stelligen Raumcode. Der Ersteller wird sicher in die Host-Rolle versetzt und als erster Spieler dem Spiel hinzugefügt.
- **Beitritt (`/api/games/join - POST`)**: Nutzt den generierten Raumcode. Checkt Limits (max. 7), vermeidet Doppelbeitritte und schützt, falls ein Spiel bereits läuft.
- **Nation (`/api/games/:id/nation - PATCH`)**: Erlaubt es, eine Option der 7 verfügbaren Rollen einwandfrei und dopplungssicher auszuwählen.
- **Status & Start (`/api/games/:id/ready | /api/games/:id/start - POST`)**: Spieler können sich "bereit" melden. Sind **alle anwesenden Spieler ready**, darf der Host (`host_id`) das Match `active` schalten (Spieleranzahl flexibel).

### Fazit & Status
Die API wurde gegen `tsc` strict errors geprüft und liefert auf `npm run build` eine fehlerfreie Kompilation. Die JWT-Token-Infrastruktur steht, und der Weg in Richtung Phase B4 (Sockets) ist nun optimal geebnet.
