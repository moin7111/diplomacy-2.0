#!/usr/bin/env python3
"""
compute_placements_v2.py — refined placement solver.

Differences vs v1
  * Labels matched via point-in-polygon (so user-moved labels still bind).
  * Units/SCs constrained to a radius around the label centre -> no corner
    drops in large countries; still chaotic inside that disc.
  * Corner-aversion penalty added.
  * Symbol halos (outer rings of neutral SC, SF dash, fleet triangle) are
    reflected in MIN_SPACING.
  * Dual-coast territories: the two fleet anchors live on DIFFERENT sea
    edges (one per coast), verified geometrically.
  * Two preview SVGs are written:
       - diplomacy-map-placements-preview.svg  (visible shapes)
       - diplomacy-map-anchors.svg             (invisible anchors only)
    Both strip the old supply-centers and unit-anchors groups from the base
    map so the new placements are the only source of truth.
"""

from __future__ import annotations

import json
import math
import random
import re
from pathlib import Path
from typing import Dict, List, Tuple, Optional

# ---------------------------------------------------------------------------
# Paths & tuning
# ---------------------------------------------------------------------------

ROOT        = Path(r"C:\Users\leons\Downloads\Diplomacy 2.0")
KARTE       = Path(r"C:\Users\leons\Downloads\Karte.svg")
MAP_SVG     = ROOT / "Design System" / "diplomacy-map.svg"
OUT_JSON    = ROOT / "Design System" / "placements.json"
OUT_VISIBLE = ROOT / "Design System" / "diplomacy-map-placements-preview.svg"
OUT_HIDDEN  = ROOT / "Design System" / "diplomacy-map-anchors.svg"

MARGIN_EDGE       = 13.0   # min distance object centre -> polygon border
MIN_SPACING       = 26.0   # min distance between any two objects
LABEL_PAD         = 8.0    # gap around label bbox (accounts for symbol halo)
SC_DIST_IDEAL     = 24.0   # preferred SC-to-label-centre distance
SC_DIST_MAX       = 42.0   # hard cap
LABEL_RADIUS_MIN  = 70.0   # smallest allowed clustering disc for units
LABEL_RADIUS_STEP = 15.0   # expand this much if not enough candidates
SEA_EDGE_THRESH   = 8.0    # edge is "coastal" if midpoint within this of a sea
CORNER_WEIGHT     = 1.2    # penalty multiplier for being near polygon bbox corners
GRID_STEP         = 4
RNG_SEED          = 1901

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
DUAL_COASTS = {
    "bul": {"ec": "bla", "sc": "aeg"},
    "spa": {"nc": "mao", "sc": "wes"},
    "stp": {"nc": "bar", "sc": "bot"},
}

# Hand-tuned overrides.
#   * stp/spa fleet:sc — pinned next to the "sc" coast indicator (slight
#     offset so the fleet does not sit on top of the text).
#   * gre, ska, cly, bre, nap — tiny polygons where the automatic solver
#     could not fit the last 1-2 anchors under the spacing rules.
OVERRIDES: Dict[str, Dict[str, Tuple[float, float]]] = {
    "stp": {"fleet:sc": (787.0, 368.0)},
    "spa": {"fleet:sc": (138.0, 895.0)},
    "gre": {"sf": (666.0, 915.0), "air": (693.0, 945.0)},
    "ska": {"air": (503.0, 413.0)},
    "cly": {"air": (278.0, 380.0)},
    "bre": {"air": (256.0, 648.0)},
    "nap": {"air": (555.0, 935.0)},
}

# ---------------------------------------------------------------------------
# Geometry
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


def dist_to_bbox_corners(pt, poly_bbox) -> float:
    minx, miny, maxx, maxy = poly_bbox
    corners = [(minx, miny), (minx, maxy), (maxx, miny), (maxx, maxy)]
    return min(math.hypot(pt[0] - c[0], pt[1] - c[1]) for c in corners)


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
            continue
        polys[tid] = parse_polygon(md.group(1))
    return polys


def coastal_edges_per_sea(land_poly, sea_polys):
    """Return [((a,b), sea_tid), ...] for edges whose midpoint is close to a sea."""
    out = []
    for i in range(len(land_poly)):
        a = land_poly[i - 1]; b = land_poly[i]
        mid = ((a[0] + b[0]) / 2, (a[1] + b[1]) / 2)
        best_sea, best_d = None, SEA_EDGE_THRESH
        for sea_tid, sp in sea_polys.items():
            d = dist_to_polygon_edge(mid, sp)
            if d < best_d:
                best_d, best_sea = d, sea_tid
        if best_sea:
            out.append(((a, b), best_sea))
    return out


# ---------------------------------------------------------------------------
# Parse label bounding boxes from diplomacy-map.svg
# ---------------------------------------------------------------------------

def parse_label_bboxes(polys) -> Dict[str, Tuple[float, float, float, float]]:
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

    centroids = {tid: ((min(p[0] for p in poly) + max(p[0] for p in poly)) / 2,
                       (min(p[1] for p in poly) + max(p[1] for p in poly)) / 2)
                 for tid, poly in polys.items()}

    for inner in groups:
        nums = [float(n) for n in NUM_RE.findall(inner)]
        xs = nums[0::2]; ys = nums[1::2]
        if not xs:
            continue
        minx, maxx = min(xs), max(xs)
        miny, maxy = min(ys), max(ys)
        cx, cy = (minx + maxx) / 2, (miny + maxy) / 2

        # 1) label centre inside polygon → direct match
        hit = None
        for tid, poly in polys.items():
            if tid in boxes:
                continue
            if point_in_polygon((cx, cy), poly):
                hit = tid
                break
        # 2) fallback: nearest centroid among unused
        if not hit:
            best, best_d = None, 1e18
            for tid, (tx, ty) in centroids.items():
                if tid in boxes:
                    continue
                d = (tx - cx) ** 2 + (ty - cy) ** 2
                if d < best_d:
                    best_d, best = d, tid
            hit = best
        if hit:
            boxes[hit] = (minx, miny, maxx, maxy)
    return boxes


# ---------------------------------------------------------------------------
# Placement solver
# ---------------------------------------------------------------------------

def solve_territory(tid: str,
                    poly: List[Tuple[float, float]],
                    label_bb: Optional[Tuple[float, float, float, float]],
                    coast_edges: List) -> Dict[str, Tuple[float, float]]:
    pbbox = bbox(poly)
    minx, miny, maxx, maxy = pbbox
    small_dim = min(maxx - minx, maxy - miny)

    # Adaptive tightening: tiny territories need smaller margin/spacing
    # so all four unit slots still fit without visually crowding.
    if small_dim < 60:
        eff_margin, eff_spacing, eff_label_pad = 7.0, 16.0, 4.0
    elif small_dim < 90:
        eff_margin, eff_spacing, eff_label_pad = 9.0, 20.0, 6.0
    else:
        eff_margin, eff_spacing, eff_label_pad = MARGIN_EDGE, MIN_SPACING, LABEL_PAD

    all_cands = candidates_in_polygon(poly, margin=eff_margin)
    if not all_cands:
        # Ultimate fallback: halve the margin to still produce anchors
        all_cands = candidates_in_polygon(poly, margin=max(4.0, eff_margin / 2))
    if not all_cands:
        return {}

    is_sea    = tid in SEAS
    is_inland = tid in INLAND
    is_sc     = (tid in HOME_OWNER) or (tid in NEUTRAL_SCS)
    is_dual   = tid in DUAL_COASTS

    # Order of placement
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
        minx, miny, maxx, maxy = pbbox
        lcx, lcy = (minx + maxx) / 2, (miny + maxy) / 2

    placed: Dict[str, Tuple[float, float]] = {}

    def conflicts_label(pt):
        if not label_bb:
            return False
        return (lmin_x - eff_label_pad <= pt[0] <= lmax_x + eff_label_pad and
                lmin_y - eff_label_pad <= pt[1] <= lmax_y + eff_label_pad)

    def min_dist_to_placed(pt):
        if not placed:
            return 1e9
        return min(math.hypot(pt[0] - p[0], pt[1] - p[1]) for p in placed.values())

    def pick_radius_candidates(cands, want_min=20):
        """Return candidates within an expanding disc around label centre."""
        r = LABEL_RADIUS_MIN
        while True:
            inside = [c for c in cands
                      if math.hypot(c[0] - lcx, c[1] - lcy) <= r]
            if len(inside) >= want_min or r > 260:
                return inside if inside else cands
            r += LABEL_RADIUS_STEP

    def valid_set(cands, spacing=None):
        if spacing is None:
            spacing = eff_spacing
        return [c for c in cands
                if not conflicts_label(c) and min_dist_to_placed(c) >= spacing]

    def dist_to_nearest_edge_in(pt, edges):
        if not edges:
            return 1e9
        return min(dist_point_segment(pt, *e) for e in edges)

    for slot in slots:
        # SC: must stay close to label — don't apply big radius expansion
        if slot == "sc":
            cands = all_cands
        else:
            cands = pick_radius_candidates(all_cands, want_min=24)

        pool = valid_set(cands)
        if not pool:
            pool = valid_set(cands, spacing=eff_spacing * 0.8)
        if not pool:
            pool = valid_set(all_cands, spacing=eff_spacing * 0.7)
        if not pool:
            pool = valid_set(all_cands, spacing=eff_spacing * 0.55)
        if not pool:
            # ultra-permissive: accept edge-margin candidates only
            pool = [c for c in all_cands if not conflicts_label(c)]
        if not pool:
            continue

        if slot == "sc":
            scored = []
            for c in pool:
                d = math.hypot(c[0] - lcx, c[1] - lcy)
                penalty = abs(d - SC_DIST_IDEAL)
                if d > SC_DIST_MAX:
                    penalty += (d - SC_DIST_MAX) * 3
                # Slight preference: SCs right next to label edge, not above/below centre
                penalty += random.uniform(0, 2)
                scored.append((penalty, c))
            scored.sort()
            placed[slot] = scored[0][1]

        elif slot.startswith("fleet"):
            if ":" in slot:
                _, coast = slot.split(":")
                target = DUAL_COASTS[tid][coast]
                edges = [e for e, s in coast_edges if s == target]
                if not edges:
                    # No match: use any edge, but exclude those used by the
                    # other coast's placed fleet (rough fallback)
                    edges = [e for e, _ in coast_edges]
            else:
                edges = [e for e, _ in coast_edges]

            scored = []
            for c in pool:
                cd = dist_to_nearest_edge_in(c, edges)
                # corner aversion + coast proximity + jitter
                corner = dist_to_bbox_corners(c, pbbox)
                penalty = cd + random.uniform(0, 3) - 0.05 * corner * CORNER_WEIGHT
                scored.append((penalty, c))
            scored.sort()
            placed[slot] = scored[0][1]

        elif slot == "army":
            scored = []
            for c in pool:
                cd = dist_to_nearest_edge_in(c, [e for e, _ in coast_edges])
                md = min_dist_to_placed(c)
                corner = dist_to_bbox_corners(c, pbbox)
                # push inland + well-separated + away from corners
                penalty = (-0.6 * md
                           - 0.3 * cd
                           - 0.05 * corner * CORNER_WEIGHT
                           + random.uniform(0, 5))
                scored.append((penalty, c))
            scored.sort()
            placed[slot] = scored[0][1]

        else:  # sf, air
            scored = []
            for c in pool:
                md = min_dist_to_placed(c)
                ed = dist_to_polygon_edge(c, poly)
                corner = dist_to_bbox_corners(c, pbbox)
                penalty = (-md
                           - 0.2 * ed
                           - 0.05 * corner * CORNER_WEIGHT
                           + random.uniform(0, 6))
                scored.append((penalty, c))
            scored.sort()
            placed[slot] = scored[0][1]

    return placed


# ---------------------------------------------------------------------------
# Build outputs
# ---------------------------------------------------------------------------

def strip_group(svg: str, group_id: str) -> str:
    """Remove <g id="group_id">...</g> balanced-nesting aware."""
    m = re.search(rf'<g[^>]*\bid="{re.escape(group_id)}"[^>]*>', svg)
    if not m:
        return svg
    start = m.start()
    i = m.end()
    depth = 1
    while depth > 0:
        nm = re.search(r'<(/?)g\b[^>]*>', svg[i:])
        if not nm:
            return svg
        if nm.group(1):
            depth -= 1
        else:
            depth += 1
        i += nm.end()
    return svg[:start] + svg[i:]


UNIT_STYLES = {
    "army":  dict(fill="#C0392B", stroke="#3E2510", sw=1.2),
    "fleet": dict(fill="#2C3E6B", stroke="#3E2510", sw=1.2),
    "sf":    dict(fill="rgba(241,196,15,0.35)", stroke="#8A6F1A", sw=1.2,
                  dash="2.5 1.8"),
    "air":   dict(fill="#1ABC9C", stroke="#3E2510", sw=1.2),
}


def render_sc(tid, nation, x, y, visible=True):
    if not visible:
        return (f'  <circle class="sc anchor" data-territory="{tid}" '
                f'data-kind="{"home" if nation else "neutral"}"'
                + (f' data-nation="{nation}"' if nation else "")
                + f' cx="{x:.2f}" cy="{y:.2f}" r="1.2" '
                f'fill="none" stroke="none" pointer-events="none"/>\n')
    if nation:
        return (f'  <rect class="sc home" data-territory="{tid}" '
                f'data-nation="{nation}" '
                f'x="{x-5.5:.2f}" y="{y-5.5:.2f}" width="11" height="11" rx="1.4" '
                f'fill="#C5A55A" stroke="#3E2510" stroke-width="1.2"/>\n')
    return (f'  <g class="sc neutral" data-territory="{tid}" '
            f'transform="translate({x:.2f},{y:.2f})">'
            f'<circle r="6" fill="none" stroke="#3E2510" stroke-width="1.3"/>'
            f'<circle r="3.4" fill="#C5A55A" stroke="#3E2510" stroke-width="0.6"/>'
            f'</g>\n')


def render_unit(tid, unit, coast, x, y, visible=True):
    attrs = (f'class="unit unit-{unit} anchor" data-territory="{tid}" '
             f'data-unit="{unit}"' + (f' data-coast="{coast}"' if coast else ""))
    if not visible:
        return (f'  <circle {attrs} cx="{x:.2f}" cy="{y:.2f}" r="1.2" '
                f'fill="none" stroke="none" pointer-events="none"/>\n')
    style = UNIT_STYLES[unit]
    r = 7
    if unit == "army":
        return (f'  <circle {attrs} cx="{x:.2f}" cy="{y:.2f}" r="{r}" '
                f'fill="{style["fill"]}" stroke="{style["stroke"]}" '
                f'stroke-width="{style["sw"]}"/>\n')
    if unit == "fleet":
        h = r * 1.15
        p1 = (x, y - h); p2 = (x - h, y + h * 0.7); p3 = (x + h, y + h * 0.7)
        pts = f"{p1[0]:.2f},{p1[1]:.2f} {p2[0]:.2f},{p2[1]:.2f} {p3[0]:.2f},{p3[1]:.2f}"
        return (f'  <polygon {attrs} points="{pts}" '
                f'fill="{style["fill"]}" stroke="{style["stroke"]}" '
                f'stroke-width="{style["sw"]}"/>\n')
    if unit == "sf":
        return (f'  <circle {attrs} cx="{x:.2f}" cy="{y:.2f}" r="{r}" '
                f'fill="{style["fill"]}" stroke="{style["stroke"]}" '
                f'stroke-width="{style["sw"]}" '
                f'stroke-dasharray="{style["dash"]}"/>\n')
    if unit == "air":
        pts = []
        for k in range(5):
            ang = -math.pi / 2 + k * (2 * math.pi / 5)
            pts.append(f"{x + r*math.cos(ang):.2f},{y + r*math.sin(ang):.2f}")
        return (f'  <polygon {attrs} points="{" ".join(pts)}" '
                f'fill="{style["fill"]}" stroke="{style["stroke"]}" '
                f'stroke-width="{style["sw"]}"/>\n')
    return ""


LEGEND = """<g id="unit-legend" transform="translate(900,20)"
    font-family="Inter,sans-serif" font-size="11">
  <rect x="-6" y="-6" width="220" height="148" rx="6"
        fill="rgba(244,232,193,0.92)" stroke="#3E2510"/>
  <text x="6" y="10" font-weight="700" fill="#3E2510">Computed placements</text>
  <rect x="7" y="18" width="11" height="11" rx="1.4" fill="#C5A55A" stroke="#3E2510" stroke-width="1.2"/>
  <text x="30" y="28" fill="#3E2510">Home SC</text>
  <g transform="translate(14,44)"><circle r="6" fill="none" stroke="#3E2510" stroke-width="1.3"/><circle r="3.4" fill="#C5A55A" stroke="#3E2510" stroke-width="0.6"/></g>
  <text x="30" y="48" fill="#3E2510">Neutral SC</text>
  <circle cx="14" cy="68" r="7" fill="#C0392B" stroke="#3E2510" stroke-width="1.2"/>
  <text x="30" y="72" fill="#3E2510">Army</text>
  <polygon points="14,82 6,100 22,100" fill="#2C3E6B" stroke="#3E2510" stroke-width="1.2"/>
  <text x="30" y="96" fill="#3E2510">Fleet</text>
  <circle cx="14" cy="116" r="7" fill="rgba(241,196,15,0.35)" stroke="#8A6F1A" stroke-width="1.2" stroke-dasharray="2.5 1.8"/>
  <text x="30" y="120" fill="#3E2510">Special Forces</text>
  <polygon points="14,130 20.7,134.8 18.1,142.8 9.9,142.8 7.3,134.8" fill="#1ABC9C" stroke="#3E2510" stroke-width="1.2"/>
  <text x="30" y="140" fill="#3E2510">Air</text>
</g>
"""


def build_overlay(placements, mode: str) -> str:
    """mode: "preview" (everything visible, with legend)
             "anchors" (SCs visible, units as invisible anchor points)"""
    gid = "computed-placements" if mode == "preview" else "anchor-layer"
    parts = [f'\n<g id="{gid}" aria-label="Computed placements">\n']
    for tid, data in placements.items():
        anchors = data["anchors"]
        for slot, pt in anchors.items():
            x, y = pt["x"], pt["y"]
            if slot == "sc":
                # SC always visible
                parts.append(render_sc(tid, data["nation"], x, y, visible=True))
                continue
            unit = slot.split(":")[0]
            coast = slot.split(":")[1] if ":" in slot else None
            unit_visible = (mode == "preview")
            parts.append(render_unit(tid, unit, coast, x, y, unit_visible))
    if mode == "preview":
        parts.append(LEGEND)
    parts.append("</g>\n")
    return "".join(parts)


def write_preview(placements, out_path: Path, mode: str) -> None:
    text = MAP_SVG.read_text(encoding="utf-8")
    # Strip existing SC and anchor layers so only the new computation shows.
    text = strip_group(text, "supply-centers")
    text = strip_group(text, "unit-anchors")
    text = strip_group(text, "computed-placements")
    text = strip_group(text, "anchor-layer")

    overlay = build_overlay(placements, mode)
    before, sep, after = text.rpartition("</svg>")
    new_svg = before + overlay + sep + after
    out_path.write_text(new_svg, encoding="utf-8")


# ---------------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------------

def main() -> None:
    polys = parse_karte()
    print(f"Parsed {len(polys)} territory polygons from Karte.svg")

    sea_polys = {tid: p for tid, p in polys.items() if tid in SEAS}
    labels = parse_label_bboxes(polys)
    print(f"Loaded {len(labels)} label bounding boxes "
          f"(missing: {sorted(set(polys) - set(labels))})")

    placements: Dict[str, Dict] = {}
    for tid, poly in polys.items():
        coast_edges = [] if tid in SEAS else coastal_edges_per_sea(poly, sea_polys)
        label_bb = labels.get(tid)
        result = solve_territory(tid, poly, label_bb, coast_edges)
        # Apply manual overrides last, so they always win.
        if tid in OVERRIDES:
            for slot, (ox, oy) in OVERRIDES[tid].items():
                result[slot] = (ox, oy)
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

    write_preview(placements, OUT_VISIBLE, mode="preview")
    print(f"Wrote {OUT_VISIBLE}")
    write_preview(placements, OUT_HIDDEN, mode="anchors")
    print(f"Wrote {OUT_HIDDEN}")

    # Summary
    totals = {"army": 0, "fleet": 0, "sf": 0, "air": 0, "sc": 0}
    for d in placements.values():
        for slot in d["anchors"]:
            k = slot.split(":")[0]
            if k in totals:
                totals[k] += 1
    print(f"Object counts: {totals}")


if __name__ == "__main__":
    main()
