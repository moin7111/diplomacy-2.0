# B6 & B7: Befehls-API & Chat-Service
**Datum:** 20. April 2026
**Team:** Backend-Team

## Abgeschlossene Aufgaben

Die finale Schicht für Ingame-Kommunikation und Spiel-Zusammenführung wurde abgeschlossen.

### 1. Prisma & Datenbank Upgrade
- Es wurden 3 neue Modelle im Prisma Schema entworfen:
  - `PlayerOrder`: Verlinkt `gameId`, `userId`, `phase` und ein `JSON` Feld für Befehle.
  - `GameState`: Konserviert das gesamte Map-Layout (`Unit[]`) pro Phase/Jahr.
  - `ChatMessage`: Archiviert Sender, Receiver (optional für DM) und Text.
- Die zugehörigen Fremdschlüssel und Counter-Relations in `User` und `Game` verknüpfen diese Einträge sauber.

### 2. Modul B6: Die Befehls-API (Orders & Logic Resolving)
- Der Backend-Server greift nun direkt nativ (über Node.js Workspaces) auf `@diplomacy/game-logic` zu!
- Empfängt ein Spieler-Account `submit-orders`, validiert der Server jeden einzelnen String (z.B. *A VIE H*, *F LON C A YOR - NWY*) gegen die `validateOrder`-Funktion und das echte Spielbrett der laufenden Runde.
- **Auto-Finish**: Der `GameGateway` vergleicht, wie viele lebende Spieler im Raum sind, und triggert `resolveTurn`, sobald die letzte Person bestätigt hat – die Uhr wird augenblicklich gestoppt.
- **Resolving**: Der Timer-Service ruft den Master-Algorithmus (`resolveOrders`) mit den gecacheden Befehlen auf, baut das Resultat ins JSON und schickt es per `game-state-update` Socket Event sofort nach draußen zu den Frontends (die Karte rendert sich in Echtzeit neu).

### 3. Modul B7: Multiroom Chat-System
- Das Chat-Handling reitet Huckepack auf demselben sicheren `/game`-JWT-Namespace, um die Frontend-Netzwerk-Requests gering zu halten (1 Socket, mehrere Zwecke).
- `send-message`: Erkennt, ob `recipientId` gesetzt ist.
  - **Group-Chat**: Wenn `recipientId == null`, wird das `receive-message` Event per Broadcast an alle in der Lobby gesendet.
  - **Secret-Chat**: Wenn gesetzt, wird anhand einer im RAM gepoolten Sub-Connection (`activeConnections`) sichergestellt, dass die Message punktgenau NUR beim Absender und NUR beim Empfänger in den Sockets ankommt.
- `get-history`: Zieht performant die letzten 50 relevanten Nachrichten (globale + die den Spieler betreffen) beim Re-Connect aus Postgres.
