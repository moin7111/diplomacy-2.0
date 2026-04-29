# Uptime Kuma — Monitor Setup (I5)

Uptime Kuma läuft intern auf Port 3001.
Auf dem Server erreichbar via SSH-Tunnel:

```bash
ssh -L 3001:127.0.0.1:3001 root@91.99.192.76
# Dann: http://localhost:3001
```

---

## Monitore einrichten

### 1. Backend API Health

| Feld | Wert |
|------|------|
| Monitor Type | HTTP(s) |
| Name | Diplomacy API |
| URL | `http://api:4000/api/health` |
| Heartbeat Interval | 60 s |
| Retry | 3 |
| Expected Status Code | 200 |

### 2. PostgreSQL

| Feld | Wert |
|------|------|
| Monitor Type | TCP Port |
| Name | PostgreSQL |
| Hostname | `db` |
| Port | `5432` |
| Heartbeat Interval | 60 s |

### 3. Redis

| Feld | Wert |
|------|------|
| Monitor Type | TCP Port |
| Name | Redis |
| Hostname | `redis` |
| Port | `6379` |
| Heartbeat Interval | 60 s |

---

## Alert-Konfiguration

Unter **Settings → Notifications** eine Benachrichtigung einrichten (z. B. Discord Webhook oder E-Mail), dann für jeden Monitor unter **Edit → Notifications** aktivieren.

Empfohlene Einstellung: **Alert when down for 2 consecutive checks** (= 2 min bei 60 s Interval).

---

## Netzwerk-Hinweis

Uptime Kuma und alle Services laufen im selben Docker-Netzwerk (`diplomacy2_default`).  
Interne Hostnamen (`api`, `db`, `redis`) werden direkt aufgelöst — kein Caddy-Proxy dazwischen.  
`/api/health` ist von außen via Caddy geblockt (HTTP 403), intern aber vollständig erreichbar.
