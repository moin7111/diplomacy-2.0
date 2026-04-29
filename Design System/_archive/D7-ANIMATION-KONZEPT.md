# D7 — Befehlsauflösungs-Animation · Konzept

**Paket:** D7 — Animation Polish (Phase 2)  
**Status:** Konzept bereit · Implementierung Phase 2  
**Erstellt:** 2026-04-26  
**Abhängigkeiten:** D6 Screens (fertig), F5 Karten-Renderer (fertig), G4 Resolution Engine (fertig)

---

## Übersicht

Die Auflösungs-Animation ist der dramatischste Moment im Spiel-Loop.
Sie verwandelt trockene Server-Logik (`resolution-engine` output) in eine
lebendige, filmische Szene — jede Einheit bewegt sich, prallte ab, weicht
zurück. Ziel: **der Spieler versteht intuitiv, was passiert ist, bevor er
die Ergebnis-Liste liest.**

---

## 1. Architektur der Animation

### Timeline-Struktur

```
PHASE START
    │
    ├── 0ms      Karte blendet von Befehlsansicht zu Auflösungs-Modus
    │            (Pfeil-Overlays erscheinen, gedimmt)
    │
    ├── 300ms    Step 1: Simultane Bewegungen starten
    │            Alle Einheiten bewegen sich gleichzeitig zu ihrem Ziel
    │            Dauer: 600ms (ease-in-out)
    │
    ├── 900ms    Step 2: Kollisionen auflösen
    │            Bounce-Einheiten: "Prall-Effekt" zurück zur Ausgangsposition
    │            Dauer: 400ms (elastic ease-out)
    │
    ├── 1300ms   Step 3: Vertreibungen markieren
    │            Verdrängte Einheit blinkt rot, dann Rückzugs-Pfeil erscheint
    │            Dauer: 500ms
    │
    ├── 1800ms   Pause — Ergebnis-State eingefroren (Spieler liest)
    │            Event-Log scrollt von unten ein
    │
    └── 2500ms+  "WEITER"-Button pulsiert → nächste Phase
```

### Wiedergabe-Modi

| Modus | Beschreibung | Auslöser |
|-------|-------------|----------|
| **Auto-Play** | Läuft automatisch, kein Eingriff nötig | Standard beim Einstieg |
| **Step-by-Step** | Spieler drückt ▶ für jeden Schritt | Tap auf Karte |
| **Überspringe** | Sofort zum Ergebnis-Log | Tap auf "ÜBERSPRINGEN" |
| **Replay** | Erneut abspielen | Button im Ergebnis-Screen |

---

## 2. Animations-Typen

### 2a. Erfolgreiche Bewegung (MOVE SUCCESS)

```
Einheit A ────────────────────► Ziel-Gebiet
         ease-in-out, 600ms

Visuell:
- Pfeil: Volle Sättigung, Nationalfarbe
- Einheit-Token: Gleitet entlang des Pfeils
- Am Ziel: Kurzer "Bounce-In" (scale 1.0 → 1.15 → 1.0), 200ms
- VZ-Symbol: Falls Versorgungszentrum: Füllung wechselt zur Nationalfarbe
- Sound-Cue: Crisp "march" tick
```

**CSS-Referenz:**
```css
@keyframes unit-move {
  0%   { transform: translate(0,0) scale(1); }
  95%  { transform: translate(var(--dx), var(--dy)) scale(1.15); }
  100% { transform: translate(var(--dx), var(--dy)) scale(1.0); }
}
/* Dauer: 600ms, timing: cubic-bezier(0.4, 0, 0.2, 1) */
```

---

### 2b. Abprall / Bounce (BOUNCE — Patt)

Zwei Einheiten stoßen gleichzeitig auf dasselbe Ziel. Beide prallen zurück.

```
Einheit A ──────► [X] ◄────── Einheit B
         beide starten gleichzeitig, treffen in der Mitte

Visuell:
- Beide Tokens bewegen sich 60% des Weges zum Ziel
- An Kollisionspunkt: Kleines rotes "✕" Burst-Symbol (Partikel-Effekt)
- Beide Tokens: "Elastic bounce" zurück zur Startposition
- Pfeil: Wechselt von Nationalfarbe zu gedimmtem Grau
- Ziel-Gebiet: Kurzes rotes Flackern (border-color flash)
- Sound-Cue: "clank" impact sound
```

**CSS-Referenz:**
```css
@keyframes unit-bounce {
  0%   { transform: translate(0,0); }
  50%  { transform: translate(var(--dx60), var(--dy60)); }  /* 60% der Strecke */
  65%  { transform: translate(var(--dx60), var(--dy60)) scale(1.2); } /* Impact */
  80%  { transform: translate(calc(var(--dx60) * -0.1), calc(var(--dy60) * -0.1)); }
  100% { transform: translate(0,0); }
}
/* Dauer: 800ms, timing: cubic-bezier(0.34, 1.56, 0.64, 1) — elastic */
```

---

### 2c. Unterstützung (SUPPORT)

```
Einheit B ···→ (Ziel von A)   ← Unterstützungspfeil
Einheit A ──────────────────► Ziel (verstärkt)

Visuell:
- B's Pfeil: Gestrichelt, halbe Breite, leicht transparent
- A's Pfeil: Dicker, leuchtendes Nationalfarbe-Glow
- Token von A bewegt sich wie normaler Move, aber mit kurzem "power-up" 
  Glow-Effekt am Start (wie ein Schub)
- Sound-Cue: Tiefes "support boom"
```

---

### 2d. Vertreibung (DISLODGE — Rückzug nötig)

Die stärkste und dramatischste Animation.

```
Einheit A ──────► Ziel [Einheit B hier]
                  B wird VERDRÄNGT

Visuell (Sequenz):
1. A bewegt sich normal ins Ziel (600ms)
2. B "erschüttert" — shake animation (100ms, 3 Zyklen ±4px)
3. B leuchtet rot auf — rote Glow-Aura (300ms)
4. Rückzugs-Pfeil-Optionen erscheinen (Pfeile zu erlaubten Rückzugsgebieten)
5. B verschwindet kurzfristig (opacity 0, 200ms) — wartet auf Rückzugsbefehl
- Sound-Cue: "defeat horn" kurz + "retreat" pfeifen
```

**CSS-Referenz:**
```css
@keyframes unit-shake {
  0%,100% { transform: translateX(0); }
  20%     { transform: translateX(-4px); }
  40%     { transform: translateX(4px); }
  60%     { transform: translateX(-3px); }
  80%     { transform: translateX(3px); }
}
@keyframes unit-displace {
  0%    { opacity: 1; box-shadow: 0 0 0 rgba(255,0,0,0); }
  30%   { box-shadow: 0 0 20px rgba(255,60,60,0.8); }
  60%   { opacity: 0.6; }
  100%  { opacity: 0; transform: scale(0.6); }
}
/* Gesamtdauer mit shake + glow + fade: ~1000ms */
```

---

### 2e. Vernichtung / Eliminierung (UNIT DESTROYED)

Einheit wird eliminiert (kein Rückzug möglich, z.B. in Seegebiet ohne Küste).

```
Visuell:
- Einheit explodiert in kleine Partikel (6–8 Partikel, Nationalfarbe)
- Partikel fliegen radial auseinander, fade out in 400ms
- Kleines "✕" verblasst am Zielort
- Sound-Cue: "elimination" dumpf
```

**CSS-Referenz:**
```css
/* Partikel-System: 8 pseudo-elements mit verschiedenen transform-origins */
@keyframes particle-burst {
  0%   { transform: translate(0,0) scale(1); opacity: 1; }
  100% { transform: translate(var(--px), var(--py)) scale(0); opacity: 0; }
}
/* Jeder Partikel: andere --px/--py Werte, radiale Verteilung 360° */
/* Dauer: 400ms, timing: ease-out */
```

---

### 2f. Konvoi (CONVOY)

```
Armee A ──(Flotte B Meer)──► Küsten-Ziel

Visuell:
- A's Token erscheint auf B's Flotten-Token (Piggyback-Effekt, kleines Icon)
- Beide bewegen sich zusammen über das Meer
- Am Ziel: A springt von B ab (kurze Parabel-Kurve)
- B bleibt im Meer
- Sound-Cue: "ship horn" + "march"
```

---

## 3. Kamera-Verhalten (Map Pan & Zoom)

Da die Karte größer als der Bildschirm ist, folgt die Kamera den Ereignissen.

| Ereignis | Kamera-Verhalten |
|---------|-----------------|
| Step beginnt | Pan zu betroffenen Einheiten (sanft, 300ms ease) |
| Bounce | Zoom leicht heraus um beide Einheiten zu zeigen |
| Dislodge | Close-up auf Kollisionspunkt, dann zurück |
| Alle Schritte | Zoom-out auf Gesamt-Karte nach letztem Step |

**Kamera-Animation:**
```css
/* Map-Container Transform */
@keyframes cam-pan {
  from { transform: translate(var(--cam-from-x), var(--cam-from-y)) scale(var(--cam-from-z)); }
  to   { transform: translate(var(--cam-to-x),   var(--cam-to-y))   scale(var(--cam-to-z)); }
}
/* Dauer: 300ms, timing: ease-out */
```

---

## 4. Pfeil-Rendering

Pfeile werden als SVG-Elemente dynamisch über die Karte gezeichnet.

| Pfeiltyp | Farbe | Stil | Breite |
|----------|-------|------|--------|
| Move | Nationalfarbe | Durchgezogen | 2.5px |
| Support | Nationalfarbe (50% opacity) | Gestrichelt `5,3` | 1.5px |
| Bounce | `#ff6b6b` | Durchgezogen, endet mit ✕ | 2px |
| Retreat | `#ff8888` | Gestrichelt `8,4` | 2px |
| Convoy | Flotten-Nationalfarbe | Gepunktet `2,4` | 2px |

**Pfeilkopf-Typen (SVG marker):**
- Move: Standard Dreieck-Pfeilkopf, Nationalfarbe
- Support: Kleiner Pfeilkopf (50% Größe)
- Bounce: ✕ Symbol (roter Kreis mit Kreuz)
- Convoy: Kleines Schiff-Icon

---

## 5. Event-Log Animation

Das Event-Log am unteren Bildschirm scrollt synchron mit der Karten-Animation.

```
Sequenz pro Event-Item:
1. Item erscheint von unten (translateY: 20px → 0, opacity: 0 → 1)
2. Bei SUCCESS: grüner linker Rand leuchtet kurz auf
3. Bei BOUNCE:  gelber Rand blinkt (2×)
4. Bei RETREAT: roter Rand bleibt (persistent warning)
5. Item bleibt sichtbar bis Spieler weitergeht

Timing: Jedes Item erscheint 150ms nach dem vorherigen
```

**CSS:**
```css
@keyframes log-item-enter {
  from { transform: translateY(16px); opacity: 0; }
  to   { transform: translateY(0);    opacity: 1; }
}
/* Dauer: 200ms, timing: ease-out */
/* delay: index * 150ms */
```

---

## 6. VZ-Capture-Effekt

Wenn ein Versorgungszentrum eingenommen wird:

```
Visuell:
1. VZ-Symbol: Kurzes Wackeln (shake, 200ms)
2. Füllung wechselt von alter Nationalfarbe zu neuer (color interpolation, 400ms)
3. Ring-Puls: Kreisförmige Welle breitet sich aus (wie ein Sonar-Ping)
4. Gebiet-Schriftzug: Kurzes weißes Aufleuchten

CSS:
@keyframes vc-capture {
  0%   { transform: scale(1); filter: brightness(1); }
  30%  { transform: scale(1.4); filter: brightness(2) drop-shadow(0 0 6px currentColor); }
  60%  { transform: scale(0.9); }
  100% { transform: scale(1); filter: brightness(1); }
}
@keyframes capture-ring {
  0%   { r: 8px;  opacity: 0.8; stroke-width: 2; }
  100% { r: 28px; opacity: 0;   stroke-width: 0.5; }
}
/* Ring-Dauer: 600ms, ease-out */
```

---

## 7. Screen-Übergänge im Spiel-Loop

| Von | Nach | Transition |
|-----|------|-----------|
| Befehlseingabe | Auflösung | Karte bleibt, HUD-Elemente wechseln (cross-fade 300ms) |
| Auflösung | Rückzug | Modal-Sheet von unten (slide-up 400ms) |
| Rückzug | Karte | Sheet schließt (slide-down 300ms), Karte aktualisiert |
| Karte | Sieg | Full-screen celebration overlay (fade-in 600ms + particle burst) |
| Karte | Niederlage | Desaturate + darken filter über 800ms |

---

## 8. Performance-Budget

| Element | Budget | Technik |
|---------|--------|---------|
| Einheiten-Tokens | ≤ 20 gleichzeitig | CSS transform (GPU) |
| Pfeile | ≤ 30 SVG-Linien | SVG stroke-dashoffset animation |
| Partikel | ≤ 50 gleichzeitig | CSS animation, will-change: transform |
| Kamera-Pan | 1 Container | CSS transform matrix |
| Gesamt-Frame-Rate-Ziel | **60 fps** | requestAnimationFrame |

**Wichtig:** Alle Animationen ausschließlich über `transform` und `opacity`
(keine Animationen von `left/top/width/height`) — GPU-kompatibel.

---

## 9. Implementierungs-Reihenfolge (Phase 2)

| Priorität | Komponente | Abhängigkeit |
|-----------|-----------|-------------|
| P0 | Move + Bounce (Basis) | F5 Map Renderer |
| P0 | Event-Log Scroll | G4 Resolution Engine Output |
| P1 | Support-Pfeile | P0 |
| P1 | VZ-Capture-Effekt | P0 |
| P2 | Dislodge + Rückzugs-Pfeile | P0, G5 Retreat |
| P2 | Kamera-Pan | P0 |
| P3 | Partikel / Vernichtung | P2 |
| P3 | Konvoi-Animation | P2 |
| P4 | Sound-Cues | Alle P0–P3 |

---

## 10. Figma-Referenz-Frames (zu erstellen in Phase 2)

Für jede Animation wird ein Figma-Frame mit 3 Keyframes erstellt:

```
[Frame 0 — Start]  →  [Frame Mitte — Aktion]  →  [Frame Ende — Ergebnis]
```

Frames werden in Figma mit dem "Smart Animate" Prototyping-Tool verbunden
für interaktive Previews.

---

*Dieses Dokument ist das Konzept-Dokument für Phase 2. Es wird zu Beginn
von Paket D7 in konkrete Figma-Frames und React-Animation-Komponenten
übersetzt.*
