#!/usr/bin/env python3
"""
compute_placements.py — geometry-aware placement solver.

For every territory, calculate:
  - one supply-center position (if the territory is an SC)
  - one anchor per allowed unit type (army / fleet / sf / air)
  - two fleet anchors for dual-coast territories (bul, spa, stp)

Constraints honored:
  - only units that are actually allowed in that territory are placed
  - fleet anchors lie close to the sea-bordering polygon edges
  - dual-coast territories get two fleet anchors on the geographically
    correct sea (bul.ec -> Black, bul.sc -> Aegean, etc.)
  - every object keeps >= MARGIN_EDGE to the polygon border
  - every object keeps >= MIN_SPACING to every other object in the same
    territory and to the label bounding box
  - SC markers are placed near the label (above/below/left/right — whichever
    side has the most free room)
  - a deterministic pseudo-random jitter spreads the anchors so the board
    does not look grid-printed

Outputs
  Design System/placements.json                      — machine-readable data
  Design System/diplomacy-map-placements-preview.svg — visual preview
"""

from __future__ import annotations

import json
import math
import random
import re
from pathlib import Path
from typing import Dict, List, Tuple, Optional

# ---------------------------------------------------------------------------
# Paths & tuning parameters
# ---------------------------------------------------------------------------

ROOT       = Path(r"C:\Users\leons\Downloads\Diplomacy 2.0")
KARTE      = Path(r"C:\Users\leons\Downloads\Karte.svg")
MAP_SVG    = ROOT / "Design System" / "diplomacy-map.svg"
OUT_JSON   = ROOT / "Design System" / "placements.json"
OUT_PREVIEW = ROOT / "Design System" / "diplomacy-map-placements-preview.svg"

MARGIN_EDGE        = 14.0  # min distance any object must have to polygon border
MIN_SPACING        = 22.0  # min distance between two objects inside a territory
LABEL_PAD          = 5.0   # extra breathing room around label bounding box
SC_TO_LABEL_MAX    = 40.0  # max distance from SC to label centre
SEA_EDGE_THRESHOLD = 4.0   # an edge is "coastal" if its midpoint is within this px of a sea polygon
GRID_STEP          = 5     # candidate grid resolution
RNG_SEED           = 1901

random.seed(RNG_SEED)

# ---------------------------------------------------------------------------
# Domain
# ---------------------------------------------------------------------------

SEAS = {
    "nao", "nwg", "bar", "nth", "ska", "hel", "eng", "iri", "mao",
    "bal", "bot", "lyo", "wes", "tys", "adr", "ion", "aeg", "eas", "bla",
}
INLAND = {
    "par", "bur", "ruh", "mun", "sil", "boh", "tyr",
    "vie", "bud", "gal", "ser", "mos", "war", "ukr",
}
HOME = {
    "austria":  ["vie", "bud", "tri"],
    "england":  ["lon", "lvp", "edi"],
    "france":   ["par", "mar", "bre"],
    "germany":  ["ber", "mun", "kie"],
    "italy":    ["rom", "nap", "ven"],
    "russia":   ["mos", "war", "sev", "stp"],
    "turkey":   ["con", "smy", "ank"],
}
HOME_OWNER = {t: n for n, ts in HOME.items() for t in ts}
NEUTRAL_SCS = {
    "bel", "bul", "den", "gre", "hol", "nwy",
    "por", "rum", "ser", "spa", "swe", "tun",
}
# dual-coast territory -> {coast_code: adjacent sea tid}
DUAL_COASTS = {
    "bul": {"ec": "bla", "sc": "aeg"},
    "spa": {"nc": "mao", "sc": "wes"},
    "stp": {"nc": "bar", "sc": "bot"},
}

# ---------------------------------------------------------------------------
# Geometry helpers
# ---------------------------------------------------------------------------

NUM_RE = re.compile(r"-?\d+(?:\.\d+)?")


def parse_polygon(d: str) -> List[Tuple[float, float]]:
    nums = [float(n) for n in NUM_RE.findall(d)]
    return [(nums[i], nums[i + 1]) for i in range(0, len(nums) - 1, 2)]


def bbox(poly):
    xs = [p[0] for p in poly]; ys = [p[1] for p in poly]
    return min(xs), min(ys), max(xs), max(ys)


def point_in_polygon(pt, poly) -> bool:
    x, y = pt
    inside = False
    j = len(poly) - 1
    for i in range(len(poly)):
        xi, yi = poly[i]; xj, yj = poly[j]
        if ((yi > y) != (yj > y)) and \
           (x < (xj - xi) * (y - yi) / ((yj - yi) or 1e-12) + xi):
            inside = not inside
        j = i
    return inside


def dist_point_segment(p, a, b) -> float:
    px, py = p; ax, ay = a; bx, by = b
    dx, dy = bx - ax, by - ay
    l2 = dx * dx + dy * dy
    if l2 == 0:
        return math.hypot(px - ax, py - ay)
    t = max(0.0, min(1.0, ((px - ax) * dx + (py - ay) * dy) / l2))
    qx = ax + t * dx; qy = ay + t * dy
    return math.hypot(px - qx, py - qy)


def dist_to_polygon_edge(pt, poly) -> float:
    return min(dist_point_segment(pt, poly[i - 1], poly[i]) for i in range(len(poly)))


def candidates_in_polygon(poly, margin=MARGIN_EDGE, step=GRID_STEP):
    minx, miny, maxx, maxy = bbox(poly)
    out = []
    y = miny + margin
    while y <= maxy - margin:
        x = minx + margin
        while x <= maxx - margin:
            pt = (x, y)
            if point_in_polygon(pt, poly) and dist_to_polygon_edge(pt, poly) >= margin:
                out.append(pt)
            x += step
        y += step
    return out


# ---------------------------------------------------------------------------
# Parse Karte.svg — authoritative polygons
# ---------------------------------------------------------------------------

def parse_karte() -> Dict[str, List[Tuple[float, float]]]:
    text = KARTE.read_text(encoding="utf-8")
    polys: Dict[str, List[Tuple[float, float]]] = {}
    layer_re = re.compile(r'vectornator:layerName="([^"]*)"')
    d_re     = re.compile(r'\bd="([^"]*)"')
    for tag in re.findall(r'<path\b[^>]*/>', text):
        ml = layer_re.search(tag); md = d_re.search(tag)
        if not ml or not md:
            continue
        name = ml.group(1)
        if name == "Neutral":
            continue
        tid = name.lower()
        if tid in polys:
            continue  # keep first
        polys[tid] = parse_polygon(md.group(1))
    return polys


def coastal_edges_per_sea(land_poly, sea_polys: Dict[str, List]):
    """List of (edge, sea_tid) — edges whose midpoint is close to a sea polygon."""
    out = []
    for i in range(len(land_poly)):
        a = land_poly[i - 1]; b = land_poly[i]
        mid = ((a[0] + b[0]) / 2, (a[1] + b[1]) / 2)
        best_sea, best_d = None, SEA_EDGE_THRESHOLD
        for sea_tid, sp in sea_polys.items():
            d = dist_to_polygon_edge(mid, sp)
            if d < best_d:
                best_d, best_sea = d, sea_tid
        if best_sea:
            out.append(((a, b), best_sea))
    return out


# ---------------------------------------------------------------------------
# Parse diplomacy-map.svg — extract label bounding boxes
# ---------------------------------------------------------------------------

def parse_label_bboxes(all_centroids: Dict[str, Tuple[float, float]]) -> Dict[str, Tuple[float, float, float, float]]:
    text = MAP_SVG.read_text(encoding="utf-8")
    m = re.search(r'<g[^>]*\bid="labels"[^>]*>', text)
    if not m:
        return {}
    start = m.end()
    depth = 1
    i = start
    while depth > 0:
        nm = re.search(r'<(/?)g\b[^>]*>', text[i:])
        if not nm:
            break
        if nm.group(1):
            depth -= 1
        else:
            depth += 1
        i += nm.end()
    block = text[start:i]
    groups = re.findall(r'<g[^>]*vectornator:layerName="text"[^>]*>(.*?)</g>',
                        block, re.DOTALL)
    boxes: Dict[str, Tuple[float, float, float, float]] = {}
    for inner in groups:
        nums = [float(n) for n in NUM_RE.findall(inner)]
        xs = nums[0::2]; ys = nums[1::2]
        if not xs:
            continue
        minx, maxx = min(xs), max(xs); miny, maxy = min(ys), max(ys)
        cx, cy = (minx + maxx) / 2, (miny + maxy) / 2
        # match to nearest territory centroid
        best, best_d = None, 1e18
        for tid, (tx, ty) in all_centroids.items():
            d = (tx - cx) ** 2 + (ty - cy) ** 2
            if d < best_d:
                best_d, best = d, tid
        if best and best not in boxes:
            boxes[best] = (minx, miny, maxx, maxy)
    return boxes


# ---------------------------------------------------------------------------
# Placement solver
# ---------------------------------------------------------------------------

def territory_centroid(poly) -> Tuple[float, float]:
    minx, miny, maxx, maxy = bbox(poly)
    return ((minx + maxx) / 2, (miny + maxy) / 2)


def solve_territory(tid: str,
                    poly: List[Tuple[float, float]],
                    label_bb: Optional[Tuple[float, float, float, float]],
                    coast_edges: List) -> Dict[str, Tuple[float, float]]:
    cands = candidates_in_polygon(poly)
    if not cands:
        return {}

    is_sea    = tid in SEAS
    is_inland = tid in INLAND
    is_sc     = (tid in HOME_OWNER) or (tid in NEUTRAL_SCS)
    is_dual   = tid in DUAL_COASTS

    # Slot list ordered by placement priority
    slots: List[str] = []
    if is_sc:
        slots.append("sc")
    if is_sea:
        slots.extend(["fleet", "sf", "air"])
    elif is_inland:
        slots.extend(["army", "sf", "air"])
    else:
        slots.append("army")
        if is_dual:
            for coast in DUAL_COASTS[tid]:
                slots.append(f"fleet:{coast}")
        else:
            slots.append("fleet")
        slots.extend(["sf", "air"])

    if label_bb:
        lmin_x, lmin_y, lmax_x, lmax_y = label_bb
        lcx, lcy = (lmin_x + lmax_x) / 2, (lmin_y + lmax_y) / 2
    else:
        lcx, lcy = territory_centroid(poly)

    placed: Dict[str, Tuple[float, float]] = {}

    def conflicts_label(pt):
        if not label_bb:
            return False
        return (lmin_x - LABEL_PAD <= pt[0] <= lmax_x + LABEL_PAD and
                lmin_y - LABEL_PAD <= pt[1] <= lmax_y + LABEL_PAD)

    def min_dist_to_placed(pt):
        if not placed:
            return 1e9
        return min(math.hypot(pt[0] - p[0], pt[1] - p[1]) for p in placed.values())

    def is_valid(pt):
        return (not conflicts_label(pt)) and min_dist_to_placed(pt) >= MIN_SPACING

    def dist_to_nearest_coast_edge(pt, edges):
        if not edges:
            return 1e9
        return min(dist_point_segment(pt, *e) for e in edges)

    for slot in slots:
        valid = [c for c in cands if is_valid(c)]
        if not valid:
            # Relax MIN_SPACING slightly — can happen for very tiny territories
            valid = [c for c in cands if not conflicts_label(c)
                     and min_dist_to_placed(c) >= MIN_SPACING * 0.75]
        if not valid:
            continue

        if slot == "sc":
            # Prefer candidates closest to label but >= LABEL_PAD away from it
            scored = []
            for c in valid:
                d = math.hypot(c[0] - lcx, c[1] - lcy)
                penalty = abs(d - 22)           # aim for ~22 px from label centre
                if d > SC_TO_LABEL_MAX:
                    penalty += (d - SC_TO_LABEL_MAX) * 2
                scored.append((penalty + random.uniform(0, 3), c))
            scored.sort()
            placed[slot] = scored[0][1]

        elif slot.startswith("fleet"):
            if ":" in slot:
                _, coast = slot.split(":")
                target = DUAL_COASTS[tid][coast]
                edges = [e for e, s in coast_edges if s == target]
                if not edges:  # fallback: any coast
                    edges = [e for e, _ in coast_edges]
            else:
                edges = [e for e, _ in coast_edges]

            scored = []
            for c in valid:
                cd = dist_to_nearest_coast_edge(c, edges)
                # Want small coast distance, but still not too close to border
                penalty = cd + random.uniform(0, 4)
                scored.append((penalty, c))
            scored.sort()
            placed[slot] = scored[0][1]

        elif slot == "army":
            # Push armies toward the interior (far from coast) and scattered
            scored = []
            for c in valid:
                cd = dist_to_nearest_coast_edge(c, [e for e, _ in coast_edges])
                md = min_dist_to_placed(c)
                penalty = -0.7 * md - 0.4 * cd + random.uniform(0, 6)
                scored.append((penalty, c))
            scored.sort()
            placed[slot] = scored[0][1]

        else:  # sf, air — maximize separation from everything placed
            scored = []
            for c in valid:
                md = min_dist_to_placed(c)
                ed = dist_to_polygon_edge(c, poly)
                penalty = -md - 0.2 * ed + random.uniform(0, 8)
                scored.append((penalty, c))
            scored.sort()
            placed[slot] = scored[0][1]

    return placed


# ---------------------------------------------------------------------------
# Drive the solver & emit outputs
# ---------------------------------------------------------------------------

def main() -> None:
    polys = parse_karte()
    print(f"Parsed {len(polys)} territory polygons from Karte.svg")

    sea_polys = {tid: p for tid, p in polys.items() if tid in SEAS}

    centroids = {tid: territory_centroid(p) for tid, p in polys.items()}
    labels = parse_label_bboxes(centroids)
    print(f"Loaded {len(labels)} label bounding boxes")

    placements: Dict[str, Dict[str, Dict[str, float]]] = {}

    for tid, poly in polys.items():
        if tid in SEAS:
            coast_edges = []
        else:
            coast_edges = coastal_edges_per_sea(poly, sea_polys)
        label_bb = labels.get(tid)
        result = solve_territory(tid, poly, label_bb, coast_edges)

        placements[tid] = {
            "type":       "sea" if tid in SEAS else
                          ("inland" if tid in INLAND else "coast"),
            "nation":     HOME_OWNER.get(tid),
            "sc":         tid in HOME_OWNER or tid in NEUTRAL_SCS,
            "dual_coast": tid in DUAL_COASTS,
            "label_bbox": list(label_bb) if label_bb else None,
            "anchors":    {k: {"x": round(v[0], 2), "y": round(v[1], 2)}
                           for k, v in result.items()},
        }

    OUT_JSON.write_text(json.dumps(placements, indent=2), encoding="utf-8")
    print(f"Wrote {OUT_JSON}")

    # ---------- preview SVG ----------
    write_preview_svg(placements)


def write_preview_svg(placements):
    map_text = MAP_SVG.read_text(encoding="utf-8")
    # Find the insertion point (just before </svg>)
    parts: List[str] = [map_text.rstrip().rsplit("</svg>", 1)[0]]
    parts.append('\n<g id="computed-placements" aria-label="Solver output">\n')

    UNIT_STYLES = {
        "army":  dict(fill="#C0392B", stroke="#3E2510", sw=1.2),
        "fleet": dict(fill="#2C3E6B", stroke="#3E2510", sw=1.2),
        "sf":    dict(fill="rgba(241,196,15,0.35)", stroke="#8A6F1A", sw=1.2, dash="2.5 1.8"),
        "air":   dict(fill="#1ABC9C", stroke="#3E2510", sw=1.2),
    }

    for tid, data in placements.items():
        anchors = data["anchors"]
        for slot, pt in anchors.items():
            x, y = pt["x"], pt["y"]
            if slot == "sc":
                if data["nation"]:
                    # home = square
                    parts.append(
                        f'  <rect class="sc home" data-territory="{tid}" '
                        f'data-nation="{data["nation"]}" '
                        f'x="{x-5.5:.2f}" y="{y-5.5:.2f}" width="11" height="11" rx="1.4" '
                        f'fill="#C5A55A" stroke="#3E2510" stroke-width="1.2"/>\n'
                    )
                else:
                    parts.append(
                        f'  <g class="sc neutral" data-territory="{tid}" '
                        f'transform="translate({x:.2f},{y:.2f})">'
                        f'<circle r="6" fill="none" stroke="#3E2510" stroke-width="1.3"/>'
                        f'<circle r="3.4" fill="#C5A55A" stroke="#3E2510" stroke-width="0.6"/>'
                        f'</g>\n'
                    )
                continue

            unit = slot.split(":")[0]
            coast = slot.split(":")[1] if ":" in slot else None
            style = UNIT_STYLES[unit]
            base_attrs = (f'class="unit unit-{unit}" data-territory="{tid}" '
                          f'data-unit="{unit}"'
                          + (f' data-coast="{coast}"' if coast else ""))
            r = 7
            if unit == "army":
                parts.append(
                    f'  <circle {base_attrs} cx="{x:.2f}" cy="{y:.2f}" r="{r}" '
                    f'fill="{style["fill"]}" stroke="{style["stroke"]}" '
                    f'stroke-width="{style["sw"]}"/>\n'
                )
            elif unit == "fleet":
                h = r * 1.15
                p1 = (x, y - h)
                p2 = (x - h, y + h * 0.7)
                p3 = (x + h, y + h * 0.7)
                pts = f"{p1[0]:.2f},{p1[1]:.2f} {p2[0]:.2f},{p2[1]:.2f} {p3[0]:.2f},{p3[1]:.2f}"
                parts.append(
                    f'  <polygon {base_attrs} points="{pts}" '
                    f'fill="{style["fill"]}" stroke="{style["stroke"]}" '
                    f'stroke-width="{style["sw"]}"/>\n'
                )
            elif unit == "sf":
                parts.append(
                    f'  <circle {base_attrs} cx="{x:.2f}" cy="{y:.2f}" r="{r}" '
                    f'fill="{style["fill"]}" stroke="{style["stroke"]}" '
                    f'stroke-width="{style["sw"]}" '
                    f'stroke-dasharray="{style["dash"]}"/>\n'
                )
            elif unit == "air":
                pts = []
                for k in range(5):
                    ang = -math.pi / 2 + k * (2 * math.pi / 5)
                    pts.append(f"{x + r*math.cos(ang):.2f},{y + r*math.sin(ang):.2f}")
                parts.append(
                    f'  <polygon {base_attrs} points="{" ".join(pts)}" '
                    f'fill="{style["fill"]}" stroke="{style["stroke"]}" '
                    f'stroke-width="{style["sw"]}"/>\n'
                )

    # Legend
    parts.append("""<g id="unit-legend" transform="translate(900,20)"
    font-family="Inter,sans-serif" font-size="11">
  <rect x="-6" y="-6" width="220" height="132" rx="6"
        fill="rgba(244,232,193,0.92)" stroke="#3E2510"/>
  <text x="6" y="10" font-weight="700" fill="#3E2510">Computed placements</text>
  <rect x="7" y="18" width="11" height="11" rx="1.4" fill="#C5A55A" stroke="#3E2510" stroke-width="1.2"/>
  <text x="30" y="28" fill="#3E2510">Home SC (square)</text>
  <g transform="translate(14,44)"><circle r="6" fill="none" stroke="#3E2510" stroke-width="1.3"/><circle r="3.4" fill="#C5A55A" stroke="#3E2510" stroke-width="0.6"/></g>
  <text x="30" y="48" fill="#3E2510">Neutral SC</text>
  <circle cx="14" cy="68" r="7" fill="#C0392B" stroke="#3E2510" stroke-width="1.2"/>
  <text x="30" y="72" fill="#3E2510">Army</text>
  <polygon points="14,82 6,100 22,100" fill="#2C3E6B" stroke="#3E2510" stroke-width="1.2"/>
  <text x="30" y="96" fill="#3E2510">Fleet</text>
  <circle cx="14" cy="116" r="7" fill="rgba(241,196,15,0.35)" stroke="#8A6F1A" stroke-width="1.2" stroke-dasharray="2.5 1.8"/>
  <text x="30" y="120" fill="#3E2510">SF / Air (pentagon)</text>
</g>
""")
    parts.append("</g>\n</svg>")
    OUT_PREVIEW.write_text("".join(parts), encoding="utf-8")

    # Summary
    totals = {"army": 0, "fleet": 0, "sf": 0, "air": 0, "sc": 0}
    for d in placements.values():
        for slot in d["anchors"]:
            key = slot.split(":")[0]
            if key in totals:
                totals[key] += 1
    print(f"Wrote {OUT_PREVIEW}")
    print(f"Object counts: {totals}")


if __name__ == "__main__":
    main()
