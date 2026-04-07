# ============================================
# Diplomacy 2.0 — Quick-Connect Anleitung
# ============================================
# Für alle Team-Mitglieder: Diese Datei erklärt,
# wie man sich schnell mit dem Server verbinden kann.

# === 1. SSH Config einrichten ===
# Füge folgendes in deine ~/.ssh/config ein:
#
#   Host diplomacy
#       HostName 91.99.192.76
#       User root
#       IdentityFile ~/.ssh/id_ed25519
#
# Danach kannst du dich verbinden mit:
#   ssh diplomacy
#
# Statt:
#   ssh root@91.99.192.76

# === 2. SSH Key dem Server hinzufügen ===
# Falls dein SSH Key noch nicht auf dem Server ist:
#
# Windows:
#   type $env:USERPROFILE\.ssh\id_ed25519.pub | ssh root@91.99.192.76 "cat >> ~/.ssh/authorized_keys"
#
# Mac/Linux:
#   ssh-copy-id -i ~/.ssh/id_ed25519 root@91.99.192.76

# === 3. Quick Commands nach dem Verbinden ===
#
# Server-Status:        bash /opt/diplomacy2/scripts/agent-connect.sh
# Docker-Status:        cd /opt/diplomacy2 && docker compose ps
# API-Logs:             docker compose logs -f api
# DB-Shell:             docker exec -it diplomacy2-db psql -U diplomacy2 -d diplomacy2
# Redis-Shell:          docker exec -it diplomacy2-redis redis-cli -a D2_Redis_S3cur3_2026!

# === 4. Git Repository ===
#
# Clone:  git clone https://github.com/moin7111/diplomacy-2.0.git
# Branch: git checkout develop
# Neuer Feature-Branch: git checkout -b feature/F1-project-setup
