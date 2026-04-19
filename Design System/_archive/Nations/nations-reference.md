# D2 — Nationen-Design Referenz

> Alle visuellen Identitäten der 7 Diplomacy 2.0 Nationen.
> Basiert auf D1 Style Guide Section 11.

---

## Übersicht

| # | Nation | Kürzel | Farbe | Hex | Emblem | Buff |
|---|--------|--------|-------|-----|--------|------|
| 1 | Großbritannien | GB | Rosa/Pink | `#E8A0B0` | Löwe mit Krone | Finanz-Zentrum (+2 CR/Hauptstadt) |
| 2 | Deutsches Reich | DE | Anthrazit | `#4A4A4A` | Reichsadler (gold) | High-Tech Marktführer (−1 CR Shop) |
| 3 | Österreich-Ungarn | AT | Rot | `#C0392B` | Doppeladler | Logistik-Knoten (1×/Jahr Eilmarsch) |
| 4 | Frankreich | FR | Blau | `#3498DB` | Lilie (Fleur-de-lis) | Nachrichtendienst (sieht alle Contracts) |
| 5 | Italien | IT | Grün | `#27AE60` | Stern + Zahnrad | Digitaler Backbone (+1 CR Gebühr) |
| 6 | Russland | RU | Gelb | `#F1C40F` | Bär mit Krone | Energie-Hegemonie (3 Energie/Hauptstadt) |
| 7 | Osmn. Reich | TR | Türkis | `#1ABC9C` | Halbmond + Stern | Technologie-Veto (1 Lizenz/Hauptstadt) |

---

## Detailspezifikationen

### 1. Großbritannien (GB)
```
Primärfarbe:     #E8A0B0  (Rosa/Pink)
Gebiets-Tint:    rgba(232, 160, 176, 0.4)
Einheiten-Ring:  #E8A0B0 mit 2px Stroke
Emblem:          Löwe rampant, mit Krone, auf rosa Schild
Emblem-Datei:    emblems/GB-grossbritannien.svg
Badge:           badges/nation-badges.svg (Pos. 1)
Heraldik:        Löwe = Mut & Stärke, Krone = Monarchie
Buff-Typ:        All-or-nothing (verliert bei Kapitals-Verlust)
```

### 2. Deutsches Reich (DE)
```
Primärfarbe:     #4A4A4A  (Anthrazit/Schwarz)
Gebiets-Tint:    rgba(74, 74, 74, 0.4)
Einheiten-Ring:  #4A4A4A mit 2px Stroke
Emblem:          Reichsadler (gold auf schwarz), Kaiserkrone
Emblem-Datei:    emblems/DE-deutsches-reich.svg
Badge:           badges/nation-badges.svg (Pos. 2)
Heraldik:        Adler = Macht, Kaiserliche Krone = Heiliges Röm. Reich
Buff-Typ:        All-or-nothing
```

### 3. Österreich-Ungarn (AT)
```
Primärfarbe:     #C0392B  (Rot)
Gebiets-Tint:    rgba(192, 57, 43, 0.4)
Einheiten-Ring:  #C0392B mit 2px Stroke
Emblem:          Doppeladler weiß auf rot, rot-weiß-rot Brust-Schild
Emblem-Datei:    emblems/AT-oesterreich-ungarn.svg
Badge:           badges/nation-badges.svg (Pos. 3)
Heraldik:        Doppeladler = Habsburg-Dualmonarchie (Österreich + Ungarn)
Buff-Typ:        All-or-nothing
```

### 4. Frankreich (FR)
```
Primärfarbe:     #3498DB  (Blau)
Gebiets-Tint:    rgba(52, 152, 219, 0.4)
Einheiten-Ring:  #3498DB mit 2px Stroke
Emblem:          Fleur-de-lis (gold auf blau), kleine Lilien-Muster
Emblem-Datei:    emblems/FR-frankreich.svg
Badge:           badges/nation-badges.svg (Pos. 4)
Heraldik:        Fleur-de-lis = Königreich Frankreich
Buff-Typ:        All-or-nothing
```

### 5. Italien (IT)
```
Primärfarbe:     #27AE60  (Grün)
Gebiets-Tint:    rgba(39, 174, 96, 0.4)
Einheiten-Ring:  #27AE60 mit 2px Stroke
Emblem:          5-zackiger Stern (Stella d'Italia) + Zahnrad, trikolore Streifen
Emblem-Datei:    emblems/IT-italien.svg
Badge:           badges/nation-badges.svg (Pos. 5)
Heraldik:        Stern = Einheit Italiens, Zahnrad = Industrie (wie Staatsemblem)
Buff-Typ:        All-or-nothing
```

### 6. Russland (RU)
```
Primärfarbe:     #F1C40F  (Gelb)
Gebiets-Tint:    rgba(241, 196, 15, 0.4)
Einheiten-Ring:  #F1C40F mit 2px Stroke
Emblem:          Bär (braun) mit Krone auf gelbem Schild
Emblem-Datei:    emblems/RU-russland.svg
Badge:           badges/nation-badges.svg (Pos. 6)
Heraldik:        Bär = Russland-Symbol, Größe & Stärke
Buff-Typ:        Verliert Energie-Hegemonie pro verlorene Hauptstadt
```

### 7. Osmanisches Reich (TR)
```
Primärfarbe:     #1ABC9C  (Türkis)
Gebiets-Tint:    rgba(26, 188, 156, 0.4)
Einheiten-Ring:  #1ABC9C mit 2px Stroke
Emblem:          Halbmond + Stern (weiß auf türkis), osmanische Ornamente
Emblem-Datei:    emblems/TR-osmanisches-reich.svg
Badge:           badges/nation-badges.svg (Pos. 7)
Heraldik:        Halbmond & Stern = Islam & Osmanisches Reich
Buff-Typ:        Verliert Lizenzen pro verlorene Hauptstadt
```

---

## Einheiten-Farbcodierung

Alle Einheiten-Tokens (A, F, AF, SF) erhalten den Primärfarb-Stroke der jeweiligen Nation:

```css
/* Beispiel CSS-Variablen für Karten-Rendering */
--unit-gb: #E8A0B0;
--unit-de: #4A4A4A;
--unit-at: #C0392B;
--unit-fr: #3498DB;
--unit-it: #27AE60;
--unit-ru: #F1C40F;
--unit-tr: #1ABC9C;
```

Barrierefreiheit (Farbenblindheit): Jede Nation hat zusätzlich ein Buchstaben-Kürzel
auf dem Token (GB/DE/AT/FR/IT/RU/TR) sowie unterschiedliche Helligkeit & Sättigung.

---

## Gebietsfärbung auf der Karte

Kontrollierte Gebiete werden mit **40% Alpha-Overlay** der Nationalfarbe eingefärbt:

```css
.territory-gb { fill: rgba(232, 160, 176, 0.4); }
.territory-de { fill: rgba(74,  74,  74,  0.4); }
.territory-at { fill: rgba(192, 57,  43,  0.4); }
.territory-fr { fill: rgba(52,  152, 219, 0.4); }
.territory-it { fill: rgba(39,  174, 96,  0.4); }
.territory-ru { fill: rgba(241, 196, 15,  0.4); }
.territory-tr { fill: rgba(26,  188, 156, 0.4); }
.territory-neutral { fill: rgba(200, 184, 135, 0.6); } /* #C8B887 */
```

---

## Kleine Flaggen-Icons (UI-Leiste, 16×12px Rechteck-Format)

Für die Top Info-Bar im Spielfeld: Rechteckige Flaggen-Badges in Nationalfarbe
mit weißem Kürzel (Inter 700, 8px).

```
[GB] [DE] [AT] [FR] [IT] [RU] [TR]
Pink Anth  Rot Blau Grün Gelb Türk
```

---

## Asset-Dateien

```
Design System/Nations/
├── emblems/
│   ├── GB-grossbritannien.svg      (120×140px, Schild-Form)
│   ├── DE-deutsches-reich.svg      (120×140px, Schild-Form)
│   ├── AT-oesterreich-ungarn.svg   (120×140px, Schild-Form)
│   ├── FR-frankreich.svg           (120×140px, Schild-Form)
│   ├── IT-italien.svg              (120×140px, Schild-Form)
│   ├── RU-russland.svg             (120×140px, Schild-Form)
│   └── TR-osmanisches-reich.svg    (120×140px, Schild-Form)
├── badges/
│   └── nation-badges.svg           (560×80px, alle 7 in einer Datei)
└── nations-reference.md            (diese Datei)
```

---

## Figma-Integration

Alle Embleme können via **Figma › File › Place image…** oder dem
**Figma Tokens Plugin** direkt als Components eingebunden werden.

Empfohlene Component-Struktur:
```
📁 Nations
 ├── 🛡 Emblem/GB (120×140)
 ├── 🛡 Emblem/DE (120×140)
 ├── 🛡 Emblem/AT (120×140)
 ├── 🛡 Emblem/FR (120×140)
 ├── 🛡 Emblem/IT (120×140)
 ├── 🛡 Emblem/RU (120×140)
 ├── 🛡 Emblem/TR (120×140)
 ├── 🔵 Badge/GB  (72×72, rund)
 ├── 🔵 Badge/DE  (72×72, rund)
 └── … (alle 7)
```
