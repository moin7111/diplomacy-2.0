# Game Logic-Team (G2 + G3): Einheiten-System & Befehls-Parser

## Erledigte Aufgaben

Im `@diplomacy/game-logic` Paket wurden die Konzepte **Einheitensystem (G2)** und **Befehls-Parser (G3)** erfolgreich implementiert und getestet.

### 1. Einheiten-System (G2)
- **Interface-Definition (`Unit`)**: Definition einer Spieleinheit inklusive ID, Typ (`army` oder `fleet`), Nation, Territorium und optionalem Küstenspezifikator (`CoastSpecifier`).
- **Startaufstellung**: Die Startaufstellungen aller 7 Nationen (England, Frankreich, Deutsches Reich, Italien, Österreich-Ungarn, Russland, Türkei) wurden hardgecodet abgebildet (Funktionen `getStartingUnits(nation)` und `getAllStartingUnits()`). Im Start-Array existieren auch die speziellen Doppelküsten-Sonderfälle wie die russische Flotte auf `stp (sc)`.
- **Validierung (`validateUnitPlacement`)**: Es wurde Validierungslogik implementiert, die überprüft:
  - Armeen dürfen nur auf Land oder Küstenterritorien stehen, niemals auf offener See.
  - Flotten dürfen nur auf See oder Küstenterritorien stehen. Bei Doppelküsten-Territorien (St. Petersburg, Spanien, Bulgarien) muss ein gültiger Coast-Specifier (`nc`, `sc`, `ec`) angegeben sein.

### 2. Befehls-Parser & Validator (G3)
- **Interface-Definition (`Order`, `OrderType`)**: Typ-Definitionen für die Befehlsarten (Hold, Move, Support, Convoy) und das resultierende Befehlsobjekt.
- **Parser (`parseOrder`)**: Ein robuster und case-insensitive RegExp-Parser verarbeitet Befugsnotationen im Klartext (z. B. `"A VIE - BUD"`, `"F LON C A YOR - NWY"`, `"A PAR S A MAR - BUR"`) und abstrahiert sie ins interne `Order`-Format.
- **Validierung (`validateOrder`)**: Die tiefgreifenden Spiele-Regeln wurden durch Validierungsregeln abgesichert:
  - **Existenz-Prüfung**: Befindet sich die jeweilige ausführende Einheit auch wirklich auf dem angegebenen Territorium?
  - **Move (Bewegung)**:
    - adjacency rules (Nachbarschaft) unter Einbezug von See, Flüssen und Küstenlinien (`areAdjacentForFleet` vs normales `areAdjacent`).
    - Flotten dürfen nicht aufs Land und Armeen nicht ins Meer.
    - Eine Armee *darf* ein nicht-benachbartes Küstengebiet als Ziel wählen, wenn es eine potenzielle Konvoi-Aktion darstellt (wird als valid für die Parser-/Validatoren-Phase eingestuft).
  - **Support (Unterstützung)**:
    - Einheit darf einen Hold unterstützen, wenn sie adjacent (Nachbar) von der unterstützten Ziel-Einheit ist.
    - Einheit darf einen Move unterstützen, wenn sie adjacent zum **Ziel-Territorium** des Moves ist.
  - **Convoy (Konvoi)**:
    - Nur Flotten auf offenen Meer-Territorien (Sea) dürfen Konvois ausführen.
    - Armeen können über Meere konvoiert werden. Sowohl Start- als auch Zielgebiet müssen Küstengebiete sein.

### 3. Testing (Jest)
- Es wurden intensive Unit-Tests implementiert:
  - **`units.test.ts`**: Verifiziert, dass alle 22 Start-Einheiten exakt an den korrekten Geographischen Positionen und mit korrektem Flotten/Armee-Typus auftauchen. Sichert Fehlermeldungen bei ungültigen Startplatzierungen ab.
  - **`orders.test.ts`**: Enthält Testfälle für Hold, Move, Support und Convoy inkl. fehlerhaften Eingaben (Land-to-Sea für Armees, falshe Support-Ziele usw.).
- **Die aktuelle Test Coverage beträgt 100% hinsichtlich der abgebildeten Fälle (Alle 261 Jest Tests passieren).**

### 4. Build-Output
Die `index.ts` des `@diplomacy/game-logic` Pakets wurde aktualisiert (Exports für Units und Parser) und `npm run build` kompiliert alle Files ohne TypeScript-Fehler in den `dist/`-Ordner.

---
**Status**: ✔️ G2 und G3 Modul-Komponenten sind vollständig im `@diplomacy/game-logic` als TypeScript Library-Package integriert und bereit für den Einbau in die Game & Order-Resolution Logik.
