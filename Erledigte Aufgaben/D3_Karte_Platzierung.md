# D3 — Europa-Karte & automatische Platzierung (abgeschlossen)

**Stand:** 2026-04-19
**Bearbeiter:** Claude / Design-Team
**Status:** ✅ abgeschlossen

## Zusammenfassung

Die Diplomacy-Karte ist fertiggestellt und alle VZ- und Einheiten-Anker sind
automatisch platziert. Produktions-SVG, Preview-SVG und maschinenlesbare
Platzierungsdaten liegen im Ordner `Design System/`.

## Was wurde geliefert

### 1. Produktions-Karte (`Design System/diplomacy-map.svg`)
- 75 Gebiete (19 Seen + 56 Land/Kuesten), einheitlich beige Fuellung.
- Schweiz (`che`) als dekorativer, nicht-klickbarer Neutralbereich, Rand
  passend zu den anderen Landgebieten (`#5c4a32`, Strichbreite `0.9`).
- 34 VZ (22 Home als goldenes Quadrat, 12 Neutral als Doppelkreis) nah am
  jeweiligen Landeslabel.
- 6 Doppelkuesten-Indikatoren (bul-ec/sc, spa-nc/sc, stp-nc/sc).
- **Zwei dekorative Wasserpassagen**:
  - *Bosporus* durch den Westen von `con`, verbindet `bla` mit `aeg`.
  - *Kiel-Kanal* durch den oberen Teil von `kie`, verbindet `hel` mit `bal`.
  - Beide sind rein grafisch; `con` und `kie` bleiben logisch ein Gebiet.

### 2. Automatische Platzierung (`tools/compute_placements_v2.py`)
- Liest Polygone aus `Karte.svg` und Label-Bounding-Boxen aus
  `diplomacy-map.svg`.
- Berechnet pro Gebiet ein VZ (falls Home/Neutral-SC) und alle erlaubten
  Einheiten-Anker (`army`, `fleet`, `sf`, `air`).
- Constraints:
  - Rand-Abstand (adaptiv 7-13 px je nach Gebietsgroesse).
  - Mindestabstand zwischen Objekten (adaptiv 16-26 px).
  - Label-Bounding-Box + Pad (4-8 px) werden ausgespart.
  - Cluster-Radius um Label (70 px start, expandiert) verhindert
    Eck-Ausreisser in grossen Laendern.
  - Doppelkuesten: zwei Flotten-Anker, je auf der geografisch korrekten See.
  - Ecken-Aversion (weiche Bounding-Box-Corner-Penalty).
  - Deterministischer Jitter (seed `1901`) fuer chaotische Optik.
- Hand-Overrides fuer 6 winzige Polygone (gre, ska, cly, bre, nap, stp-sc, spa-sc).
- **Ergebnis:** 34 VZ, 56 Armeen, 64 Flotten (inkl. 3 Doppelkuesten-Extras),
  75 SF, 75 Air. 0 Anker ausserhalb ihres Polygons.

### 3. Zwei Karten-Varianten
| Datei | Zweck | VZ | Einheiten |
|-------|-------|-----|-----------|
| `diplomacy-map.svg` | Produktion (eigenstaendig) | sichtbar (Basis-Layer) | Anker unsichtbar |
| `diplomacy-map-anchors.svg` | Produktion (aus Solver) | sichtbar | Anker unsichtbar |
| `diplomacy-map-placements-preview.svg` | Debug / Design-Review | sichtbar | Symbole sichtbar + Legende |

### 4. Maschinenlesbare Daten (`Design System/placements.json`)
- Pro Gebiet: `type`, `nation`, `sc`, `dual_coast`, `label_bbox`, `anchors`.
- `anchors` enthaelt pro Slot einen (x,y)-Punkt. Doppelkuesten nutzen
  `fleet:ec`, `fleet:nc`, `fleet:sc` als Slot-Namen.

### 5. Aufgeraeumter Ordner
- Aktive Karten-Assets direkt in `Design System/`.
- Alles Nicht-Karten-Bezogene (Nations, screens, Style-Guide, Token-JSON,
  Backup-SVG, alte Preview) in `Design System/_archive/` verschoben.

## Geaenderte / neu angelegte Dateien
- `Design System/diplomacy-map.svg` (editiert: Schweiz-Rand, Wasserpassagen)
- `Design System/diplomacy-map-placements-preview.svg` (neu generiert)
- `Design System/diplomacy-map-anchors.svg` (neu generiert)
- `Design System/placements.json` (neu generiert)
- `Design System/D3-MAP-ANFORDERUNGEN.md` (Status-Abschnitt vorangestellt)
- `Design System/_archive/` (archivierte Assets)
- `tools/compute_placements_v2.py` (neu)

## Verifikation
```
Parsed 75 territory polygons from Karte.svg
Loaded 75 label bounding boxes (missing: [])
Object counts: {'army': 56, 'fleet': 64, 'sf': 75, 'air': 75, 'sc': 34}
```
Alle 75 Gebiete haben Label-Matches, alle erwarteten Anker platziert,
Doppelkuesten auf den korrekten Meeren, 0 Ueberlaeufe ausserhalb der Polygone.

## Offene Punkte / naechste Schritte
- Frontend-Team (F5) kann `placements.json` als Single Source of Truth fuer
  Unit-Rendering verwenden.
- Bei spaeterer Kartenueberarbeitung: `python tools/compute_placements_v2.py`
  ausfuehren — regeneriert alle abgeleiteten Dateien.
