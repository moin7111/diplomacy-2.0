# Diplomacy 2.0 — Branch-Strategie

## Übersicht

```
main          ← Production-Ready, nur über PR von develop
  │
  develop     ← Integration Branch, alle Features fließen hier zusammen
    │
    ├── feature/*     ← Neue Features (z.B. feature/F1-project-setup)
    ├── bugfix/*      ← Bug-Fixes (z.B. bugfix/fix-login-redirect)
    ├── hotfix/*      ← Kritische Fixes direkt auf main
    └── release/*     ← Release-Vorbereitung
```

## Branch-Typen

| Branch | Quelle | Merge-Ziel | Beschreibung |
|--------|--------|------------|--------------|
| `main` | — | — | Production. Immer stabil & deploybar. |
| `develop` | `main` | `main` | Integration aller Features. Hier wird zusammengeführt. |
| `feature/X` | `develop` | `develop` | Neues Feature. Namenskonvention: `feature/F1-project-setup` |
| `bugfix/X` | `develop` | `develop` | Bug-Fix. Namenskonvention: `bugfix/fix-websocket-reconnect` |
| `hotfix/X` | `main` | `main` + `develop` | Kritischer Fix in Production. |
| `release/X` | `develop` | `main` + `develop` | Release-Vorbereitung (Version, Changelog). |

## Namenskonventionen

### Feature-Branches (nach Team-Paketen)

```bash
# Frontend Team
feature/F1-project-setup
feature/F2-login-register
feature/F3-home-screen
feature/F4-lobby
feature/F5-map-renderer
feature/F6-command-input

# Backend Team
feature/B1-nestjs-setup
feature/B2-auth-system
feature/B3-game-api
feature/B4-websocket-server
feature/B5-timer-system

# Game Logic Team
feature/G1-map-adjacency
feature/G2-unit-system
feature/G3-command-parser
feature/G4-resolution-engine

# Infrastructure Team
feature/I2-cicd-pipeline
feature/I3-deployment-config
feature/I4-websocket-infra

# Design Team
feature/D1-style-guide
feature/D3-europe-map-svg
```

## Workflow

### 1. Feature entwickeln

```bash
# Vom develop-Branch abzweigen
git checkout develop
git pull origin develop
git checkout -b feature/F1-project-setup

# Entwickeln, committen
git add .
git commit -m "feat(frontend): add project setup with Next.js"

# Push & PR erstellen
git push origin feature/F1-project-setup
# → PR auf GitHub: feature/F1-project-setup → develop
```

### 2. Code Review & Merge

- Mindestens 1 Reviewer pro PR
- CI muss grün sein (Lint + Tests)
- Squash Merge bevorzugt (saubere History)

### 3. Release

```bash
# Release-Branch erstellen
git checkout develop
git checkout -b release/v0.1.0

# Version bumpen, Changelog schreiben
# PR: release/v0.1.0 → main
# Nach Merge: Tag erstellen
git tag v0.1.0
git push origin v0.1.0
```

## Commit-Konventionen

Format: `type(scope): message`

| Type | Beschreibung |
|------|-------------|
| `feat` | Neues Feature |
| `fix` | Bug-Fix |
| `docs` | Dokumentation |
| `style` | Formatierung (kein Code-Change) |
| `refactor` | Code-Refactoring |
| `test` | Tests hinzufügen/ändern |
| `chore` | Build-Prozess, Dependencies |
| `infra` | Infrastruktur-Änderungen |

Beispiele:
```
feat(backend): add JWT authentication
fix(frontend): resolve map rendering on mobile
docs(api): add WebSocket event documentation
infra(docker): optimize PostgreSQL memory settings
```

## Branch Protection Rules

### `main`
- ✅ Require PR reviews (min. 1)
- ✅ Require status checks (CI)
- ✅ No direct push
- ✅ Require linear history

### `develop`
- ✅ Require status checks (CI)
- ⬜ PR reviews optional (aber empfohlen)
