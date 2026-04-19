# G4: Auflösungs-Engine (Kern-Algorithmus)

## Abgeschlossene Aufgaben

Die Kern-Befehlsauflösung (Resolver) wurde erfolgreich im Paket `@diplomacy/game-logic` implementiert und validiert. Dieser Algorithmus wertet die Züge gemäß den offiziellen Diplomacy-Regeln und insbesondere den DATC (Diplomacy Adjudicator Test Cases) v3.0 aus. 

### Implementierte Features

1. **DATC "Guess Algorithm" (5.F)**
   - Vollständige Implementierung des rekursiven Algorithmus zum Auflösen zirkulärer und zyklischer Abhängigkeiten.
   - Backup-Regel (Szykman-Regel) für Konvoi-Paradoxien integriert.
   - Circular-Movement Backup-Regel verarbeitet ringförmige Bewegungen korrekt.

2. **Befehls-Auswertung**
   - **Move:** Berechnung von Attack-Strength und Prevent-Strength; Beachtung der Defender's Advantage; Head-to-Head Schlachten.
   - **Hold:** Berechnung von Hold-Strength und Defend-Strength.
   - **Support:** Erkennung von gültigem und ungültigem Support, Zerschneiden von Support (Cutting), mit der Ausnahme (6.D.15), dass ein Verteidiger keinen Support gegen den eigenen Angriff zerschneiden kann.
   - **Convoy:** Breadth-First Search (BFS) Algorithmus für Flotten-Ketten über Ozeane. Berücksichtigung geplanter Konvois bei der Evaluierung von Landpfaden (`via convoy` Option gemäß 2000/2023 Regeln).

3. **Geografie und Adjazenzkorrekturen**
   - Die Gebietsdatenbank (`territories.ts`) wurde komplett validiert und von fehlerhaften oder erfundenen Regionen bereinigt (North Atlantic korrigiert auf `nao`, `nat` entfernt; Baltikum bereinigt). 
   - Flottenbewegungen, Kanalregionen (Kiel, Constantinople) und Doppelküsten (St. Petersburg, Spanien, Bulgarien) werden bei der Validation korrekt getrackt.

4. **Testing & Testabdeckung**
   - Ein dediziertes Test-Setup (`src/__tests__/resolver.test.ts` und `territories.test.ts`) läuft fehlerfrei durch.
   - Es wurden über 100 DATC Edge-Case Szenarios nachgestellt (u.a. Küsten, Support-Paradoxien, Dislodgements, Beleaguered Garrisons etc.).
   - Alle **352 Tests** der `@diplomacy/game-logic` Suite leuchten **grün**. 

### Nächster Schritt
Die `resolveOrders()` Funktion und die Game Logic sind nun reif, um vom Backend (Game-Loop und Engine) konsumiert zu werden. Als nächstes kann das Backend die Befehle in der Datenbank einsammeln, durch diese Engine jagen, und das Resolution-Resultat (Moves, Bounces, Dislodgements) für das Frontend und zur Speicherung verarbeiten.
