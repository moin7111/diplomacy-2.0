# N8N Workflow — Avatar Image Generator (Nanobanana)

Liest Avatar-Prompts aus Google Sheets, generiert Bilder über **Nanobanana**
und speichert sie automatisch in Google Drive.

---

## Google Sheets einrichten

1. Neue Tabelle anlegen: `Diplomacy 2.0 — Avatar Prompts`
2. Inhalt aus `avatar-prompts-n8n.csv` einfügen (Import → CSV)
3. Spalten sicherstellen:

| Spalte | Inhalt |
|--------|--------|
| A: ID | Laufende Nummer |
| B: Name | Avatar-Name |
| C: Kategorie | Ordnername (z.B. antike-historisch) |
| D: Dateiname | Dateiname ohne .png |
| E: Prompt | Vollständiger Bild-Prompt |
| F: Status | Leer = noch nicht generiert |
| G: Drive URL | Automatisch befüllt |

---

## N8N Workflow-Beschreibung

```
Erstelle einen N8N-Workflow "Diplomacy Avatar Generator" mit diesen Nodes:

NODE 1 — MANUAL TRIGGER
Startet den Workflow manuell per Klick.

NODE 2 — GOOGLE SHEETS (Daten laden)
Operation: Get Many Rows
Spreadsheet: "Diplomacy 2.0 — Avatar Prompts"
Sheet: Sheet1
Filter: Spalte F (Status) = leer
→ Nur noch nicht generierte Zeilen verarbeiten

NODE 3 — SPLIT IN BATCHES
Batch Size: 1
Verarbeitet jeden Avatar einzeln, um Fehler zu isolieren.

NODE 4 — WAIT
Duration: 3 Sekunden
Verhindert Rate-Limit-Fehler bei Nanobanana.

NODE 5 — HTTP REQUEST (Nanobanana Bildgenerierung)
Method: POST
URL: https://api.nanobanana.io/v1/generate
  (Nanobanana API-Endpoint — ggf. anpassen)
Authentication: Header Auth
  Header Name:  Authorization
  Header Value: Bearer {{ $env.NANOBANANA_API_KEY }}
Body Type: JSON
Body:
{
  "prompt": "{{ $json.Prompt }}",
  "width": 512,
  "height": 512,
  "steps": 30,
  "output_format": "png"
}
Response: Speichere als JSON (enthält image_url oder base64)

NODE 6 — IF (Prüfung: URL oder Base64?)
Condition: {{ $json.image_url }} existiert
→ TRUE:  weiter zu NODE 7a (Download per URL)
→ FALSE: weiter zu NODE 7b (Base64 direkt)

NODE 7a — HTTP REQUEST (Bild herunterladen, wenn URL)
Method: GET
URL: {{ $json.image_url }}
Response Format: File
Binary Property Name: imageData

NODE 7b — MOVE BINARY DATA (wenn Base64)
Konvertiert den Base64-String aus $json.image_base64
in Binary-Daten mit Property Name: imageData

NODE 8 — GOOGLE DRIVE (Ordner sicherstellen)
Operation: Create Folder
Folder Name: {{ $('GOOGLE SHEETS').item.json.Kategorie }}
Parent Folder ID: [ID des Ordners "Diplomacy 2.0/Avatare" in Drive]
On Conflict: Return Existing
→ Gibt Folder-ID zurück

NODE 9 — GOOGLE DRIVE (Datei hochladen)
Operation: Upload
File Name: {{ $('GOOGLE SHEETS').item.json.Dateiname }}.png
Parent Folder: Folder-ID aus NODE 8
Binary Property: imageData
MIME Type: image/png
→ Gibt webViewLink zurück

NODE 10 — GOOGLE SHEETS (Status aktualisieren)
Operation: Update Row
Row Identifier: Spalte A (ID) = {{ $('GOOGLE SHEETS').item.json.ID }}
Updates:
  Spalte F → "generiert"
  Spalte G → {{ $json.webViewLink }}

NODE 11 — ERROR TRIGGER (verbunden mit NODE 5 und NODE 9)
Bei Fehler:
  Google Sheets Update: Spalte F → "fehler: {{ $json.message }}"
```

---

## Google Drive Ordnerstruktur (Ergebnis)

```
Google Drive/
└── Diplomacy 2.0/
    └── Avatare/
        ├── antike-historisch/      (5 Avatare)
        ├── antike-mythologie/      (3 Avatare)
        ├── mittelalter/            (4 Avatare)
        ├── fruehe-neuzeit/         (3 Avatare)
        ├── 20-jahrhundert/         (5 Avatare)
        ├── kalter-krieg/           (4 Avatare)
        ├── moderne-strategen/      (2 Avatare)
        ├── griechische-goetter/    (5 Avatare)
        ├── ikonische-figuren/      (10 Avatare)
        └── entwickler/             (1 Avatar — Der Architekt)
```

---

## Benötigte Credentials in N8N

| Credential | Typ | Für |
|------------|-----|-----|
| `NANOBANANA_API_KEY` | Environment Variable | Bildgenerierung |
| Google Sheets OAuth2 | OAuth2 | Prompts lesen + Status schreiben |
| Google Drive OAuth2 | OAuth2 | Ordner + Upload |

N8N Environment Variable setzen:
Settings → Environment Variables → `NANOBANANA_API_KEY` = dein Key

---

## Hinweise

- **42 Bilder** total (inkl. Der Architekt)
- **Wiederholbar:** Workflow überspringt Zeilen mit Status "generiert"
- **Fehlertoleranz:** Fehler werden in Spalte F geloggt, Workflow läuft weiter
- Der Entwickler-Avatar (ID 42) wird im selben Durchlauf generiert — falls er
  exklusiv bleiben soll, Zeile 42 in Sheets manuell auf Status "skip" setzen
  und nach dem Hauptlauf separat ausführen
