#!/usr/bin/env python3
"""
Rebuild diplomacy-map.svg in place with the following changes:

  1. Assign id, class and data-* attributes to every sea and land <path>
     by matching its `d` fingerprint to the original Karte.svg layers.
  2. Drop the `<g id="nation-tints">` group entirely — all lands stay beige.
  3. Keep `<g id="Schweiz">` white with a thicker dark border, non-clickable.
  4. Regenerate `<g id="supply-centers">`:
       - home  SCs = rounded square (22 territories — including capitals)
       - neutral SCs = dot + outer ring (12 territories)
       - fill updated at runtime to the owning nation's color
       - positions inherited from the existing user-placed markers
  5. Wrap each dual-coast text group in a clickable hit-zone so a fleet can
     pick `nc`, `ec`, or `sc` independently.
  6. Add a new `<g id="unit-anchors">` group containing four invisible
     anchor slots per territory (army, fleet, sf, air) plus per dual-coast
     anchors. Placement rules:
         - fleets   → only on coast/sea
         - armies   → only on land
         - sf / air → everywhere
       Anchors are at fixed offsets around the centroid so multiple units
       do not overlap.
  7. Keep labels and neutral-borders untouched.
"""

from __future__ import annotations

import re
from pathlib import Path
from math import sqrt
from typing import Dict, List, Tuple

ROOT = Path(r"C:\Users\leons\Downloads\Diplomacy 2.0")
ORIG = Path(r"C:\Users\leons\Downloads\Karte.svg")
CURR = ROOT / "Design System" / "diplomacy-map.svg"
OUT  = CURR  # overwrite

# ---------------------------------------------------------------------------
# Domain data
# ---------------------------------------------------------------------------

SEAS = {
    "nao", "nwg", "bar", "nth", "ska", "hel", "eng", "iri", "mao",
    "bal", "bot", "lyo", "wes", "tys", "adr", "ion", "aeg", "eas", "bla",
}

INLAND = {
    "par", "bur", "ruh", "mun", "sil", "boh", "tyr",
    "vie", "bud", "gal", "ser", "mos", "war", "ukr",
}  # armies only, no fleets

HOME = {
    "austria":  ["vie", "bud", "tri"],
    "england":  ["lon", "lvp", "edi"],
    "france":   ["par", "mar", "bre"],
    "germany":  ["ber", "mun", "kie"],
    "italy":    ["rom", "nap", "ven"],
    "russia":   ["mos", "war", "sev", "stp"],
    "turkey":   ["con", "smy", "ank"],
}
HOME_OWNER: Dict[str, str] = {t: n for n, ts in HOME.items() for t in ts}

NEUTRAL_SCS = {
    "bel", "bul", "den", "gre", "hol", "nwy",
    "por", "rum", "ser", "spa", "swe", "tun",
}

DUAL_COASTS = {
    "bul": {"ec", "sc"},
    "spa": {"nc", "sc"},
    "stp": {"nc", "sc"},
}

TERRITORY_NAMES: Dict[str, str] = {
    "cly": "Clyde", "edi": "Edinburgh", "lvp": "Liverpool", "wal": "Wales",
    "lon": "London", "yor": "Yorkshire", "bre": "Brest", "par": "Paris",
    "pic": "Picardy", "bur": "Burgundy", "gas": "Gascony", "mar": "Marseilles",
    "spa": "Spain", "por": "Portugal", "bel": "Belgium", "hol": "Holland",
    "ruh": "Ruhr", "kie": "Kiel", "ber": "Berlin", "mun": "Munich",
    "sil": "Silesia", "pru": "Prussia", "boh": "Bohemia", "tyr": "Tyrolia",
    "vie": "Vienna", "bud": "Budapest", "tri": "Trieste", "gal": "Galicia",
    "ven": "Venice", "pie": "Piedmont", "tus": "Tuscany", "rom": "Rome",
    "apu": "Apulia", "nap": "Naples", "ser": "Serbia", "alb": "Albania",
    "gre": "Greece", "rum": "Rumania", "bul": "Bulgaria",
    "con": "Constantinople", "ank": "Ankara", "smy": "Smyrna",
    "arm": "Armenia", "syr": "Syria", "stp": "St. Petersburg",
    "mos": "Moscow", "war": "Warsaw", "sev": "Sevastopol", "ukr": "Ukraine",
    "lvn": "Livonia", "fin": "Finland", "nwy": "Norway", "swe": "Sweden",
    "den": "Denmark", "naf": "North Africa", "tun": "Tunis",
    "nao": "North Atlantic Ocean", "nwg": "Norwegian Sea",
    "bar": "Barents Sea", "nth": "North Sea", "ska": "Skagerrak",
    "hel": "Helgoland Bight", "eng": "English Channel", "iri": "Irish Sea",
    "mao": "Mid-Atlantic Ocean", "bal": "Baltic Sea", "bot": "Gulf of Bothnia",
    "lyo": "Gulf of Lyon", "wes": "Western Mediterranean",
    "tys": "Tyrrhenian Sea", "adr": "Adriatic Sea", "ion": "Ionian Sea",
    "aeg": "Aegean Sea", "eas": "Eastern Mediterranean", "bla": "Black Sea",
}

# Fixed offsets for the four unit anchor slots around a territory centroid.
# These keep units visually distinct when several stack on one province.
UNIT_OFFSETS = {
    "army":  (-14, +14),   # bottom-left
    "fleet": (+14, +14),   # bottom-right
    "sf":    (-14, -14),   # top-left
    "air":   (+14, -14),   # top-right
}

# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

NUM_RE = re.compile(r"-?\d+(?:\.\d+)?")


def points(d: str) -> List[Tuple[float, float]]:
    nums = [float(n) for n in NUM_RE.findall(d)]
    return [(nums[i], nums[i + 1]) for i in range(0, len(nums) - 1, 2)]


def centroid(pts: List[Tuple[float, float]]) -> Tuple[float, float]:
    xs = [p[0] for p in pts]; ys = [p[1] for p in pts]
    return ((min(xs) + max(xs)) / 2, (min(ys) + max(ys)) / 2)


def fingerprint(d: str) -> Tuple[int, int, int, int]:
    nums = [float(n) for n in NUM_RE.findall(d)[:4]]
    while len(nums) < 4:
        nums.append(0.0)
    return (round(nums[0]), round(nums[1]), round(nums[2]), round(nums[3]))


# ---------------------------------------------------------------------------
# Parse Karte.svg (authoritative layer ↔ path-d map)
# ---------------------------------------------------------------------------

orig_text = ORIG.read_text(encoding="utf-8")
LAYER_RE = re.compile(r'vectornator:layerName="([^"]*)"')
D_RE     = re.compile(r'\bd="([^"]*)"')
PATH_RE  = re.compile(r'<path\b[^>]*/>')

orig_fp_to_tid: Dict[tuple, str] = {}
for tag in PATH_RE.findall(orig_text):
    ml = LAYER_RE.search(tag)
    md = D_RE.search(tag)
    if not ml or not md:
        continue
    if ml.group(1) == "Neutral":
        continue
    orig_fp_to_tid[fingerprint(md.group(1))] = ml.group(1).lower()

print(f"Karte.svg: {len(orig_fp_to_tid)} territory fingerprints loaded.")

# ---------------------------------------------------------------------------
# Load current SVG
# ---------------------------------------------------------------------------

svg = CURR.read_text(encoding="utf-8")

# Split into pre-groups / groups / post chunks by finding closing </svg>.
# We identify groups by id and replace their contents.

def find_group(src: str, gid: str) -> Tuple[int, int, str]:
    """Return (start, end, content) of the <g id="gid"> block including tags."""
    m = re.search(rf'<g\b[^>]*\bid="{re.escape(gid)}"[^>]*>', src)
    if not m:
        return -1, -1, ""
    start = m.start()
    depth = 0
    i = start
    n = len(src)
    tag_re = re.compile(r'<(/?)g\b[^>]*?>')
    while i < n:
        tm = tag_re.search(src, i)
        if not tm:
            break
        if tm.group(1) == "":
            depth += 1
        else:
            depth -= 1
            if depth == 0:
                return start, tm.end(), src[start:tm.end()]
        i = tm.end()
    return -1, -1, ""

# ---------------------------------------------------------------------------
# 1. Annotate sea + land paths with territory ids
# ---------------------------------------------------------------------------

centroids: Dict[str, Tuple[float, float]] = {}

def annotate_path(tag: str, kind: str) -> str:
    """kind is 'sea' or 'coast'/'land' (will refine)."""
    md = D_RE.search(tag)
    if not md:
        return tag
    d = md.group(1)
    tid = orig_fp_to_tid.get(fingerprint(d))
    if not tid:
        return tag  # couldn't match — leave unchanged
    pts = points(d)
    if pts:
        centroids[tid] = centroid(pts)
    name = TERRITORY_NAMES.get(tid, tid.upper())

    if tid in SEAS:
        cls = "territory sea"
        ttype = "sea"
    elif tid in INLAND:
        cls = "territory land"
        ttype = "land"
    else:
        cls = "territory coast"
        ttype = "coast"

    owner = HOME_OWNER.get(tid)
    is_sc = (owner is not None) or (tid in NEUTRAL_SCS)
    extras = [
        f'id="{tid}"',
        f'class="{cls}"',
        f'data-territory="{tid}"',
        f'data-type="{ttype}"',
        f'data-name="{name}"',
        f'data-sc="{str(is_sc).lower()}"',
    ]
    if owner:
        extras.append(f'data-nation="{owner}"')
    if tid in DUAL_COASTS:
        extras.append(f'data-dual-coast="true"')

    # Remove old vectornator attribute and any stale id
    tag = re.sub(r' vectornator:layerName="[^"]*"', "", tag)
    tag = re.sub(r' id="[^"]*"', "", tag)
    tag = re.sub(r' class="[^"]*"', "", tag)

    # Insert new attributes right after "<path"
    return tag.replace("<path", "<path " + " ".join(extras), 1)


def retag_group(src: str, gid: str, kind: str) -> str:
    s, e, content = find_group(src, gid)
    if s < 0:
        return src
    def _sub(m):
        return annotate_path(m.group(0), kind)
    new_content = re.sub(r'<path\b[^/]*/>', _sub, content)
    return src[:s] + new_content + src[e:]

svg = retag_group(svg, "seas",  "sea")
svg = retag_group(svg, "lands", "coast")

print(f"Centroids captured: {len(centroids)}")

# ---------------------------------------------------------------------------
# 2. Remove the nation-tints group completely
# ---------------------------------------------------------------------------

s, e, _ = find_group(svg, "nation-tints")
if s >= 0:
    svg = svg[:s] + "<!-- nation-tints removed: all lands now share the beige base -->\n" + svg[e:]

# ---------------------------------------------------------------------------
# 3. Schweiz: visible beige with thicker border, non-clickable
# ---------------------------------------------------------------------------

s, e, content = find_group(svg, "Schweiz")
if s >= 0:
    # Replace fill + stroke on the internal path(s)
    new_content = re.sub(
        r'<path\b[^/]*/>',
        lambda m: (m.group(0)
                   .replace('stroke="none"', 'stroke="#3E2510" stroke-width="2.4"')
                   .replace("<path", '<path id="che" class="switzerland" '
                                     'data-territory="che" data-name="Switzerland" '
                                     'pointer-events="none"', 1)),
        content,
    )
    # Wrap with pointer-events none on the group too
    new_content = new_content.replace(
        '<g id="Schweiz"',
        '<g id="Schweiz" pointer-events="none"',
        1,
    )
    svg = svg[:s] + new_content + svg[e:]

# ---------------------------------------------------------------------------
# 3b. Compute label bboxes so SC markers sit right next to the label text
# ---------------------------------------------------------------------------

label_centers: Dict[str, Tuple[float, float, float, float]] = {}
ls, le, label_content = find_group(svg, "labels")
if ls >= 0:
    label_groups = re.findall(
        r'<g[^>]*vectornator:layerName="text"[^>]*>(.*?)</g>',
        label_content, re.DOTALL,
    )
    for inner in label_groups:
        nums = [float(n) for n in NUM_RE.findall(inner)]
        xs = nums[0::2]; ys = nums[1::2]
        if not xs:
            continue
        minx, maxx = min(xs), max(xs)
        miny, maxy = min(ys), max(ys)
        cx, cy = (minx + maxx) / 2, (miny + maxy) / 2
        # Find nearest territory centroid
        best, best_d = None, 1e18
        for tid, (tx, ty) in centroids.items():
            d = (tx - cx) ** 2 + (ty - cy) ** 2
            if d < best_d:
                best_d, best = d, tid
        if best and best not in label_centers:
            label_centers[best] = (minx, miny, maxx, maxy)
print(f"Label bboxes mapped: {len(label_centers)}")


def sc_position(tid: str) -> Tuple[float, float]:
    """Place the SC marker just to the left of the label, vertically centered."""
    if tid in label_centers:
        minx, miny, maxx, maxy = label_centers[tid]
        cy = (miny + maxy) / 2
        return (minx - 8.5, cy)
    # fallback to centroid
    cx, cy = centroids.get(tid, (0, 0))
    return (cx, cy + 10)

# ---------------------------------------------------------------------------
# 4. Supply centers: identify each existing marker by nearest territory
# ---------------------------------------------------------------------------

s, e, sc_content = find_group(svg, "supply-centers")
if s < 0:
    raise RuntimeError("supply-centers group not found")

# Extract existing circles: white ones = neutral, dark ones = home
WHITE_CIRCLE_RE = re.compile(
    r'<path\s+d="M(?P<x1>-?\d+\.?\d*)\s+(?P<y1>-?\d+\.?\d*)[^"]*"\s+fill="#ffffff"[^/]*/>'
)
DARK_CIRCLE_RE = re.compile(
    r'<path\s+d="M(?P<x1>-?\d+\.?\d*)\s+(?P<y1>-?\d+\.?\d*)[^"]*"\s+fill="#1a1a1a"[^/]*/>'
)

def circle_center(m) -> Tuple[float, float]:
    # A Bezier-approximated circle starts with M cx-r cy, so centre is x+r, y
    x = float(m.group("x1"))
    y = float(m.group("y1"))
    # inspect the full match to recover radius from the next "C ..." arc
    all_nums = [float(n) for n in NUM_RE.findall(m.group(0))]
    if len(all_nums) >= 6:
        x_right = all_nums[4]  # end of first arc ~ cx + r
        cx = (x + x_right) / 2
    else:
        cx = x + 3
    cy = y
    return (cx, cy)

home_tids = set(HOME_OWNER.keys())
neutral_tids = set(NEUTRAL_SCS)

# Marker positions are derived directly from each territory's label bbox
home_assignment:    Dict[str, Tuple[float, float]] = {
    tid: sc_position(tid) for tid in home_tids
}
neutral_assignment: Dict[str, Tuple[float, float]] = {
    tid: sc_position(tid) for tid in neutral_tids
}
print(f"SC marker positions derived from labels.")

# Build new supply-centers group
lines = ['<g id="supply-centers" vectornator:layerName="supply-centers">']
lines.append("  <!-- Home supply centers (square) — recolored at runtime to owner nation -->")
for tid, (cx, cy) in sorted(home_assignment.items()):
    owner = HOME_OWNER.get(tid, "")
    lines.append(
        f'  <g class="sc-marker home" data-territory="{tid}" data-sc-type="home"'
        f' data-nation="{owner}" transform="translate({cx:.2f},{cy:.2f})">'
    )
    lines.append(
        '    <rect class="sc-fill" x="-5.5" y="-5.5" width="11" height="11" rx="1.4"'
        ' fill="#C5A55A" stroke="#3E2510" stroke-width="1.2"/>'
    )
    lines.append("  </g>")
lines.append("  <!-- Neutral supply centers (dot + ring) — recolored at runtime -->")
for tid, (cx, cy) in sorted(neutral_assignment.items()):
    lines.append(
        f'  <g class="sc-marker neutral" data-territory="{tid}" data-sc-type="neutral"'
        f' transform="translate({cx:.2f},{cy:.2f})">'
    )
    lines.append(
        '    <circle class="sc-ring" r="6" fill="none" stroke="#3E2510" stroke-width="1.3"/>'
    )
    lines.append(
        '    <circle class="sc-fill" r="3.4" fill="#C5A55A" stroke="#3E2510" stroke-width="0.6"/>'
    )
    lines.append("  </g>")
lines.append("</g>")

svg = svg[:s] + "\n".join(lines) + svg[e:]

# ---------------------------------------------------------------------------
# 5. Dual-coast text groups — wrap each with an invisible hit zone
# ---------------------------------------------------------------------------

# Find the <g id="dual-coasts"> block
s, e, dc_content = find_group(svg, "dual-coasts")
if s >= 0:
    # Identify each inner <g ...vectornator:layerName="text">…</g> block.
    inner_groups = []
    pattern = re.compile(
        r'<g\s+fill="#3e2510"[^>]*vectornator:layerName="text"[^>]*>(.*?)</g>',
        re.DOTALL,
    )
    for m in pattern.finditer(dc_content):
        inner_groups.append(m)

    # Compute bbox for each text group by scanning its glyph paths.
    def glyph_bbox(block: str):
        nums = [float(n) for n in NUM_RE.findall(block)]
        if len(nums) < 2:
            return None
        xs = nums[0::2]; ys = nums[1::2]
        return (min(xs), min(ys), max(xs), max(ys))

    # Assign coast identities by geographic region.
    def classify_coast(cx: float, cy: float) -> Tuple[str, str]:
        # STP area (NE Russia)
        if cx > 700 and cy < 500:
            coast = "nc" if cy < 280 else "sc"
            return ("stp", coast)
        # BUL area (SE Europe)
        if cx > 650 and cy > 750:
            coast = "ec" if cy < 830 else "sc"
            return ("bul", coast)
        # SPA area (SW Europe)
        if cx < 250:
            coast = "nc" if cy < 800 else "sc"
            return ("spa", coast)
        return ("", "")

    new_dc = dc_content
    # Process in reverse so offsets don't shift
    for m in reversed(inner_groups):
        block = m.group(0)
        bbox = glyph_bbox(m.group(1))
        if not bbox:
            continue
        cx, cy = (bbox[0] + bbox[2]) / 2, (bbox[1] + bbox[3]) / 2
        tid, coast = classify_coast(cx, cy)
        if not tid:
            continue
        wrapped = (
            f'<g class="coast-pick" id="{tid}-{coast}" '
            f'data-territory="{tid}" data-coast="{coast}" '
            f'transform="translate(0,0)">\n'
            f'    <circle class="coast-hit" cx="{cx:.2f}" cy="{cy:.2f}" r="12" '
            f'fill="transparent" stroke="none" style="cursor:pointer"/>\n'
            f'    {block}\n'
            f'  </g>'
        )
        new_dc = new_dc[: m.start()] + wrapped + new_dc[m.end():]

    svg = svg[:s] + new_dc + svg[e:]

# ---------------------------------------------------------------------------
# 6. Insert unit-anchors group right before labels
# ---------------------------------------------------------------------------

anchor_lines = ['<g id="unit-anchors" aria-hidden="true" pointer-events="none">']
for tid, (cx, cy) in sorted(centroids.items()):
    is_sea   = tid in SEAS
    is_inland = tid in INLAND
    # Which unit types may appear here:
    allowed = set()
    if is_sea:
        allowed = {"fleet", "sf", "air"}
    elif is_inland:
        allowed = {"army", "sf", "air"}
    else:                                      # coastal land
        allowed = {"army", "fleet", "sf", "air"}

    for unit in ("army", "fleet", "sf", "air"):
        if unit not in allowed:
            continue
        dx, dy = UNIT_OFFSETS[unit]
        anchor_lines.append(
            f'  <circle class="unit-slot" data-territory="{tid}" data-unit="{unit}" '
            f'cx="{cx + dx:.2f}" cy="{cy + dy:.2f}" r="0" '
            f'fill="none" stroke="none"/>'
        )
# Dual-coast additional anchors (fleet-only, positioned at coast text)
DUAL_COAST_POS = {
    ("bul", "ec"): (770, 807),
    ("bul", "sc"): (740, 858),
    ("spa", "nc"): (137, 727),
    ("spa", "sc"): (109, 884),
    ("stp", "nc"): (866, 212),
    ("stp", "sc"): (767, 355),
}
for (tid, coast), (cx, cy) in DUAL_COAST_POS.items():
    anchor_lines.append(
        f'  <circle class="unit-slot" data-territory="{tid}" data-coast="{coast}" '
        f'data-unit="fleet" cx="{cx}" cy="{cy}" r="0" fill="none" stroke="none"/>'
    )
anchor_lines.append("</g>")
anchor_block = "\n".join(anchor_lines) + "\n"

# Place before the labels group
s, e, _ = find_group(svg, "labels")
if s < 0:
    svg = svg.replace("</svg>", anchor_block + "</svg>")
else:
    svg = svg[:s] + anchor_block + svg[s:]

# ---------------------------------------------------------------------------
# 7. Inject base stylesheet (runtime hooks + Switzerland + pointer-events)
# ---------------------------------------------------------------------------

style_block = """<style id="map-base-styles"><![CDATA[
  .territory { cursor: pointer; transition: filter 160ms ease; }
  .territory:hover { filter: brightness(1.06) saturate(1.05); }
  .territory.selected { stroke: #C5A55A; stroke-width: 2.4; }
  .switzerland { pointer-events: none; }
  .sc-marker, .sc-marker * { pointer-events: none; }
  .coast-pick { pointer-events: auto; }
  .coast-pick:hover .coast-hit { fill: rgba(197,165,90,0.25); }
  .unit-slot { pointer-events: none; }
  .labels, .labels * { pointer-events: none; }
  .hide-labels .labels { display: none; }
]]></style>
"""
# Insert right after the opening <svg ...> tag (once)
if 'id="map-base-styles"' not in svg:
    svg = re.sub(r'(<svg\b[^>]*>)', r'\1\n' + style_block, svg, count=1)

OUT.write_text(svg, encoding="utf-8")

# ---------------------------------------------------------------------------
# 8. Build a companion preview SVG showing every unit anchor as a shape
#    army  = circle
#    fleet = triangle
#    sf    = dashed circle with translucent fill
#    air   = pentagon
# ---------------------------------------------------------------------------
import math

PREVIEW = ROOT / "Design System" / "diplomacy-map-units-preview.svg"

UNIT_STYLES = {
    # fill, stroke, stroke-width
    "army":  ("#C0392B", "#3E2510", 1.2),
    "fleet": ("#2C3E6B", "#3E2510", 1.2),
    "sf":    ("rgba(241,196,15,0.35)", "#8A6F1A", 1.2),
    "air":   ("#1ABC9C", "#3E2510", 1.2),
}


def shape_markup(unit: str, cx: float, cy: float, tid: str,
                 coast: str | None = None) -> str:
    fill, stroke, sw = UNIT_STYLES[unit]
    attrs = (f'class="unit unit-{unit}" data-territory="{tid}" '
             f'data-unit="{unit}"'
             + (f' data-coast="{coast}"' if coast else ""))
    r = 7
    if unit == "army":
        return (f'<circle {attrs} cx="{cx:.2f}" cy="{cy:.2f}" r="{r}" '
                f'fill="{fill}" stroke="{stroke}" stroke-width="{sw}"/>')
    if unit == "fleet":
        # equilateral triangle pointing up
        h = r * 1.15
        p1 = (cx,        cy - h)
        p2 = (cx - h,    cy + h * 0.7)
        p3 = (cx + h,    cy + h * 0.7)
        pts = f"{p1[0]:.2f},{p1[1]:.2f} {p2[0]:.2f},{p2[1]:.2f} {p3[0]:.2f},{p3[1]:.2f}"
        return (f'<polygon {attrs} points="{pts}" '
                f'fill="{fill}" stroke="{stroke}" stroke-width="{sw}"/>')
    if unit == "sf":
        return (f'<circle {attrs} cx="{cx:.2f}" cy="{cy:.2f}" r="{r}" '
                f'fill="{fill}" stroke="{stroke}" stroke-width="{sw}" '
                f'stroke-dasharray="2.5 1.8"/>')
    if unit == "air":
        # regular pentagon, point up
        pts = []
        for k in range(5):
            ang = -math.pi / 2 + k * (2 * math.pi / 5)
            pts.append(f"{cx + r * math.cos(ang):.2f},{cy + r * math.sin(ang):.2f}")
        return (f'<polygon {attrs} points="{" ".join(pts)}" '
                f'fill="{fill}" stroke="{stroke}" stroke-width="{sw}"/>')
    return ""


# Build preview by taking the main SVG and inserting a visible units layer
preview = svg

# Replace the hidden unit-anchors group with a visible units group
us, ue, _ = find_group(preview, "unit-anchors")
if us >= 0:
    lines = ['<g id="unit-anchors" aria-label="All unit slots (preview)">']
    for tid, (cx, cy) in sorted(centroids.items()):
        is_sea    = tid in SEAS
        is_inland = tid in INLAND
        if is_sea:
            allowed = ("fleet", "sf", "air")
        elif is_inland:
            allowed = ("army", "sf", "air")
        else:
            allowed = ("army", "fleet", "sf", "air")
        for unit in allowed:
            dx, dy = UNIT_OFFSETS[unit]
            lines.append("  " + shape_markup(unit, cx + dx, cy + dy, tid))
    for (tid, coast), (cx, cy) in DUAL_COAST_POS.items():
        lines.append("  " + shape_markup("fleet", cx, cy, tid, coast=coast))
    lines.append("</g>")
    preview = preview[:us] + "\n".join(lines) + preview[ue:]

# Swap the preview title for clarity
preview = preview.replace(
    'aria-label="Diplomacy Europe board"',
    'aria-label="Diplomacy Europe board (unit preview)"',
    1,
)
# Add a legend in the top-right corner
legend = """<g id="unit-legend" transform="translate(900,20)" font-family="Inter,sans-serif" font-size="11">
  <rect x="-6" y="-6" width="220" height="118" rx="6" fill="rgba(244,232,193,0.92)" stroke="#3E2510"/>
  <text x="6" y="10" font-weight="700" fill="#3E2510">Unit preview</text>
  <circle cx="14" cy="32" r="7" fill="#C0392B" stroke="#3E2510" stroke-width="1.2"/>
  <text x="30" y="36" fill="#3E2510">Army</text>
  <polygon points="14,22 6,40 22,40" fill="#2C3E6B" stroke="#3E2510" stroke-width="1.2" transform="translate(0,22)"/>
  <text x="30" y="60" fill="#3E2510">Fleet</text>
  <circle cx="14" cy="80" r="7" fill="rgba(241,196,15,0.35)" stroke="#8A6F1A" stroke-width="1.2" stroke-dasharray="2.5 1.8"/>
  <text x="30" y="84" fill="#3E2510">Special forces (SF)</text>
  <polygon points="14,94 7.35,98.85 9.89,106.65 18.11,106.65 20.65,98.85"
           fill="#1ABC9C" stroke="#3E2510" stroke-width="1.2"/>
  <text x="30" y="108" fill="#3E2510">Air</text>
</g>
"""
preview = preview.replace("</svg>", legend + "</svg>", 1)

PREVIEW.write_text(preview, encoding="utf-8")
print(f"Wrote preview: {PREVIEW}")

# ---------------------------------------------------------------------------
# Report
# ---------------------------------------------------------------------------
print(f"Home SCs assigned:    {len(home_assignment)}/{len(home_tids)}")
print(f"Neutral SCs assigned: {len(neutral_assignment)}/{len(neutral_tids)}")
missing_home    = home_tids    - set(home_assignment.keys())
missing_neutral = neutral_tids - set(neutral_assignment.keys())
if missing_home:    print(f"  !! missing home:    {sorted(missing_home)}")
if missing_neutral: print(f"  !! missing neutral: {sorted(missing_neutral)}")
print(f"Territories w/ centroid: {len(centroids)}")
print(f"Wrote: {OUT}")
