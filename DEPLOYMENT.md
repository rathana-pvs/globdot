# Globdot — VPS Deployment & Operations Manual

This guide covers deploying **Globdot** (Next.js 15, Payload CMS 3.82, PostgreSQL) to any Linux Virtual Private Server (Ubuntu 22.04 or 24.04 LTS recommended) on providers such as DigitalOcean, Hetzner, Linode, Vultr, or AWS EC2.

---

## 1. Production Architecture Overview

```
                        Internet / Users
                               │
                               ▼
                   ┌───────────────────────┐
                   │   Nginx (Port 80/443)  │ <--- Let's Encrypt SSL (Certbot)
                   │  Reverse Proxy + Cache│ <--- Static & Media Caching
                   └───────────┬───────────┘
                               │ (proxy_pass http://127.0.0.1:3000)
                               ▼
                   ┌───────────────────────┐
                   │    PM2 Process Mgr    │
                   │  Next.js + Payload    │ (Running on Node.js 20 LTS)
                   └───────────┬───────────┘
                               │ (postgresql://127.0.0.1:5437/globdot)
                               ▼
                   ┌───────────────────────┐
                   │ Docker: PostgreSQL 15 │ (Bound strictly to 127.0.0.1)
                   │  globdot-db Container │ (Persistent Docker Volume)
                   └───────────────────────┘
```

- **Next.js & Payload CMS**: Runs natively via PM2 for fast zero-downtime reloads and low-overhead performance.
- **PostgreSQL**: Runs isolated in Docker on port `5437` bound only to `127.0.0.1` (never exposed to public internet).
- **Nginx**: Handles SSL termination (Certbot), HTTP/2, security headers, rate limiting, and caching for `/_next/static/` and `/media/`.

---

## 2. Server Requirements

| Resource | Minimum | Recommended |
|---|---|---|
| **RAM** | 1 GB (+ 2GB Swap) | 2 GB – 4 GB |
| **CPU** | 1 vCPU | 2 vCPUs |
| **Disk** | 20 GB SSD | 40+ GB SSD |
| **OS** | Ubuntu 22.04 LTS | Ubuntu 24.04 LTS |

---

## 3. Initial Setup on a Fresh VPS

### Step 3.1: Connect to your server & clone repository

```bash
# SSH into your server
ssh root@YOUR_SERVER_IP

# Clone repository into desired directory
git clone https://github.com/rathana-pvs/globdot.git /var/www/globdot
cd /var/www/globdot
```

### Step 3.2: Configure Environment Variables

```bash
cp .env.example .env
nano .env
```

Set:
1. `POSTGRES_PASSWORD`: Use a strong random password (`openssl rand -base64 24`).
2. `DATABASE_URI`: Match your chosen password (e.g. `postgresql://globdot:YOUR_PASSWORD@127.0.0.1:5437/globdot`).
3. `PAYLOAD_SECRET`: Generate a secure key (`openssl rand -hex 32`).
4. `NEXT_PUBLIC_SITE_URL`: Your domain (e.g. `https://yourdomain.com`).
5. `CONTENT_MODE`: Set to `production`.

### Step 3.3: Run the Automated Setup Script

The automated setup script installs Node.js 20 LTS, Docker, PM2, Nginx, Certbot, configures a 2GB swap space (preventing build OOM), sets firewall rules, starts PostgreSQL, builds the application, and registers PM2 with systemd:

```bash
chmod +x setup-vps.sh
sudo ./setup-vps.sh
```

---

## 4. Domain & SSL Setup (Certbot)

### Step 4.1: Configure DNS
In your domain registrar / DNS provider (Cloudflare, Namecheap, Route53), point your domain to your VPS IP:
- **A Record**: `@` $\rightarrow$ `YOUR_SERVER_IP`
- **A Record**: `www` $\rightarrow$ `YOUR_SERVER_IP`

### Step 4.2: Update Nginx Site Domain
Edit `/etc/nginx/sites-available/globdot`:
```bash
sudo nano /etc/nginx/sites-available/globdot
```
Replace `server_name globdot.com www.globdot.com;` with your actual domain:
```nginx
server_name yourdomain.com www.yourdomain.com;
```
Test and reload Nginx:
```bash
sudo nginx -t
sudo systemctl reload nginx
```

### Step 4.3: Issue Free SSL Certificate
Run Certbot to automatically configure Let's Encrypt SSL:
```bash
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
```
Certbot will configure SSL, HTTP-to-HTTPS redirection, and set up automatic renewal cron.

---

## 5. Daily Operations & Maintenance

### Zero-Downtime Deployment
Deploy code updates anytime with:
```bash
cd /var/www/globdot
./deploy.sh
```
This fetches the latest code, installs dependencies, builds, reloads PM2 without dropping connections, and verifies health.

### Checking Process Status & Logs
```bash
# PM2 process status
pm2 status

# Live application logs
pm2 logs globdot

# Error logs only
pm2 logs globdot --err

# Docker database logs
docker compose logs -f db
```

### Restarting Services
```bash
# Restart Next.js / Payload
pm2 restart globdot

# Restart Database
docker compose restart db

# Reload Nginx
sudo systemctl reload nginx
```

---

## 6. Automated Backups

Globdot includes built-in backup and restore scripts.

### Run Manual Backup
```bash
./scripts/backup.sh
```
This dumps the PostgreSQL database, archives `public/media/`, and creates a compressed file in `backups/globdot_backup_YYYY-MM-DD_HHMMSS.tar.gz` while deleting backups older than 14 days.

### Schedule Daily Backups via Cron
Add a daily cron job at 3:00 AM:
```bash
crontab -e
```
Add the following line:
```cron
0 3 * * * /var/www/globdot/scripts/backup.sh >> /var/www/globdot/logs/backup.log 2>&1
```

### Restoring from Backup
```bash
./scripts/restore.sh backups/globdot_backup_2026-09-15_180000.tar.gz
```

---

## 7. Troubleshooting

| Issue | Cause | Solution |
|---|---|---|
| `next build` fails with `Killed` or `SIGKILL` | Out of memory | Verify swap: `swapon --show`. Setup script creates a 2GB swap. Also ensure `NODE_OPTIONS="--max-old-space-size=1536"`. |
| Database connection refused | Container not running or port mismatch | Run `docker compose ps`. Check `docker compose logs db`. Ensure `.env` has `127.0.0.1:5437`. |
| 502 Bad Gateway on Nginx | Node.js app not running | Run `pm2 status`. Check `pm2 logs globdot --lines 50`. Verify app responds on `curl http://127.0.0.1:3000`. |
| Admin panel styles missing | Next.js build cache issue | Run `rm -rf .next && npm run build && pm2 reload globdot`. |
