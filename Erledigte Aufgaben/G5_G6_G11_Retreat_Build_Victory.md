# G5, G6, G11: Rückzug, Aufbau & Siegbedingungen

## Abgeschlossene Aufgaben

Das `@diplomacy/game-logic` Paket wurde um die restlichen essenziellen Phase-1-Mechaniken erweitert, die im offiziellen Regelwerk definiert sind.

### Implementierte Features

1. **G5: Rückzugsphase (Retreats)**
   - `getRetreatOptions`: Bestimmt alle gültigen Rückzugsziele für eine vertriebene Einheit (dislodged unit). Berücksichtigt folgende Einschränkungen:
     - Keine Rückzüge auf besetzte Gebiete.
     - Keine Rückzüge auf das Gebiet, von dem der Angriff ausging.
     - Keine Rückzüge auf Gebiete, in denen es in der vorangegangenen Phase einen "Bounce" (Standoff) gab.
     - Flotten-/Armee-Adjazenz-Regeln greifen wie üblich.
   - `resolveRetreats`: Evaluiert alle Rückzugsbefehle der Spieler.
     - Wenn mehrere Einheiten in das gleiche Gebiet zurückweichen wollen, werden alle zerstört (Retreat Standoff).
     - Einheiten ohne gültigen Befehl oder mit explizitem "disband" Befehl werden aus dem Spiel entfernt.
     - Gültige Rückzüge resultieren in einer Relokation der Einheit.

2. **G6: Aufbauphase (Builds/Adjustments - Winter)**
   - `calculateBuilds`: Zählt die Anzahl der kontrollierten Supply Centers vs. die aktuellen Truppen. 
     - Positiver Differenzbetrag (diff > 0): Spieler kann neue Einheiten (Armeen/Flotten) bauen.
     - Negativer Differenzbetrag (diff < 0): Spieler muss Einheiten auflösen (Disband).
     - Gibt nur "verfügbare" Heimatversorgungszentren zurück (unbesetzt und weiterhin unter Kontrolle).
   - `validateBuildOrder`: Validiert Aufbau- und Auflösungsbefehle. Stellt sicher, dass Flotten nur an Küsten gebaut werden, Armeen nicht auf See starten und bei Doppelküsten (z.B. St. Petersburg) der Küstenindikator angegeben wird. Löst nur eigene Truppen auf.
   - `resolveBuilds`: Die Engine prozessiert die Bau- und Auflösungsaufträge auf die maximal/minimal gesetzten Kapazitäten, verarbeitet Mehrfachbau-Versuche blockend und priorisiert zulässige Aktionen.

3. **G11: Siegbedingung (Victory)**
   - `checkVictory`: Evaluiert nach definierten Regeln den Solo-Gewinner.
   - Die `VICTORY_SC_THRESHOLD` Konstante (18 Versorgungszentren beim Standardbrett) steuert den Gewinn.
   - Gibt zurück ob das Spiel vorbei ist (`gameOver: true`) oder ob die nächste Phase ansteht.

### Testing & Testabdeckung
- 46 neue dedizierte Tests in `src/__tests__/retreats-builds-victory.test.ts`.
- Deckt die volle Logik inkl. Retreat-Standoffs, Doppelküsten, Limit-Sperren beim Bauen und Win-Conditions ab.
- Das TypeScript-Modul weist weiterhin eine 100% Erfolgsquote bei allen insgesamt **398 Tests** für das `game-logic` Paket auf.

### Nächster Schritt
Da das komplette Game-Logic Grund-Paket (Phase 1) bereit steht, können wir die Infrastruktur der Befehlsverarbeitung (Pakete B6 & B8) am Backend-Server über NestJS hochziehen und an die Datenbank koppeln.
