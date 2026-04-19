# B4 & B5: WebSocket-Server und Time-Management
**Datum:** 19. April 2026
**Team:** Backend-Team

## Abgeschlossene Aufgaben

Es wurden zwei zentrale Features umgesetzt: Die Echtzeit-Architektur für Lobbies und Ingress sowie die Timer-Zyklen.

### 1. B4: WebSocket-Server (Socket.io & Redis Pub/Sub)
- `@nestjs/websockets` und `socket.io` wurden erfolgreich in das Projekt integriert.
- Ein **Redis-Adapter** (`redis-io.adapter.ts`) wurde geschrieben, der sämtliche Broadcasting-Events der Lobbies über alle Node-Instanzen spiegelt (optimale Skalierbarkeit für Hetzner und Docker).
- Der **GameGateway** lauscht auf dem Namespace `/game`.
- **Sichere JWT Payload Authentifizierung:** Clients müssen im Handshake (`query.token` oder Auth-Header) ihr valides JWT übermitteln; andernfalls wird die Verbindung serverseitig abgeworfen.

### 2. Events & GameGateway
Folgende Sockets können nun in Echtzeit kommunizieren:
- `join-game` -> Client abonniert den Raum (Room-Name = `gameId`)
- `leave-game` -> Client verlässt den Raum
- `submit-orders` -> Löst derzeit einen Dummy-Log aus, der später die tatsächliche Game-Logic ansteuert. Andere Spieler sehen, dass jemand gehandelt hat.
- `start-phase` -> Host triggert eine Server-Phase. 
- `pause-timer` / `resume-timer` -> Steuerung des Countdowns via Hosting Tools.

### 3. B5: Timer-System (Authoritativ)
- Der **TimerService** läuft autark auf dem Server.
- Er trackt Spiel-Identitäten in seinem internen Dictionary und feuert per `setInterval` pro Sekunde verlässlich einen `timer-tick`-Ping via den Gateway an alle Clients.
- Fällt der Timer aus `< 0`, wird ein globaler `timer-expired` Event gebroadcastet und im Code die Auswertungsphase (`resolveTurn(...)`) simuliert.
- Phase Times (Default): Spring = 10m, Fall = 7m, Retreat = 3m, Winter = 5m.
