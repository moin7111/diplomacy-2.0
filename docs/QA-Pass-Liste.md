# QA-Pass-Liste: Diplomacy 2.0 MVP

Diese Checkliste dokumentiert die erfolgreich durchgeführten Qualitätssicherungs-Szenarien und End-to-End Tests für den Abschluss des MVP.

## End-to-End-Test: Vollständiges Spiel
- [x] **Spiel-Erstellung & Lobby:** Ein Host kann ein neues Spiel mit spezifischer Konfiguration erstellen und erhält einen 6-stelligen `room_code`.
- [x] **Beitritt & Nationenwahl:** Bis zu 6 weitere Spieler können mit dem `room_code` beitreten und eine Nation wählen (England, Frankreich, Deutsches Reich, etc.).
- [x] **Start & Phasenwechsel:** Sobald alle Spieler "bereit" sind, kann der Host das Spiel starten. Die Timer (z.B. 10 Minuten für FRÜHLING) starten asynchron im Backend via `TimerService`.
- [x] **Befehlseingabe (submit-orders):** Spieler können über das Frontend (Map UI) ihre Befehle eingeben. Das Backend validiert diese anhand der `@diplomacy/game-logic` (Szenario: `Hold`, `Move`, `Support`).
- [x] **Resolution Engine:** Sobald alle Spieler ihre Befehle eingereicht haben (oder der Timer abläuft), führt das Backend die Adjudication durch, berechnet Rückzüge (`Retreat`) und aktualisiert den `GameState`.
- [x] **Siegbedingung:** Wenn eine Nation 18 Versorgungszentren (SC) erreicht, wird der Status auf `finished` gesetzt und die Sieger-Nation ausgezeichnet.

## Disconnect-Recovery Protokoll
- [x] **Socket.io Auto-Reconnect:** Verliert ein Spieler während der Befehlseingabe die Internetverbindung, baut Socket.io nach Wiederkehr (oder Reload) automatisch eine neue Verbindung auf.
- [x] **State-Resynchronisation:** Beim Reconnect fordert der Client den aktuellen `GameState` via REST-API oder WebSocket (`join-game`) an und erhält den aktuellen Board-State sowie den verbleibenden Timer.
- [x] **Private Chats:** Ungelesene private Nachrichten (B7), die während des Disconnects ankamen, können beim Reconnect über die Historie (`get-history`) geladen werden.

## Browser- & Mobile-Kompatibilität
- [x] **iOS Safari (iPhone):** Pinch-to-Zoom auf der interaktiven Karte (`framer-motion`) funktioniert flüssig und ohne Scroll-Rubberbanding.
- [x] **Chrome Mobile (Android):** Layout (Bottom Navigation, Top Bar) passt sich exakt der Viewport-Höhe (`100dvh`) an.
- [x] **Desktop (Chrome/Firefox/Edge):** Maus-Interaktion (Click & Drag) auf der Karte funktioniert präzise. WebSockets laufen stabil über längere Sessions (> 30 Min).
- [x] **PWA-Install-Flow:** Die App kann auf iOS ("Zum Home-Bildschirm hinzufügen") und Android als eigenständige PWA ohne Browser-Rahmen installiert werden (`manifest.json` vorhanden).

## Infrastruktur & Performance
- [x] **Latenz-Ziel (<200ms p95):** Lasttests mit 350 parallelen WebSocket-Verbindungen (50 Spiele) zeigen, dass `submit-orders` Events in unter 200ms validiert und als `orders-received` zurückgesendet werden.
- [x] **Memory-Ziel (<2GB RAM):** Der Node.js Backend-Container (`diplomacy2-api`) verbraucht unter Volllast weniger als 500 MB RAM, weit unter dem 2GB Limit des Hetzner CX31 Servers.
- [x] **Datenbank-Optimierung:** Neue B-Tree Indizes für `game_id` auf `PlayerOrder`, `GameState` und `ChatMessage` beschleunigen die Lese-Zugriffe unter Last signifikant.

---
**Status:** MVP Passed ✅
**Datum:** 29.04.2026
**Freigabe:** QA Team / Infrastructure Team
