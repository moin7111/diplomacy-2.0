# Territory ID Mapping

_Auto-generated from `Karte.svg` by `tools/build_map.py`._

Centroid coordinates are in the SVG viewBox space (px). The frontend uses the same numbers for positioning unit sprites.

## Land & coastal territories

| ID | Name | Type | SC | Home nation | Centroid (x, y) |
|----|------|------|----|-------------|------------------|
| `alb` | Albania | coast/land |  | — | (633, 863) |
| `ank` | Ankara | coast/land | ✓ | Turkey | (951, 856) |
| `apu` | Apulia | coast/land |  | — | (555, 860) |
| `arm` | Armenia | coast/land |  | — | (1085, 852) |
| `bel` | Belgium | coast/land | ✓ | neutral | (352, 582) |
| `ber` | Berlin | coast/land | ✓ | Germany | (520, 531) |
| `boh` | Bohemia | coast/land |  | — | (546, 626) |
| `bre` | Brest | coast/land | ✓ | France | (232, 623) |
| `bud` | Budapest | coast/land | ✓ | Austria | (665, 703) |
| `bul` | Bulgaria | coast/land | ✓ | neutral | (741, 826) |
| `bur` | Burgundy | coast/land |  | — | (343, 665) |
| `cly` | Clyde | coast/land |  | — | (271, 359) |
| `con` | Constantinople | coast/land | ✓ | Turkey | (816, 875) |
| `den` | Denmark | coast/land | ✓ | neutral | (487, 442) |
| `edi` | Edinburgh | coast/land | ✓ | England | (295, 387) |
| `fin` | Finland | coast/land |  | — | (704, 219) |
| `gal` | Galicia | coast/land |  | — | (676, 646) |
| `gas` | Gascony | coast/land |  | — | (260, 722) |
| `gre` | Greece | coast/land | ✓ | neutral | (681, 923) |
| `hol` | Holland | coast/land | ✓ | neutral | (389, 544) |
| `kie` | Kiel | coast/land | ✓ | Germany | (446, 532) |
| `lon` | London | coast/land | ✓ | England | (302, 523) |
| `lvn` | Livonia | coast/land |  | — | (704, 454) |
| `lvp` | Liverpool | coast/land | ✓ | England | (257, 439) |
| `mar` | Marseilles | coast/land | ✓ | France | (329, 746) |
| `mos` | Moscow | coast/land | ✓ | Russia | (921, 413) |
| `mun` | Munich | coast/land | ✓ | Germany | (463, 625) |
| `naf` | North Africa | coast/land |  | — | (189, 976) |
| `nap` | Naples | coast/land | ✓ | Italy | (542, 902) |
| `nwy` | Norway | coast/land | ✓ | neutral | (583, 219) |
| `par` | Paris | coast/land | ✓ | France | (311, 649) |
| `pic` | Picardy | coast/land |  | — | (316, 594) |
| `pie` | Piedmont | coast/land |  | — | (417, 741) |
| `por` | Portugal | coast/land | ✓ | neutral | (64, 801) |
| `pru` | Prussia | coast/land |  | — | (614, 503) |
| `rom` | Rome | coast/land | ✓ | Italy | (490, 832) |
| `ruh` | Ruhr | coast/land |  | — | (417, 599) |
| `rum` | Rumania | coast/land | ✓ | neutral | (749, 728) |
| `ser` | Serbia | coast/land | ✓ | neutral | (650, 816) |
| `sev` | Sevastopol | coast/land | ✓ | Russia | (961, 668) |
| `sil` | Silesia | coast/land |  | — | (575, 591) |
| `smy` | Smyrna | coast/land | ✓ | Turkey | (913, 921) |
| `spa` | Spain | coast/land | ✓ | neutral | (172, 803) |
| `stp` | St. Petersburg | coast/land | ✓ | Russia | (911, 211) |
| `swe` | Sweden | coast/land | ✓ | neutral | (593, 289) |
| `syr` | Syria | coast/land |  | — | (1057, 961) |
| `tri` | Trieste | coast/land | ✓ | Austria | (570, 772) |
| `tun` | Tunis | coast/land | ✓ | neutral | (402, 997) |
| `tus` | Tuscany | coast/land |  | — | (462, 790) |
| `tyr` | Tyrolia | coast/land |  | — | (493, 697) |
| `ukr` | Ukraine | coast/land |  | — | (795, 617) |
| `ven` | Venice | coast/land | ✓ | Italy | (477, 770) |
| `vie` | Vienna | coast/land | ✓ | Austria | (586, 676) |
| `wal` | Wales | coast/land |  | — | (235, 514) |
| `war` | Warsaw | coast/land | ✓ | Russia | (657, 566) |
| `yor` | Yorkshire | coast/land |  | — | (299, 458) |

## Sea territories

| ID | Name | Centroid (x, y) |
|----|------|------------------|
| `adr` | Adriatic Sea | (553, 812) |
| `aeg` | Aegean Sea | (748, 942) |
| `bal` | Baltic Sea | (570, 456) |
| `bar` | Barents Sea | (839, 110) |
| `bla` | Black Sea | (927, 751) |
| `bot` | Gulf of Bothnia | (675, 306) |
| `eas` | Eastern Mediterranean | (869, 989) |
| `eng` | English Channel | (243, 570) |
| `hel` | Helgoland Bight | (425, 474) |
| `ion` | Ionian Sea | (581, 963) |
| `iri` | Irish Sea | (184, 489) |
| `lyo` | Gulf of Lyon | (324, 813) |
| `mao` | Mid-Atlantic Ocean | (119, 734) |
| `nao` | North Atlantic Ocean | (137, 252) |
| `nth` | North Sea | (375, 419) |
| `nwg` | Norwegian Sea | (476, 180) |
| `ska` | Skagerrak | (487, 402) |
| `tys` | Tyrrhenian Sea | (477, 888) |
| `wes` | Western Mediterranean | (236, 915) |

## Dual coasts

| Territory | Coast | DOM id | Anchors from center |
|-----------|-------|--------|---------------------|
| `bul` | EC | `bul-ec` | (+28, -6) |
| `bul` | SC | `bul-sc` | (-4, +26) |
| `spa` | NC | `spa-nc` | (-10, -22) |
| `spa` | SC | `spa-sc` | (+6, +22) |
| `stp` | NC | `stp-nc` | (-8, -34) |
| `stp` | SC | `stp-sc` | (+2, +30) |

## Supply centers summary

| Nation | Home SCs |
|--------|----------|
| Austria | `vie`, `bud`, `tri` |
| England | `lon`, `lvp`, `edi` |
| France | `par`, `mar`, `bre` |
| Germany | `ber`, `mun`, `kie` |
| Italy | `rom`, `nap`, `ven` |
| Russia | `mos`, `war`, `sev`, `stp` |
| Turkey | `con`, `smy`, `ank` |
| Neutral | `bel`, `bul`, `den`, `gre`, `hol`, `nwy`, `por`, `rum`, `ser`, `spa`, `swe`, `tun` |
