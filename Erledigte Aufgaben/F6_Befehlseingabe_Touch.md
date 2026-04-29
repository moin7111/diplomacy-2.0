# Erledigte Aufgaben: F6 — Befehlseingabe (Touch-Gesten)

**Status:** ✅ Abgeschlossen
**Datum:** 2026-04-25
**Paket:** F6 (Frontend — Befehlseingabe)

---

## Übersicht

Vollständige Touch-Befehlseingabe für die Diplomacy-Karte implementiert. Spieler können Einheiten per Tippen auswählen, Befehle über Gesten eingeben, Befehle als SVG-Overlay sehen und sie per WebSocket abgeben.

---

## Implementierte Dateien

### Neu erstellt

| Datei | Beschreibung |
|-------|-------------|
| `frontend/src/stores/useOrderStore.ts` | Zustand-Store für Befehle (pending/submitted) |
| `frontend/src/components/map/OrderOverlay.tsx` | SVG-Overlay: Pfeile, Linien, Kreise für Befehle |

### Geändert

| Datei | Änderungen |
|-------|-----------|
| `frontend/src/components/map/DiplomacyMap.tsx` | Vollständiges Gesten-System, Validierung, Error-Animation |
| `frontend/src/components/map/MapContainer.tsx` | HUD zeigt Befehlsanzahl + Hinweise, kein selectedTerritory mehr |
| `frontend/src/components/layout/TopBar.tsx` | "Befehle abgeben"-Button mit WebSocket-Emit |

---

## Gesten-System

| Geste | Aktion |
|-------|--------|
| Tap auf eigene Einheit | Einheit selektieren (Gold-Highlight) |
| Tap auf fremdes Gebiet (Einheit selektiert) | Move / Angriff-Befehl |
| Tap nochmal auf eigenes Gebiet | Hold-Befehl |
| Long-Press ~0.5s | Support-Modus (blauer Highlight + Banner) |
| Support-Modus + Tap auf Zielgebiet | Support-Befehl (erkennt automatisch Angreifer aus pending Orders) |
| Extra-Long-Press ~2s (Flotte) | Convoy-Modus (2-Tap: Abgang → Ziel) |

Implementierung: Pointer-Event-Delegation auf dem SVG-Container. State-Ref-Pattern verhindert Re-Attachment der Listener bei State-Änderungen. Bewegungsschwelle von 8px trennt Tippen von Karten-Pan.

---

## Befehls-Overlay (OrderOverlay.tsx)

| Befehlstyp | Visualisierung |
|------------|----------------|
| Move | Goldener Pfeil (Linie + Arrowhead-Marker) |
| Support | Blau gestrichelte Linie mit Pfeil |
| Hold | Goldener gestrichelter Kreis um die Einheit |
| Convoy | Grüne gestrichelte Pfadlinie + Kreis am Flottenort |

---

## State-Management (useOrderStore)

```typescript
pendingOrders: Order[]      // Geplante, noch nicht eingereichte Befehle
submittedOrders: Order[]    // Eingereichte Befehle (eingefroren)
isSubmitted: boolean        // Abgabe-Status

addOrder(order)             // Fügt hinzu / ersetzt bestehenden Befehl für gleiche Einheit
removeOrder(unitId)         // Entfernt Befehl einer Einheit
clearOrders()               // Alle Befehle + Reset isSubmitted
setSubmitted(value)         // Setzt isSubmitted, kopiert pending → submitted
```

---

## Validierung

- Jeder Befehl wird vor dem Hinzufügen durch `validateOrder()` aus `@diplomacy/game-logic` geprüft
- Ungültige Befehle: `invalid-blink`-Animation (aus `globals.css`) auf dem Gebiet + rote Fehlermeldung
- Eingefrierter Zustand (`isSubmitted === true`): Map nicht mehr interaktiv, halbtransparenter Overlay

---

## Befehlsabgabe (TopBar)

- Button "Abgeben (N)" erscheint nur in Bewegungsphasen (Frühling / Herbst)
- Zustände: ausgegraut (keine Befehle) → bordeaux/gold (Befehle vorhanden) → grün + Haken (eingereicht)
- Emittiert `submit-orders`-Event via bestehendem Socket.io-WebSocket-Ref
- `isSubmitted` wird bei `phase-change` vom Server automatisch zurückgesetzt

---

## Technische Details

- **Pointer-Event-Delegation** statt individuelle Element-Listener → SVG-Inhalte müssen nicht neu verdrahtet werden
- **State-Ref-Pattern** (`useLayoutEffect` sync): Event-Handler lesen immer aktuellen State, ohne Re-Attachment
- **Long-Press-Erkennung**: `setTimeout(500ms)` + Bewegungsschwelle 8px (Cancellation bei Pan)
- **Convoy-Erkennung**: Separater `setTimeout(2000ms)`, wird bei 0.5s-Timer gecancelt falls Support zuerst feuert
- Build: `next build` sauber, keine neuen TypeScript-Fehler

---

## Offene Aufgaben / Folge-Pakete

- [ ] F7: Live-Einheitenpositionen vom Server (statt statische Startaufstellung)
- [ ] F8: Retreat- und Build-Phasen UI (andere Befehlstypen)
- [ ] Unterstützung für Support-Move (zwei Taps: Angreifer → Ziel) als erweiterte Geste
- [ ] Haptisches Feedback bei Long-Press (`navigator.vibrate`)
- [ ] Undo-Button für einzelne Befehle (Wischen auf Befehlszeile)
