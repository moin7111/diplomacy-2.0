#!/usr/bin/env python3
"""
Build diplomacy-map.svg from the Vectornator source (Karte.svg).

Pipeline:
  1. Extract each <path> with vectornator:layerName from the source SVG.
  2. Classify as sea / land-coast / neutral-divider.
  3. Assign territory id (lowercase of layerName).
  4. Compute bbox-centroid per territory from the path data for positioning
     labels, supply-center markers, unit anchors, and dual-coast sub-anchors.
  5. Emit a clean, optimized diplomacy-map.svg with layered groups:
       background -> seas -> lands -> borders -> dual-coasts -> SCs -> units -> labels
  6. Write a companion Markdown mapping table.
"""

from __future__ import annotations

import re
from pathlib import Path
from typing import Dict, List, Tuple

ROOT      = Path(r"C:\Users\leons\Downloads\Diplomacy 2.0")
SRC_SVG   = Path(r"C:\Users\leons\Downloads\Karte.svg")
OUT_SVG   = ROOT / "Design System" / "diplomacy-map.svg"
OUT_MD    = ROOT / "Design System" / "territory-id-mapping.md"

# ---------------------------------------------------------------------------
# Domain knowledge
# ---------------------------------------------------------------------------

SEAS = {
    "nao","nwg","bar","nth","ska","hel","eng","iri","mao",
    "bal","bot","lyo","wes","tys","adr","ion","aeg","eas","bla",
}
# Note: standard 1901 Diplomacy has 19 seas. The source asset matches this
# (no NAT / RIE). Land/coast total = 56. Grand total = 75.

HOME_TERRITORIES = {
    "austria":  ["vie", "bud", "tri"],
    "england":  ["lon", "lvp", "edi"],
    "france":   ["par", "mar", "bre"],
    "germany":  ["ber", "mun", "kie"],
    "italy":    ["rom", "nap", "ven"],
    "russia":   ["mos", "war", "sev", "stp"],
    "turkey":   ["con", "smy", "ank"],
}

# Home supply center (circle + filled square for capital)
CAPITALS = {
    "austria": "vie", "england": "lon", "france":  "par",
    "germany": "ber", "italy":   "rom", "russia":  "mos",
    "turkey":  "con",
}

NEUTRAL_SCS = {
    "bel","bul","den","gre","hol","nwy","por","rum","ser","spa","swe","tun",
}

DUAL_COASTS = {
    # territory -> list of (coast_code, (dx, dy) offset from centroid)
    "bul": [("ec", (+28, -6)), ("sc", (-4, +26))],
    "spa": [("nc", (-10, -22)), ("sc", (+6, +22))],
    "stp": [("nc", (-8, -34)), ("sc", (+2, +30))],
}

TERRITORY_NAMES: Dict[str, str] = {
    # British Isles
    "cly": "Clyde", "edi": "Edinburgh", "lvp": "Liverpool",
    "wal": "Wales", "lon": "London", "yor": "Yorkshire",
    # Western Europe
    "bre": "Brest", "par": "Paris", "pic": "Picardy", "bur": "Burgundy",
    "gas": "Gascony", "mar": "Marseilles", "spa": "Spain", "por": "Portugal",
    "bel": "Belgium", "hol": "Holland", "ruh": "Ruhr",
    # Central Europe / Germany
    "kie": "Kiel", "ber": "Berlin", "mun": "Munich", "sil": "Silesia",
    "pru": "Prussia", "boh": "Bohemia", "tyr": "Tyrolia",
    # Austria-Hungary
    "vie": "Vienna", "bud": "Budapest", "tri": "Trieste", "gal": "Galicia",
    # Italy
    "ven": "Venice", "pie": "Piedmont", "tus": "Tuscany",
    "rom": "Rome", "apu": "Apulia", "nap": "Naples",
    # Balkans
    "ser": "Serbia", "alb": "Albania", "gre": "Greece",
    "rum": "Rumania", "bul": "Bulgaria",
    # Ottoman Empire
    "con": "Constantinople", "ank": "Ankara", "smy": "Smyrna",
    "arm": "Armenia", "syr": "Syria",
    # Russia
    "stp": "St. Petersburg", "mos": "Moscow", "war": "Warsaw",
    "sev": "Sevastopol", "ukr": "Ukraine", "lvn": "Livonia", "fin": "Finland",
    # Scandinavia
    "nwy": "Norway", "swe": "Sweden", "den": "Denmark",
    # North Africa
    "naf": "North Africa", "tun": "Tunis",
    # Seas
    "nao": "North Atlantic Ocean", "nwg": "Norwegian Sea", "bar": "Barents Sea",
    "nth": "North Sea", "ska": "Skagerrak", "hel": "Helgoland Bight",
    "eng": "English Channel", "iri": "Irish Sea", "mao": "Mid-Atlantic Ocean",
    "bal": "Baltic Sea", "bot": "Gulf of Bothnia", "lyo": "Gulf of Lyon",
    "wes": "Western Mediterranean", "tys": "Tyrrhenian Sea",
    "adr": "Adriatic Sea", "ion": "Ionian Sea", "aeg": "Aegean Sea",
    "eas": "Eastern Mediterranean", "bla": "Black Sea",
}

# Which nation owns each home territory (for 40% tint classes)
HOME_OWNER: Dict[str, str] = {
    tid: nation for nation, tids in HOME_TERRITORIES.items() for tid in tids
}

# ---------------------------------------------------------------------------
# Parse source SVG
# ---------------------------------------------------------------------------

PATH_TAG_RE = re.compile(r"<path\b[^>]*/>")
LAYER_RE    = re.compile(r'vectornator:layerName="([^"]*)"')
D_RE        = re.compile(r'\bd="([^"]*)"')
NUM_RE      = re.compile(r"-?\d+(?:\.\d+)?")


def extract_paths(source_text: str) -> List[Tuple[str, str]]:
    """Return list of (layerName, d) for every <path>."""
    out = []
    for tag in PATH_TAG_RE.findall(source_text):
        ml = LAYER_RE.search(tag)
        md = D_RE.search(tag)
        if not ml or not md:
            continue
        out.append((ml.group(1), md.group(1)))
    return out


def path_points(d: str) -> List[Tuple[float, float]]:
    """Very permissive coordinate extractor (paths only contain M and L)."""
    nums = [float(n) for n in NUM_RE.findall(d)]
    return [(nums[i], nums[i + 1]) for i in range(0, len(nums) - 1, 2)]


def bbox_and_centroid(pts: List[Tuple[float, float]]):
    xs = [p[0] for p in pts]; ys = [p[1] for p in pts]
    minx, maxx = min(xs), max(xs); miny, maxy = min(ys), max(ys)
    return (minx, miny, maxx, maxy), ((minx + maxx) / 2, (miny + maxy) / 2)


# ---------------------------------------------------------------------------
# Build output
# ---------------------------------------------------------------------------

STYLE = """
  /* ───── Base terrain ───── */
  .territory { cursor: pointer; transition: filter 160ms ease, opacity 160ms ease; }
  .land       { fill: #E8DCC8; stroke: #5C4A32; stroke-width: 0.9; stroke-linejoin: round; }
  .coast      { fill: #E8DCC8; stroke: #5C4A32; stroke-width: 0.9; stroke-linejoin: round; }
  .sea        { fill: url(#sea-gradient); stroke: #1A2744; stroke-width: 0.5; stroke-linejoin: round; }
  .neutral    { fill: #FFFFFF; stroke: none; pointer-events: none; }

  /* ───── Nation home tints (layered as <use> overlay) ───── */
  .tint { fill-opacity: 0.38; pointer-events: none; }
  .tint.england  { fill: #E8A0B0; }
  .tint.france   { fill: #3498DB; }
  .tint.germany  { fill: #4A4A4A; }
  .tint.austria  { fill: #C0392B; }
  .tint.italy    { fill: #27AE60; }
  .tint.russia   { fill: #F1C40F; }
  .tint.turkey   { fill: #1ABC9C; }

  /* ───── Hover / selection ───── */
  .territory:hover { filter: brightness(1.08) saturate(1.1); }
  .territory.selected,
  .territory[data-selected="true"] { stroke: #C5A55A; stroke-width: 2.4; }

  /* ───── Supply-center markers ───── */
  .sc            { pointer-events: none; fill: #1A1A1A; stroke: #F4E8C1; stroke-width: 0.8; }
  .sc.home       { fill: #1A1A1A; }
  .sc.neutral    { fill: #C8B887; stroke: #5C4A32; }
  .capital-mark  { pointer-events: none; fill: #C5A55A; stroke: #3E2510; stroke-width: 0.8; }

  /* ───── Dual coast anchors (independently selectable) ───── */
  .coast-anchor  {
    fill: #F4E8C1; stroke: #5C4A32; stroke-width: 1; cursor: pointer;
    transition: r 120ms ease, fill 120ms ease;
  }
  .coast-anchor:hover { fill: #C5A55A; }
  .coast-anchor-line  {
    stroke: #8B7355; stroke-width: 0.8; stroke-dasharray: 3 2;
    fill: none; pointer-events: none;
  }
  .coast-label {
    font-family: 'Inter','Segoe UI',sans-serif; font-size: 6.5px; font-weight: 700;
    fill: #3E2510; text-anchor: middle; pointer-events: none; text-transform: uppercase;
  }

  /* ───── Unit anchor slots (filled at runtime by frontend) ───── */
  .unit-slot     { pointer-events: none; }
  .unit-slot circle { fill: none; stroke: none; }

  /* ───── Territory labels ───── */
  .labels text {
    font-family: 'Inter','Segoe UI',sans-serif;
    font-size: 7px;
    font-weight: 600;
    fill: #3A3226;
    text-anchor: middle;
    pointer-events: none;
    text-transform: uppercase;
    letter-spacing: 0.4px;
  }
  .labels .sea-label {
    fill: #8BA4CC;
    font-size: 6.5px;
    font-weight: 500;
    font-style: italic;
    letter-spacing: 0.8px;
  }
  .hide-labels .labels { display: none; }

  /* ───── Decorative overlays ───── */
  .land-shadow { fill: #5C4A32; opacity: 0.08; pointer-events: none; }
"""

# Unit symbols: army (rook), fleet (triangle/pennant), air (star)
DEFS = """
  <!-- Sea water gradient (subtle) -->
  <linearGradient id="sea-gradient" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0%"  stop-color="#34497E"/>
    <stop offset="100%" stop-color="#243359"/>
  </linearGradient>

  <!-- Paper grain for land (very subtle) -->
  <filter id="paper-grain" x="0" y="0" width="100%" height="100%">
    <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed="3"/>
    <feColorMatrix values="0 0 0 0 0.35  0 0 0 0 0.28  0 0 0 0 0.18  0 0 0 0.06 0"/>
    <feComposite in2="SourceGraphic" operator="in"/>
    <feBlend in="SourceGraphic" mode="multiply"/>
  </filter>

  <!-- Drop shadow for land mass -->
  <filter id="land-shadow" x="-5%" y="-5%" width="110%" height="110%">
    <feGaussianBlur in="SourceAlpha" stdDeviation="1.2"/>
    <feOffset dx="0" dy="1.5" result="off"/>
    <feComponentTransfer><feFuncA type="linear" slope="0.35"/></feComponentTransfer>
    <feMerge><feMergeNode/><feMergeNode in="SourceGraphic"/></feMerge>
  </filter>

  <!-- Reusable unit symbols -->
  <symbol id="unit-army" viewBox="-10 -10 20 20">
    <rect x="-7" y="-6" width="14" height="12" rx="1.5"
          fill="currentColor" stroke="#1A1A1A" stroke-width="1.2"/>
    <rect x="-6" y="-8" width="3" height="3" fill="currentColor" stroke="#1A1A1A" stroke-width="1"/>
    <rect x="-1.5" y="-8" width="3" height="3" fill="currentColor" stroke="#1A1A1A" stroke-width="1"/>
    <rect x="3" y="-8" width="3" height="3" fill="currentColor" stroke="#1A1A1A" stroke-width="1"/>
  </symbol>
  <symbol id="unit-fleet" viewBox="-10 -10 20 20">
    <path d="M-8,2 L8,2 L6,6 L-6,6 Z" fill="currentColor" stroke="#1A1A1A" stroke-width="1.2"/>
    <line x1="0" y1="2" x2="0" y2="-8" stroke="#1A1A1A" stroke-width="1.2"/>
    <path d="M0,-8 L6,-5 L0,-2 Z" fill="currentColor" stroke="#1A1A1A" stroke-width="1"/>
  </symbol>
  <symbol id="unit-air" viewBox="-10 -10 20 20">
    <path d="M0,-8 L2,-2 L8,0 L2,2 L0,8 L-2,2 L-8,0 L-2,-2 Z"
          fill="currentColor" stroke="#1A1A1A" stroke-width="1.1"/>
  </symbol>
"""

# ---------------------------------------------------------------------------
# Main build
# ---------------------------------------------------------------------------

def build() -> None:
    text = SRC_SVG.read_text(encoding="utf-8")
    # viewBox from the original
    m_vb = re.search(r'viewBox="([^"]+)"', text)
    viewbox = m_vb.group(1) if m_vb else "0 0 1136 1037"

    paths = extract_paths(text)

    # Classify
    seas:     List[Tuple[str, str, tuple, tuple]] = []
    lands:    List[Tuple[str, str, tuple, tuple]] = []
    neutrals: List[str] = []

    for layer, d in paths:
        d = d.strip()
        if not d.rstrip().endswith(("Z", "z")):
            d = d.rstrip() + " Z"
        if layer == "Neutral":
            neutrals.append(d)
            continue
        tid = layer.lower()
        pts = path_points(d)
        if not pts:
            continue
        bbox, centroid = bbox_and_centroid(pts)
        (seas if tid in SEAS else lands).append((tid, d, bbox, centroid))

    # Deduplicate by id (keep first)
    def dedup(lst):
        seen = set(); out = []
        for item in lst:
            if item[0] in seen: continue
            seen.add(item[0]); out.append(item)
        return out
    seas  = dedup(seas)
    lands = dedup(lands)

    centroids: Dict[str, Tuple[float, float]] = {t[0]: t[3] for t in seas + lands}
    bboxes:    Dict[str, tuple]                = {t[0]: t[2] for t in seas + lands}

    # ---- Emit SVG ----
    lines: List[str] = []
    w = lines.append

    w('<?xml version="1.0" encoding="UTF-8"?>')
    w("<!--")
    w("  Diplomacy 2.0 — Interactive Europa map")
    w("  Auto-generated from Karte.svg by tools/build_map.py")
    w(f"  Territories: {len(lands) + len(seas)} ({len(lands)} land/coast + {len(seas)} sea)")
    w("  Supply centers: 34 (22 home + 12 neutral)")
    w("  Dual coasts: bul (ec/sc), spa (nc/sc), stp (nc/sc)")
    w("-->")
    w(f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="{viewbox}"')
    w('     preserveAspectRatio="xMidYMid meet" role="img"')
    w('     aria-label="Diplomacy Europe board" class="diplomacy-map">')

    # <defs>
    w("  <defs>")
    w(DEFS)
    w(f"  <style><![CDATA[{STYLE}  ]]></style>")
    w("  </defs>")

    # Background ocean
    vb = viewbox.split()
    w(f'  <rect x="{vb[0]}" y="{vb[1]}" width="{vb[2]}" height="{vb[3]}" fill="url(#sea-gradient)"/>')

    # Seas
    w('  <g id="seas">')
    for tid, d, _, _ in seas:
        name = TERRITORY_NAMES.get(tid, tid.upper())
        w(f'    <path id="{tid}" class="territory sea" d="{d}"')
        w(f'          data-territory="{tid}" data-type="sea" data-name="{name}"/>')
    w("  </g>")

    # Lands
    w('  <g id="lands" filter="url(#land-shadow)">')
    for tid, d, _, _ in lands:
        cls = "territory coast"  # treat all as coast-capable; override via data-type
        owner = HOME_OWNER.get(tid)
        nation_cls = f" nation-{owner}" if owner else ""
        is_sc = owner is not None or tid in NEUTRAL_SCS
        name = TERRITORY_NAMES.get(tid, tid.upper())
        w(f'    <path id="{tid}" class="{cls}{nation_cls}" d="{d}"')
        w(f'          data-territory="{tid}" data-type="coast" data-name="{name}"')
        w(f'          data-sc="{str(is_sc).lower()}"'
          + (f' data-nation="{owner}"' if owner else "") + "/>")
    w("  </g>")

    # Nation tint overlays (re-stroke home territories with 38% color)
    w('  <g id="nation-tints" aria-hidden="true">')
    for tid, d, _, _ in lands:
        owner = HOME_OWNER.get(tid)
        if owner:
            w(f'    <path class="tint {owner}" d="{d}"/>')
    w("  </g>")

    # Neutral dividers (white — Switzerland, sea border notches)
    w('  <g id="neutral-borders" aria-hidden="true">')
    for d in neutrals:
        w(f'    <path class="neutral" d="{d}"/>')
    w("  </g>")

    # Supply-center markers: circle for neutrals, larger circle for home, square cap for capital
    w('  <g id="supply-centers">')
    for tid in sorted(NEUTRAL_SCS):
        if tid not in centroids: continue
        cx, cy = centroids[tid]
        w(f'    <circle class="sc neutral" data-territory="{tid}" data-sc-type="neutral"'
          f' cx="{cx:.1f}" cy="{cy + 10:.1f}" r="3.2"/>')
    for owner, tids in HOME_TERRITORIES.items():
        for tid in tids:
            if tid not in centroids: continue
            cx, cy = centroids[tid]
            w(f'    <circle class="sc home" data-territory="{tid}" data-sc-type="home"'
              f' data-nation="{owner}" cx="{cx:.1f}" cy="{cy + 10:.1f}" r="3.8"/>')
    # Capitals: golden square behind the home-SC circle
    for owner, tid in CAPITALS.items():
        if tid not in centroids: continue
        cx, cy = centroids[tid]
        w(f'    <rect class="capital-mark" data-territory="{tid}" data-nation="{owner}"'
          f' x="{cx - 5:.1f}" y="{cy + 5:.1f}" width="10" height="10" rx="1.2"/>')
    w("  </g>")

    # Dual-coast sub-anchors (independently clickable)
    w('  <g id="dual-coasts">')
    for tid, coasts in DUAL_COASTS.items():
        if tid not in centroids: continue
        cx, cy = centroids[tid]
        for coast, (dx, dy) in coasts:
            px, py = cx + dx, cy + dy
            w(f'    <line class="coast-anchor-line" x1="{cx:.1f}" y1="{cy:.1f}"'
              f' x2="{px:.1f}" y2="{py:.1f}"/>')
            w(f'    <circle class="coast-anchor" id="{tid}-{coast}"'
              f' data-territory="{tid}" data-coast="{coast}"'
              f' cx="{px:.1f}" cy="{py:.1f}" r="4.5"/>')
            w(f'    <text class="coast-label" x="{px:.1f}" y="{py - 7:.1f}">{coast.upper()}</text>')
    w("  </g>")

    # Unit anchor slots — invisible positioning points the frontend uses.
    # One per territory (center) + additional per dual-coast.
    w('  <g id="unit-anchors" aria-hidden="true">')
    for tid, (cx, cy) in centroids.items():
        w(f'    <g class="unit-slot" data-territory="{tid}" transform="translate({cx:.1f},{cy:.1f})">')
        w(f'      <circle r="0" cx="0" cy="0"/>')  # anchor marker (invisible)
        w("    </g>")
    for tid, coasts in DUAL_COASTS.items():
        if tid not in centroids: continue
        cx, cy = centroids[tid]
        for coast, (dx, dy) in coasts:
            w(f'    <g class="unit-slot" data-territory="{tid}" data-coast="{coast}"'
              f' transform="translate({cx + dx:.1f},{cy + dy:.1f})"><circle r="0"/></g>')
    w("  </g>")

    # Labels
    w('  <g class="labels" id="labels">')
    for tid, _, _, (cx, cy) in lands:
        label = tid.upper()
        w(f'    <text x="{cx:.1f}" y="{cy - 6:.1f}">{label}</text>')
    for tid, _, _, (cx, cy) in seas:
        w(f'    <text class="sea-label" x="{cx:.1f}" y="{cy:.1f}">{tid.upper()}</text>')
    w("  </g>")

    w("</svg>")
    OUT_SVG.write_text("\n".join(lines), encoding="utf-8")

    # ---- Mapping markdown ----
    md = build_mapping_md(lands, seas, centroids, bboxes)
    OUT_MD.write_text(md, encoding="utf-8")

    # Report
    print(f"Land/coast territories: {len(lands)}")
    print(f"Sea territories:        {len(seas)}")
    print(f"Neutral dividers:       {len(neutrals)}")
    print(f"Supply centers:         {len(NEUTRAL_SCS) + sum(len(v) for v in HOME_TERRITORIES.values())}")
    present = set(centroids.keys())
    expected = set(TERRITORY_NAMES.keys()) - {"est","lat","lit"}  # not in asset
    missing = expected - present
    extra   = present - expected
    if missing: print(f"  ! missing: {sorted(missing)}")
    if extra:   print(f"  ! unexpected ids: {sorted(extra)}")
    print(f"Wrote: {OUT_SVG}")
    print(f"Wrote: {OUT_MD}")


def build_mapping_md(lands, seas, centroids, bboxes) -> str:
    rows = []
    rows.append("# Territory ID Mapping\n")
    rows.append("_Auto-generated from `Karte.svg` by `tools/build_map.py`._\n")
    rows.append("Centroid coordinates are in the SVG viewBox space (px). "
                "The frontend uses the same numbers for positioning unit sprites.\n")
    rows.append("## Land & coastal territories\n")
    rows.append("| ID | Name | Type | SC | Home nation | Centroid (x, y) |")
    rows.append("|----|------|------|----|-------------|------------------|")
    for tid, _, _, (cx, cy) in sorted(lands):
        name  = TERRITORY_NAMES.get(tid, "?")
        owner = HOME_OWNER.get(tid, "")
        is_sc = "✓" if owner or tid in NEUTRAL_SCS else ""
        nation = owner.title() if owner else ("neutral" if tid in NEUTRAL_SCS else "—")
        rows.append(f"| `{tid}` | {name} | coast/land | {is_sc} | {nation} | ({cx:.0f}, {cy:.0f}) |")
    rows.append("\n## Sea territories\n")
    rows.append("| ID | Name | Centroid (x, y) |")
    rows.append("|----|------|------------------|")
    for tid, _, _, (cx, cy) in sorted(seas):
        rows.append(f"| `{tid}` | {TERRITORY_NAMES.get(tid,'?')} | ({cx:.0f}, {cy:.0f}) |")
    rows.append("\n## Dual coasts\n")
    rows.append("| Territory | Coast | DOM id | Anchors from center |")
    rows.append("|-----------|-------|--------|---------------------|")
    for tid, coasts in DUAL_COASTS.items():
        for coast, (dx, dy) in coasts:
            rows.append(f"| `{tid}` | {coast.upper()} | `{tid}-{coast}` | ({dx:+d}, {dy:+d}) |")
    rows.append("\n## Supply centers summary\n")
    rows.append("| Nation | Home SCs |")
    rows.append("|--------|----------|")
    for nation, tids in HOME_TERRITORIES.items():
        rows.append(f"| {nation.title()} | {', '.join(f'`{t}`' for t in tids)} |")
    rows.append(f"| Neutral | {', '.join(f'`{t}`' for t in sorted(NEUTRAL_SCS))} |")
    return "\n".join(rows) + "\n"


if __name__ == "__main__":
    build()
