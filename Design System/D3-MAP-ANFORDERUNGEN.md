# D3 — Europa-Karte SVG: Vollstandige Anforderungen

> Alles was du zur Erstellung der interaktiven Diplomacy-Karte brauchst.
> Kritischer Pfad — blockiert F5 Karten-Renderer.

---

## IMPLEMENTIERUNGSSTATUS (Stand 2026-04-19)

**Status: abgeschlossen.** Die Karte existiert als `diplomacy-map.svg` mit 75 Gebieten
(19 Seen + 56 Land/Kuesten). Gegenueber der urspruenglichen Spezifikation unten
gelten folgende Anpassungen:

### Gebietszahl
- **75 Gebiete statt 80** — Standard-Diplomacy-Brett 1901. Nat, Rie, Est, Lat, Lit
  sind nicht Teil des klassischen Bretts.
- Schweiz (`che`) ist als dekorativer, nicht-klickbarer Neutralbereich enthalten.

### Farben & Grenzen
- **Alle Land-/Kuestengebiete einheitlich beige** `#e8dcc8` mit Rand `#5c4a32`,
  Strichbreite `0.9`. Kein Nation-Tinting auf der Basis — Besitz wird ausschliesslich
  ueber das VZ-Symbol und dessen Fuellung ausgedrueckt.
- **Seen** mit Gradient `#34497e -> #243359`, Rand `#1a2744`.
- **Schweiz** weiss `#ffffff`, gleicher Rand wie Landgebiete.

### Versorgungszentren (VZ)
- **Genau zwei VZ-Typen**:
  - *Home-SC* = goldenes Quadrat `11x11 rx=1.4`, Fuellung `#C5A55A`.
  - *Neutrales SC* = goldener Innenkreis mit konzentrischem Aussenring.
- VZ werden dicht am jeweiligen Laender-Label positioniert (Abstand ~24 px,
  Maximum 42 px). Nach der Capture-Phase nimmt die Fuellung die Besitzer-Farbe an.
- **Exakt 34 VZ** (22 Home + 12 Neutral).

### Einheiten-Anker
- Vier Einheitentypen: `army`, `fleet`, `sf` (Spezialeinheit), `air`.
- Pro Gebiet werden *alle zulaessigen* Anker erzeugt:
  - See: `fleet`, `sf`, `air`.
  - Inland: `army`, `sf`, `air`.
  - Kueste: `army`, `fleet`, `sf`, `air`.
- **Doppelkuesten** (`bul`, `spa`, `stp`) bekommen zwei Flotten-Anker, jeweils
  am geographisch korrekten Meer (`bul.ec -> bla`, `bul.sc -> aeg`,
  `spa.nc -> mao`, `spa.sc -> wes`, `stp.nc -> bar`, `stp.sc -> bot`).
- Anker sind unsichtbar mit `data-territory`, `data-unit`, `data-coast`.

### Dekorative Wasserpassagen
- **Bosporus** (grafisch): zerschneidet den westlichen Teil von `con` und verbindet
  `bla` mit `aeg` visuell. `con` bleibt logisch *ein* Gebiet.
- **Kiel-Kanal** (grafisch): verlaeuft durch den oberen Teil von `kie` und verbindet
  `hel` mit `bal`. `kie` bleibt logisch *ein* Gebiet.

### Platzierungs-Pipeline
- `tools/compute_placements_v2.py` berechnet automatisch VZ- und Anker-Positionen
  aus `Karte.svg` und den Label-Bounding-Boxen.
- Output: `placements.json` (maschinenlesbar) plus zwei Preview-SVGs:
  - `diplomacy-map-placements-preview.svg` — alle Einheiten sichtbar als Symbole.
  - `diplomacy-map-anchors.svg` — nur VZ sichtbar, Einheiten als unsichtbare
    Anker-Punkte (Produktions-Variante).
- Qualitaetssicherung: jeder Anker liegt innerhalb seines Polygons, haelt
  Mindestabstand zu Label/Rand/anderen Ankern und clustert in einem Radius
  um das Label (kein Verrutschen in die Ecken grosser Laender).

### Dateien im Design System (nach Aufraeumen)
- `diplomacy-map.svg` — Produktions-Karte
- `diplomacy-map-placements-preview.svg` — Preview mit allen Einheiten
- `diplomacy-map-anchors.svg` — Produktions-Variante (nur VZ sichtbar)
- `placements.json` — strukturierte Positionsdaten
- `territory-id-mapping.md` — Territory-ID-Referenz
- `_archive/` — aeltere Assets (Nations, screens, Backup-SVG)

---

## 1. SVG-Grundstruktur

```
viewBox="0 0 [Breite] [Hoehe]"    — frei wahlbar, z.B. 1000x760 oder 1200x900
preserveAspectRatio="xMidYMid meet"
xmlns="http://www.w3.org/2000/svg"
```

- Kein fester `width`/`height` — nur `viewBox` fur Skalierbarkeit
- Optimiert fur Mobile: kein unnoeiger Whitespace, kompakter viewBox
- Aspekt ca. 4:3 (Europa-Layout)

---

## 2. Alle 80 Gebiete (aus territories.ts)

Jedes Gebiet = ein eigenes `<polygon>` oder `<path>` Element.
**ID-Attribut = Territory-ID** (3-Buchstaben-Code, lowercase).

### 2.1 Grossbritannien (6 Gebiete)

| ID | Name | Typ | SC | Home-Nation |
|----|------|-----|----|-------------|
| `cly` | Clyde | coast | Nein | — |
| `edi` | Edinburgh | coast | **Ja** | England |
| `lvp` | Liverpool | coast | **Ja** | England |
| `wal` | Wales | coast | Nein | — |
| `lon` | London | coast | **Ja** | England |
| `yor` | Yorkshire | coast | Nein | — |

**Adjazenz (Land-Grenzen muessen sich beruehren):**
- cly — edi, lvp
- edi — cly, lvp, yor
- lvp — cly, edi, wal, yor
- yor — edi, lon, lvp, wal
- wal — lon, lvp, yor
- lon — wal, yor

### 2.2 Westeuropa (11 Gebiete)

| ID | Name | Typ | SC | Home-Nation |
|----|------|-----|----|-------------|
| `bre` | Brest | coast | **Ja** | France |
| `par` | Paris | **land** | **Ja** | France |
| `pic` | Picardy | coast | Nein | — |
| `bur` | Burgundy | **land** | Nein | — |
| `gas` | Gascony | coast | Nein | — |
| `mar` | Marseille | coast | **Ja** | France |
| `spa` | Spain | coast | **Ja** | Neutral |
| `por` | Portugal | coast | **Ja** | Neutral |
| `bel` | Belgium | coast | **Ja** | Neutral |
| `hol` | Holland | coast | **Ja** | Neutral |
| `ruh` | Ruhr | **land** | Nein | — |

**Adjazenz:**
- bre — gas, par, pic (Land) + eng, mao (See)
- par — bre, bur, gas, pic
- pic — bel, bre, bur, par + eng (See)
- bur — bel, gas, mun, mar, par, pic, ruh
- gas — bre, bur, mar, par, spa + mao (See)
- mar — bur, gas, pie, spa + lyo (See)
- spa — gas, mar, por + lyo, mao, wes (See) — **DOPPELKUESTE**
- por — spa + mao (See)
- bel — bur, hol, pic, ruh + eng, nth (See)
- hol — bel, kie, ruh + hel, nth (See)
- ruh — bel, bur, hol, kie, mun

### 2.3 Deutschland / Mitteleuropa (7 Gebiete)

| ID | Name | Typ | SC | Home-Nation |
|----|------|-----|----|-------------|
| `kie` | Kiel | coast | **Ja** | Germany |
| `ber` | Berlin | coast | **Ja** | Germany |
| `mun` | Munich | **land** | **Ja** | Germany |
| `sil` | Silesia | **land** | Nein | — |
| `pru` | Prussia | coast | Nein | — |
| `boh` | Bohemia | **land** | Nein | — |
| `tyr` | Tyrolia | **land** | Nein | — |

**Adjazenz:**
- kie — ber, den, hol, mun, ruh + bal, hel (See) — **KANAL**
- ber — kie, mun, pru, sil + bal (See)
- mun — ber, boh, bur, kie, ruh, sil, tyr, vie
- sil — ber, boh, gal, mun, pru, war
- pru — ber, lit, lvn, sil, war + bal (See)
- boh — gal, mun, sil, tyr, vie
- tyr — boh, mun, pie, tri, ven, vie

### 2.4 Oesterreich-Ungarn (4 Gebiete)

| ID | Name | Typ | SC | Home-Nation |
|----|------|-----|----|-------------|
| `vie` | Vienna | **land** | **Ja** | Austria-Hungary |
| `bud` | Budapest | **land** | **Ja** | Austria-Hungary |
| `tri` | Trieste | coast | **Ja** | Austria-Hungary |
| `gal` | Galicia | **land** | Nein | — |

**Adjazenz:**
- vie — boh, bud, gal, mun, tri, tyr
- bud — gal, rum, ser, tri, vie
- tri — alb, bud, ser, tyr, ven, vie + adr (See)
- gal — boh, bud, rum, sil, ukr, vie, war

### 2.5 Italien (6 Gebiete)

| ID | Name | Typ | SC | Home-Nation |
|----|------|-----|----|-------------|
| `ven` | Venice | coast | **Ja** | Italy |
| `pie` | Piedmont | coast | Nein | — |
| `tus` | Tuscany | coast | Nein | — |
| `rom` | Rome | coast | **Ja** | Italy |
| `apu` | Apulia | coast | Nein | — |
| `nap` | Naples | coast | **Ja** | Italy |

**Adjazenz:**
- ven — apu, pie, rom, tri, tus, tyr + adr (See)
- pie — mar, tus, tyr, ven + lyo (See)
- tus — pie, rom, ven + lyo, tys (See)
- rom — apu, nap, tus, ven + tys (See)
- apu — nap, rom, ven + adr, ion (See)
- nap — apu, rom + ion, tys (See)

### 2.6 Balkan (5 Gebiete)

| ID | Name | Typ | SC | Home-Nation |
|----|------|-----|----|-------------|
| `ser` | Serbia | **land** | **Ja** | Neutral |
| `alb` | Albania | coast | Nein | — |
| `gre` | Greece | coast | **Ja** | Neutral |
| `rum` | Rumania | coast | **Ja** | Neutral |
| `bul` | Bulgaria | coast | **Ja** | Neutral |

**Adjazenz:**
- ser — alb, bud, bul, gre, rum, tri
- alb — gre, ser, tri + adr, ion (See)
- gre — alb, bul, ser + aeg, ion (See)
- rum — bud, bul, gal, ser, sev, ukr + bla (See)
- bul — con, gre, rum, ser + aeg, bla (See) — **DOPPELKUESTE**

### 2.7 Osmanisches Reich / Turkei (5 Gebiete)

| ID | Name | Typ | SC | Home-Nation |
|----|------|-----|----|-------------|
| `con` | Constantinople | coast | **Ja** | Turkey |
| `ank` | Ankara | coast | **Ja** | Turkey |
| `smy` | Smyrna | coast | **Ja** | Turkey |
| `arm` | Armenia | coast | Nein | — |
| `syr` | Syria | coast | Nein | — |

**Adjazenz:**
- con — ank, bul, smy + aeg, bla (See) — **KANAL**
- ank — arm, con, smy + bla (See)
- smy — ank, arm, con, syr + aeg, eas (See)
- arm — ank, sev, smy, syr + bla, eas (See)
- syr — arm, smy + eas (See)

### 2.8 Russland (7 Gebiete)

| ID | Name | Typ | SC | Home-Nation |
|----|------|-----|----|-------------|
| `stp` | St. Petersburg | coast | **Ja** | Russia |
| `mos` | Moscow | **land** | **Ja** | Russia |
| `war` | Warsaw | **land** | **Ja** | Russia |
| `sev` | Sevastopol | coast | **Ja** | Russia |
| `ukr` | Ukraine | **land** | Nein | — |
| `lvn` | Livonia | coast | Nein | — |
| `fin` | Finland | coast | Nein | — |

**Adjazenz:**
- stp — fin, lvn, mos, nwy + bar, bot, rie (See) — **DOPPELKUESTE**
- mos — lvn, sev, stp, ukr, war
- war — gal, lvn, mos, pru, sil, ukr
- sev — arm, mos, rum, ukr + bla (See)
- ukr — gal, mos, rum, sev, war
- lvn — est, lat, lit, mos, pru, stp, war + bal, bot, rie (See)
- fin — nwy, stp, swe + bot (See)

### 2.9 Skandinavien (3 Gebiete)

| ID | Name | Typ | SC | Home-Nation |
|----|------|-----|----|-------------|
| `nwy` | Norway | coast | **Ja** | Neutral |
| `swe` | Sweden | coast | **Ja** | Neutral |
| `den` | Denmark | coast | **Ja** | Neutral |

**Adjazenz:**
- nwy — fin, stp, swe + bar, nao, nth, nwg, ska (See)
- swe — den, fin, nwy + bal, bot, ska (See)
- den — kie, swe + bal, hel, nth, ska (See)

### 2.10 Baltische Staaten (3 Gebiete)

| ID | Name | Typ | SC | Home-Nation |
|----|------|-----|----|-------------|
| `est` | Estonia | coast | Nein | — |
| `lat` | Latvia | coast | Nein | — |
| `lit` | Lithuania | coast | Nein | — |

**Adjazenz:**
- est — lat, lvn + bot, rie (See)
- lat — est, lit, lvn + rie (See)
- lit — lat, lvn, pru

### 2.11 Nordafrika (2 Gebiete)

| ID | Name | Typ | SC | Home-Nation |
|----|------|-----|----|-------------|
| `naf` | North Africa | coast | Nein | — |
| `tun` | Tunisia | coast | **Ja** | Neutral |

**Adjazenz:**
- naf — tun + mao, tys, wes (See)
- tun — naf + ion, tys, wes (See)

### 2.12 Seegebiete (21 Gebiete)

| ID | Name | Angrenzende Gebiete |
|----|------|---------------------|
| `nat` | North Atlantic Ocean | cly, iri, lvp, mao, nao |
| `nao` | Norwegian Sea | bar, cly, edi, iri, lvp, nat, nwg, nwy |
| `bar` | Barents Sea | nao, nwg, nwy, stp |
| `nwg` | Norwegian Sea (North) | bar, edi, nao, nth, nwy |
| `nth` | North Sea | bel, den, edi, eng, hel, hol, lon, nwg, nwy, ska, wal, yor |
| `ska` | Skagerrak | den, nth, nwy, swe |
| `hel` | Helgoland Bight | den, hol, kie, nth |
| `eng` | English Channel | bel, bre, iri, lon, mao, nth, pic, wal |
| `iri` | Irish Sea | eng, lvp, mao, nat, nao, wal |
| `mao` | Mid-Atlantic Ocean | bre, eng, gas, iri, nat, naf, por, spa, wes |
| `bal` | Baltic Sea | ber, den, bot, kie, lvn, pru, swe |
| `bot` | Gulf of Bothnia | bal, est, fin, lvn, rie, stp, swe |
| `rie` | Gulf of Riga | bot, est, lat, lvn, stp |
| `lyo` | Gulf of Lyon | mar, pie, spa, tus, tys, wes |
| `wes` | Western Mediterranean | lyo, mao, naf, spa, tun, tys |
| `tys` | Tyrrhenian Sea | ion, lyo, naf, nap, rom, tun, tus, wes |
| `adr` | Adriatic Sea | alb, apu, ion, tri, ven |
| `ion` | Ionian Sea | adr, aeg, alb, apu, eas, gre, nap, tun, tys |
| `aeg` | Aegean Sea | bul, con, eas, gre, ion, smy |
| `eas` | Eastern Mediterranean | aeg, arm, ion, smy, syr |
| `bla` | Black Sea | ank, arm, bul, con, rum, sev |

---

## 3. Doppelkuesten (Dual Coasts)

Drei Gebiete haben zwei separate Kuesten. Flotten muessen angeben, auf welcher Kueste sie stehen. Visuell durch gestrichelte Linie oder Markierung andeuten.

### Bulgaria (`bul`)
- **NC** (Nordkueste): grenzt an `bla`, `rum`
- **SC** (Suedkueste): grenzt an `aeg`, `con`, `gre`

### St. Petersburg (`stp`)
- **NC** (Nordkueste): grenzt an `bar`, `nwy`
- **SC** (Suedkueste): grenzt an `bot`, `fin`, `lvn`

### Spain (`spa`)
- **NC** (Nordkueste): grenzt an `gas`, `mao`
- **SC** (Suedkueste): grenzt an `gas`, `lyo`, `mao`, `mar`, `wes`

---

## 4. Kanal-Gebiete

Flotten koennen durch diese Gebiete "hindurch" fahren, als waeren die beiden Seegebiete direkt benachbart.

| ID | Name | Verbindet |
|----|------|-----------|
| `kie` | Kiel | Baltic Sea (`bal`) <-> Helgoland Bight (`hel`) |
| `con` | Constantinople | Black Sea (`bla`) <-> Aegean Sea (`aeg`) |

---

## 5. Farbgebung

### 5.1 Gebietstypen

| Typ | Farbe | Hex | Beschreibung |
|-----|-------|-----|-------------|
| Land (inland) | Warmes Beige/Pergament | `#E8DCC8` | Standardton fur alle Landgebiete |
| Kueste (coast) | Beige mit dunklerem Rand | `#E8DCC8` + Stroke `#5C4A32` | Wie Land, aber an See grenzend |
| See (sea) | Navy-Blau | `#2C3E6B` | Dunkles Marineblau |

Hinweis aus D1 Style Guide:
- Pergament-Ton: `#F4E8C1` (fur UI-Elemente)
- Holzrahmen: `#5C3A21` / `#7A4E2D` / `#3E2510`
- Navy Haupt-Hintergrund: `#1B2838`
- Die Karte selbst kann etwas heller sein als der UI-Hintergrund

### 5.2 Nationen-Farben (Home-Gebiete)

Home Supply Centers und zugehoerige Startgebiete werden mit 40% Alpha-Overlay der Nationalfarbe eingefaerbt:

| Nation | Primaerfarbe | Hex | 40%-Overlay auf Beige | CSS-Klasse |
|--------|-------------|-----|----------------------|------------|
| England | Rosa/Pink | `#E8A0B0` | `rgba(232, 160, 176, 0.4)` | `.territory-gb` |
| Deutsches Reich | Anthrazit | `#4A4A4A` | `rgba(74, 74, 74, 0.4)` | `.territory-de` |
| Oesterreich-Ungarn | Rot | `#C0392B` | `rgba(192, 57, 43, 0.4)` | `.territory-at` |
| Frankreich | Gelb | `#FFDD00` | `rgba(255, 221, 0, 0.4)` | `.territory-fr` |
| Italien | Gruen | `#27AE60` | `rgba(39, 174, 96, 0.4)` | `.territory-it` |
| Russland | Gelb | `#F1C40F` | `rgba(241, 196, 15, 0.4)` | `.territory-ru` |
| Osmanisches Reich | Tuerkis | `#1ABC9C` | `rgba(26, 188, 156, 0.4)` | `.territory-tr` |

**Welche Gebiete welche Nation-Farbe bekommen:**

| Nation | Gebiete mit Nation-Farbe |
|--------|-------------------------|
| England | edi, lvp, lon |
| France | bre, par, mar |
| Germany | kie, ber, mun |
| Austria-Hungary | vie, bud, tri |
| Italy | ven, rom, nap |
| Russia | stp, mos, war, sev |
| Turkey | con, ank, smy |

### 5.3 Neutrale Versorgungszentren

| Farbe | Hex | Gebiete |
|-------|-----|---------|
| Warmer Sand/Khaki | `#C8B887` bei 60% | nwy, swe, den, bel, hol, spa, por, ser, gre, rum, bul, tun |

---

## 6. Versorgungszentren (34 Stueck)

Jedes SC wird mit einem kleinen Symbol markiert — z.B. ausgefuellter Kreis (radius ~4px), Stern, oder Punkt.

```xml
<!-- Beispiel SC-Marker -->
<circle cx="[X]" cy="[Y]" r="4" fill="#1A1A1A" stroke="#FFFFFF" stroke-width="0.8"/>
```

**Alle 34 SCs:**

England (3): `edi`, `lvp`, `lon`
France (3): `bre`, `par`, `mar`
Germany (3): `kie`, `ber`, `mun`
Austria (3): `vie`, `bud`, `tri`
Italy (3): `ven`, `rom`, `nap`
Russia (4): `stp`, `mos`, `war`, `sev`
Turkey (3): `con`, `ank`, `smy`
Neutral (12): `nwy`, `swe`, `den`, `bel`, `hol`, `spa`, `por`, `ser`, `gre`, `rum`, `bul`, `tun`

---

## 7. Technische SVG-Anforderungen

### 7.1 Element-Struktur pro Gebiet

```xml
<polygon id="vie"
         class="land nation-austria"
         points="x1,y1 x2,y2 x3,y3 ..."
         data-name="Vienna"
         data-type="land"
         data-sc="true"
         data-nation="Austria-Hungary"/>
```

- `id` = Territory-ID (Pflicht, exakt wie in territories.ts)
- `class` = Typ + optionale Nation-Klasse
- `points` oder `d` (bei `<path>`) = Gebietsumriss
- `data-*` Attribute = optional, hilfreich fur Frontend (F5)

### 7.2 Kein Overlap

- Angrenzende Gebiete muessen sich **exakte Kanten teilen** (shared vertices)
- Kein Ueberlappen von Pfaden — sonst funktioniert Click/Tap nicht
- Gebiete die aneinander grenzen MUESSEN eine gemeinsame Kante haben (keine Luecken)
- Trick: Definiere gemeinsame Eckpunkte und verwende sie in beiden Polygonen

### 7.3 Klick-/Tappbar

```css
polygon, path { cursor: pointer; }
text { pointer-events: none; }  /* Labels nicht klickbar */
```

- Jedes Gebiet muss eigenstaendig klickbar sein
- Hover-State: leicht aufgehellt / Stroke verstaerkt
- Touch-Target: ausreichend gross (min ~30px Durchmesser pro Gebiet)

### 7.4 Labels (togglebar)

```xml
<g class="labels">
  <text x="435" y="442" text-anchor="middle">VIE</text>
</g>
```

- Alle Labels in einer `<g class="labels">` Gruppe
- Kann per CSS ein-/ausgeblendet werden:
  ```css
  .hide-labels .labels { display: none; }
  ```
- Font: Inter, 6-8px, uppercase
- Landgebiete: dunkle Schrift (`#3A3226`)
- Seegebiete: helle Schrift (`#8BA4CC`), kursiv

### 7.5 Empfohlene Layer-Reihenfolge (unten → oben)

1. Hintergrund-Rechteck (Ozean-Farbe)
2. Seegebiete (`<g id="seas">`)
3. Landgebiete (`<g id="lands">`)
4. Grenzen/Borders (`<g id="borders">`)
5. Doppelkuesten-Indikatoren (`<g id="dual-coasts">`)
6. Kanal-Indikatoren (`<g id="canals">`)
7. Versorgungszentrum-Marker (`<g id="supply-centers">`)
8. Labels (`<g class="labels">`)

---

## 8. Design-Kontext (aus D1 Style Guide)

### Visueller Charakter

> "Das UI wirkt wie ein echtes Brettspiel, das auf einem Tisch liegt — aber lebendig ist."

- Holzrahmen um die Karte (wird vom Frontend gemacht, siehe `map/page.tsx`)
- Pergament-Hintergruende fur Landgebiete
- Messing-Beschlaege (Gold-Toene) fur Rahmen, Trennlinien, Icons
- WW1-Aera Aesthetik

### Relevante Design Tokens

```
Navy (Haupt-BG):     #1B2838
Navy Light:          #253548
Pergament:           #F4E8C1
Pergament Dunkel:    #E8D5A0
Holz:                #5C3A21
Holz Hell:           #7A4E2D
Holz Dunkel:         #3E2510
Gold/Messing:        #C5A55A
Gold Hell:           #D4BA7A
Gold Dunkel:         #9E7E3A
Text auf Dunkel:     #F4E8C1
Text Gold:           #C5A55A
Text Muted:          #8A9BAE
Text auf Pergament:  #1B2838
```

### Schriften

- Headings: **Cinzel** (serif, militaerisch)
- Body/Labels: **Inter** (sans-serif, klar)
- Mono/Codes: **JetBrains Mono**

Fur Karten-Labels empfohlen: Inter, 6-8px

---

## 9. Frontend-Integration (F5 erwartet)

### Map Page Placeholder

Die Seite `frontend/src/app/(game)/map/page.tsx` wartet auf D3+F5:
- Container: `max-w-2xl`, Aspekt `4:3`
- Holzrahmen via CSS (bereits implementiert)
- Innenbereich: `#4A7FA5` Platzhalter (wird durch SVG ersetzt)

### Erwartete Verwendung im F5 Renderer

```tsx
// SVG inline einbinden oder als React-Komponente
import DiplomacyMap from '@/assets/diplomacy-map.svg';

// Oder: SVG dynamisch laden und per Pixi.js rendern
// Jedes <polygon id="xxx"> wird zu einem interaktiven Gebiet
```

### Dynamische Farbaenderung zur Laufzeit

Das Frontend aendert die `fill`-Farbe der Gebiete dynamisch:
```css
/* Wenn ein Gebiet von einer Nation kontrolliert wird */
#vie { fill: rgba(192, 57, 43, 0.4); }  /* Austria kontrolliert Wien */
#vie { fill: rgba(52, 152, 219, 0.4); }  /* France hat Wien erobert */
```

Deshalb: Standard-Fill sollte einfach Beige/See-Blau sein.
Die Nation-Overlay-Farbe wird dynamisch per JS/CSS gesetzt.

---

## 10. Geographische Hinweise

### Ungefaehre Positionen (von NW nach SO)

```
                    BAR (Barents Sea)
         NWG                    STP (St.Petersburg)
    NAO        NWY    FIN            MOS
NAT    EDI        SWE     EST
   CLY    YOR  SKA  BOT    LAT
   LVP       NTH  DEN     LVN  RIE
         WAL  HEL  BAL  LIT
    IRI  LON  ENG  BEL HOL  KIE  PRU    WAR
              PIC  RUH  BER        SIL       UKR
    MAO  BRE  BUR      MUN  BOH        GAL
         PAR  GAS  MAR  TYR  VIE  BUD       SEV
                   PIE        TRI  SER  RUM    BLA
    POR  SPA  LYO  TUS  VEN  ADR      BUL
                   ROM  APU     ALB        CON  ANK
              WES  TYS       ION  GRE  AEG  SMY  ARM
    MAO            NAP              EAS       SYR
         NAF       TUN
```

### Inseln und Sonderformen

- **Grossbritannien**: Inselgruppe links, getrennt vom Festland durch North Sea / English Channel / Irish Sea
- **Skandinavien**: Halbinsel oben mitte (nwy, swe), Denmark als Bruecke zum Festland
- **Italien**: Stiefelform, Halbinsel nach Sueden
- **Iberische Halbinsel**: spa + por im Suedwesten
- **Turkei/Anatolien**: Rechts unten, durch aeg/bla vom Balkan getrennt
- **Nordafrika**: Schmaler Streifen ganz unten (naf, tun)

### Groessenverhältnisse

- **Russland** (stp, mos, ukr, sev) = groesste Landflaechen
- **See-Gebiete** sollten grosszuegig sein (besonders nat, mao, nth)
- **Kleinere Gebiete**: hol, bel, den, alb — duenner, aber noch tappbar

---

## 11. Checkliste vor Abgabe

- [ ] Alle 80 IDs vorhanden (56 Land/Coast + 21 See + 3 Baltikum)
- [ ] Jedes `<polygon>`/`<path>` hat ein `id` Attribut mit korrekter Territory-ID
- [ ] Keine ueberlappenden Polygone (sauber klickbar)
- [ ] Keine Luecken zwischen angrenzenden Gebieten
- [ ] Landgebiete in Beige/Pergament-Ton
- [ ] Seegebiete in Navy-Blau
- [ ] 7 Nationen-Startgebiete farblich zugeordnet (22 Gebiete)
- [ ] 34 Versorgungszentren mit Marker
- [ ] 3 Doppelkuesten visuell markiert (bul, stp, spa)
- [ ] 2 Kanal-Gebiete markiert (kie, con)
- [ ] Labels als `<text>` in eigener Gruppe (togglebar)
- [ ] `viewBox` gesetzt, kein fester width/height
- [ ] Hover-States definiert (CSS)
- [ ] `cursor: pointer` auf allen Gebieten
- [ ] `pointer-events: none` auf Labels und Dekor-Elementen
- [ ] SVG validiert (keine Syntax-Fehler)

---

## 12. Referenz-Dateien im Projekt

| Datei | Pfad | Inhalt |
|-------|------|--------|
| Territory-Definitionen | `packages/game-logic/src/territories.ts` | Alle 80 Gebiete mit Adjazenz |
| Territory-Typen | `packages/game-logic/src/types/territory.ts` | TypeScript Interface |
| D1 Style Guide | `Design System/D1-STYLE-GUIDE.md` | Farben, Typo, Spacing |
| Design Tokens | `Design System/tokens.json` | Exportierbare Token-Werte |
| CSS Variables | `Design System/variables.css` | CSS Custom Properties |
| Nationen-Referenz | `Design System/Nations/nations-reference.md` | Nationen-Farben, Embleme |
| Nationen-Embleme | `Design System/Nations/emblems/*.svg` | 7 Wappen-SVGs (120x140px) |
| Map Page (Frontend) | `frontend/src/app/(game)/map/page.tsx` | Platzhalter mit Holzrahmen |
