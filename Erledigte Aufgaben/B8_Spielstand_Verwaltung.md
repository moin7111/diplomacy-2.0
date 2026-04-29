# B8: Spielstand-Verwaltung & Vollständiger Phasenfluss
**Datum:** 29. April 2026
**Team:** Backend-Team

## Abgeschlossene Aufgaben

Die gesamte Spielphasen-Abwicklung des Diplomacy-Regelwerks ist jetzt serverseitig als Loop implementiert und wird komplett durch den `TimerService` angetrieben. 

### 1. Phasenfluss & Überspringen-Logik (`TimerService`)
- Die klassische Abfolge (`FRÜHLING` -> `HERBST` -> `WINTER`) wurde aufgespalten, um die **Rückzugsphasen** nativ zu verarbeiten. 
- **Auto-Skip Logik**: 
  - Hat die Auflösung keine dislodged Units hervorgebracht, wird die Retreat-Phase übersprungen.
  - Im Winter ruft der Server `calculateBuilds()` für alle Nationen auf. Hat keine einzige Nation einen Unit-Bedarf oder Disband-Zwang (`diff !== 0`), wird der Winter automatisch übersprungen und das nächste Jahr eingeläutet.

### 2. Supply Center Updates & Siegbedingungen
- Die Kontrolle über Supply Center (`controlledSCs`) wechselt serverseitig **erst nach Abschluss der Herbst-Phase** (bzw. nach dem Herbst-Rückzug). Der Server überschreibt dabei im GameState die SC-Listen anhand der physischen Unit-Präsenz.
- Direkt nach der SC-Aktualisierung im Herbst wird `checkVictory()` aufgerufen. Hat jemand $\ge 18$ SCs, beendet sich das Spiel (`status = 'finished'`) und emittiert das Event `game-over`.

### 3. Neue WebSocket Endpunkte (`GameGateway`)
- `submit-retreats` und `submit-builds` arbeiten parallel zu den Movements.
- Werden diese Befehle geschickt, erfasst der Server sie und lässt beim Timer-Ende (oder wenn alle relevanten Spieler geschickt haben) die Funktionen `resolveRetreats` und `resolveBuilds` ans Werk.

### 4. Replay- & Dashboard-REST-Endpoints
- **`GET /api/games/my`**: Liefert alle Lobbys und aktiven Spiele, an denen der anfragende Spieler als Mitspieler beteiligt ist.
- **`GET /api/games/:id/history`**: Feuert den gesamten Stack der `GameState`-Tabelle als JSON ans Frontend (ideal für die Replay-Pfeile oder das Blättern der Historie).
