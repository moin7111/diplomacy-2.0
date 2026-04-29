# Erledigte Aufgaben: F6 (Korrektur), F7 & F9 - Phase 1 UI Abschluss

**Datum:** 29. April 2026
**Team:** Frontend
**Status:** ✅ Erledigt

## Übersicht
Die letzten ausstehenden Frontend-Features für das Phase-1-MVP (Klassisches Diplomacy) wurden erfolgreich implementiert. Die App unterstützt nun den gesamten Spielablauf inklusive Rückzugs- und Aufbauphasen sowie In-Game-Kommunikation.

## Details der Implementierung

### 1. F6 Korrektur (Doppelküsten)
- **Doppelküsten-Auswahl:** Ein modales Overlay ("Welche Küste?") wurde in `DiplomacyMap.tsx` hinzugefügt. Wenn ein Spieler einen Move in ein Gebiet mit mehreren Küsten (z.B. `stp`, `bul`, `spa`) zieht, kann er nun interaktiv die spezifische Küste wählen (Nordküste, Südküste etc.).
- *(Hinweis: Cancel-Order Funktionalität und PNG-Icons waren bereits implementiert).*

### 2. F7 Rückzugs- und Aufbau-Screens (Retreat & Build)
- **Game-Logic Sync:** Die Backend-Dateien `retreats.ts` und `builds.ts` wurden ins Frontend synchronisiert.
- **Retreat Modal:** Ein neuer `RetreatModal.tsx` Dialog erscheint in der `retreat`-Phase. Er zeigt vertriebene Einheiten an und bietet via Dropdown nur legale Rückzugsfelder (berechnet über `getRetreatOptions()`) oder die Option zum Auflösen.
- **Build Modal (Winter):** Ein neuer `BuildModal.tsx` Dialog erscheint in der `build`-Phase. Er berechnet die nötigen Anpassungen via `calculateBuilds()`. Ist der Diff positiv, können neue Einheiten auf legalen Heimat-Zentren gebaut werden (inklusive Küstenabfrage für Flotten). Ist er negativ, wird der Spieler gezwungen, die überschüssigen Einheiten aufzulösen.

### 3. F9 Chat System
- **Chat Store:** Ein globaler `useChatStore` wurde implementiert zur Verwaltung von Gruppen- und Direktnachrichten.
- **Chat UI:** Das Platzhalter-Diplomatiemenü wurde durch ein vollwertiges Chat-Interface ersetzt. Es gibt eine `ChatList` mit Unread-Badges für ungelesene Nachrichten und eine `ChatDetail` Ansicht für den Nachrichtenverlauf (im iMessage-Stil mit Auto-Scroll).
- **Navigation Badge:** Das `BottomNav` wurde erweitert und zeigt nun die Gesamtanzahl ungelesener Nachrichten als kleinen roten Indikator auf dem "Diplomatie"-Tab an.
- **WebSockets (Vorbereitung):** Das UI nutzt aktuell den lokalen Store für den Spielverlauf. Die WebSocket-Verbindungen (`send-message`, `receive-message`, `get-history`) sind im Code vorbereitet und dokumentiert, damit sie nahtlos mit dem Backend verknüpft werden können, sobald die Endpunkte bereitstehen.

## Nächste Schritte (Abhängigkeiten)
- **Backend-Anbindung:** Die UI-Modals für F7 und die Chat-Funktion für F9 warten nun auf die echten WebSocket-Events vom Backend (Auslösen von Phasenwechseln und Weiterleiten von Chat-Nachrichten).
- Das Phase-1-Frontend ist somit feature-complete für die Integration!
