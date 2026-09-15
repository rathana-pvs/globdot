#!/bin/bash
# setup-vps.sh — Comprehensive Production Setup Script for Globdot
# Compatible with Ubuntu 20.04 / 22.04 / 24.04 LTS
set -e

GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}======================================================${NC}"
echo -e "${GREEN}🚀 Starting Globdot Production VPS Setup${NC}"
echo -e "${BLUE}======================================================${NC}"

# Check if running as root or with sudo capabilities
IS_ROOT=false
if [ "$EUID" -eq 0 ]; then
    IS_ROOT=true
fi

run_as_root() {
    if [ "$IS_ROOT" = true ]; then
        "$@"
    else
        sudo "$@"
    fi
}

# ---------------------------------------------------------
# 1. SWAP MEMORY CONFIGURATION (Critical for low-RAM VPS)
# ---------------------------------------------------------
TOTAL_SWAP=$(free -m | awk '/^Swap:/ {print $2}')
if [ "$TOTAL_SWAP" -lt 1500 ]; then
    echo -e "${YELLOW}⚙️  Configuring 2GB swap space to prevent memory exhaustion during build...${NC}"
    if [ ! -f /swapfile ]; then
        run_as_root fallocate -l 2G /swapfile || run_as_root dd if=/dev/zero of=/swapfile bs=1M count=2048
        run_as_root chmod 600 /swapfile
        run_as_root mkswap /swapfile
        run_as_root swapon /swapfile
        if ! grep -q '/swapfile' /etc/fstab; then
            echo '/swapfile none swap sw 0 0' | run_as_root tee -a /etc/fstab
        fi
        echo -e "${GREEN}✓ 2GB swap file enabled successfully.${NC}"
    else
        echo -e "${GREEN}✓ Swap file already exists.${NC}"
    fi
else
    echo -e "${GREEN}✓ Sufficient swap detected (${TOTAL_SWAP}MB).${NC}"
fi

# ---------------------------------------------------------
# 2. SYSTEM PACKAGES & DEPENDENCIES
# ---------------------------------------------------------
echo -e "${YELLOW}📦 Updating package list and installing base utilities...${NC}"
run_as_root apt-get update -y
run_as_root apt-get install -y curl git ufw build-essential libpq-dev openssl

# ---------------------------------------------------------
# 3. NODE.JS 20 LTS INSTALLATION
# ---------------------------------------------------------
NODE_VERSION=$(node -v 2>/dev/null | cut -d'v' -f2 | cut -d'.' -f1 || echo "0")
if [ "$NODE_VERSION" -lt 20 ]; then
    echo -e "${YELLOW}📦 Installing Node.js 20 LTS...${NC}"
    curl -fsSL https://deb.nodesource.com/setup_20.x | run_as_root bash -
    run_as_root apt-get install -y nodejs
else
    echo -e "${GREEN}✓ Node.js $(node -v) is installed.${NC}"
fi

# ---------------------------------------------------------
# 4. PM2 PROCESS MANAGER INSTALLATION
# ---------------------------------------------------------
if ! command -v pm2 &> /dev/null; then
    echo -e "${YELLOW}📦 Installing PM2 globally...${NC}"
    run_as_root npm install -g pm2
else
    echo -e "${GREEN}✓ PM2 $(pm2 -v) is already installed.${NC}"
fi

# ---------------------------------------------------------
# 5. DOCKER & DOCKER COMPOSE INSTALLATION
# ---------------------------------------------------------
if ! command -v docker &> /dev/null; then
    echo -e "${YELLOW}📦 Docker not found. Installing Docker & Compose plugin...${NC}"
    curl -fsSL https://get.docker.com -o get-docker.sh
    run_as_root sh get-docker.sh
    rm -f get-docker.sh
    run_as_root systemctl enable --now docker
    # Add current non-root user to docker group if applicable
    if [ "$IS_ROOT" = false ]; then
        run_as_root usermod -aG docker "$USER" || true
    fi
else
    echo -e "${GREEN}✓ Docker $(docker -v) is already installed.${NC}"
fi

# ---------------------------------------------------------
# 6. NGINX & CERTBOT INSTALLATION
# ---------------------------------------------------------
if ! command -v nginx &> /dev/null; then
    echo -e "${YELLOW}📦 Installing Nginx and Certbot...${NC}"
    run_as_root apt-get install -y nginx certbot python3-certbot-nginx
    run_as_root systemctl enable --now nginx
else
    echo -e "${GREEN}✓ Nginx is already installed.${NC}"
fi

# ---------------------------------------------------------
# 7. FIREWALL (UFW) CONFIGURATION
# ---------------------------------------------------------
echo -e "${YELLOW}🔒 Ensuring UFW firewall rules...${NC}"
run_as_root ufw allow OpenSSH || run_as_root ufw allow 22/tcp
run_as_root ufw allow 'Nginx Full' || (run_as_root ufw allow 80/tcp && run_as_root ufw allow 443/tcp)
echo "y" | run_as_root ufw enable || true
echo -e "${GREEN}✓ Firewall rules configured (SSH, HTTP, HTTPS enabled; DB port 5437 is protected).${NC}"

# ---------------------------------------------------------
# 8. ENVIRONMENT VARIABLES & SECRETS SETUP
# ---------------------------------------------------------
if [ ! -f .env ]; then
    echo -e "${YELLOW}📝 Creating .env from .env.example with auto-generated PAYLOAD_SECRET...${NC}"
    cp .env.example .env
    RANDOM_SECRET=$(openssl rand -hex 32)
    # Replace default placeholder secret
    sed -i "s/globdot-dev-secret-replace-in-production/${RANDOM_SECRET}/g" .env
    echo -e "${GREEN}✓ Created .env with new random secret.${NC}"
    echo -e "${YELLOW}⚠️  IMPORTANT: Please inspect and configure .env (e.g. NEXT_PUBLIC_SITE_URL, passwords).${NC}"
else
    echo -e "${GREEN}✓ Existing .env file found.${NC}"
fi

# Ensure required logs and media directories exist
mkdir -p logs
mkdir -p public/media

# ---------------------------------------------------------
# 9. START POSTGRESQL CONTAINER
# ---------------------------------------------------------
echo -e "${YELLOW}🐘 Starting PostgreSQL container via Docker Compose...${NC}"
docker compose up -d db

echo -e "⏳ Waiting for PostgreSQL container to report healthy..."
ATTEMPTS=0
MAX_ATTEMPTS=20
until docker compose exec -T db pg_isready &>/dev/null || [ $ATTEMPTS -ge $MAX_ATTEMPTS ]; do
    sleep 1
    ATTEMPTS=$((ATTEMPTS+1))
done

if [ $ATTEMPTS -ge $MAX_ATTEMPTS ]; then
    echo -e "${RED}⚠️  PostgreSQL took longer than expected to report ready. Continuing build...${NC}"
else
    echo -e "${GREEN}✓ PostgreSQL container is healthy and accepting connections.${NC}"
fi

# ---------------------------------------------------------
# 10. INSTALL DEPENDENCIES & BUILD NEXT.JS
# ---------------------------------------------------------
echo -e "${YELLOW}🔨 Installing application dependencies (npm ci)...${NC}"
npm ci --prefer-offline --no-audit

echo -e "${YELLOW}🏗️  Building production Next.js application...${NC}"
NODE_OPTIONS="--max-old-space-size=1536" npm run build

# ---------------------------------------------------------
# 11. START / RELOAD APPLICATION VIA PM2
# ---------------------------------------------------------
echo -e "${YELLOW}⚡ Starting application via PM2...${NC}"
pm2 start ecosystem.config.cjs --env production || pm2 reload ecosystem.config.cjs --env production
pm2 save

# Setup PM2 to revive on system reboot
echo -e "${YELLOW}🔄 Configuring PM2 systemd startup...${NC}"
run_as_root env PATH=$PATH:/usr/bin /usr/lib/node_modules/pm2/bin/pm2 startup systemd -u "$USER" --hp "$HOME" || pm2 startup || true
pm2 save

# ---------------------------------------------------------
# 12. NGINX SITE CONFIGURATION SETUP
# ---------------------------------------------------------
if [ -f "nginx/globdot.conf" ]; then
    echo -e "${YELLOW}🌐 Configuring Nginx reverse proxy...${NC}"
    run_as_root cp nginx/globdot.conf /etc/nginx/sites-available/globdot
    if [ ! -f /etc/nginx/sites-enabled/globdot ]; then
        run_as_root ln -s /etc/nginx/sites-available/globdot /etc/nginx/sites-enabled/globdot
    fi
    # Disable default Nginx welcome page if active
    if [ -f /etc/nginx/sites-enabled/default ]; then
        run_as_root rm -f /etc/nginx/sites-enabled/default
    fi
    if run_as_root nginx -t; then
        run_as_root systemctl reload nginx
        echo -e "${GREEN}✓ Nginx configured and reloaded successfully.${NC}"
    else
        echo -e "${RED}⚠️  Nginx configuration test failed. Please check /etc/nginx/sites-available/globdot.${NC}"
    fi
fi

echo -e "${BLUE}======================================================${NC}"
echo -e "${GREEN}🎉 Globdot VPS Setup Completed Successfully!${NC}"
echo -e "${BLUE}======================================================${NC}"
echo -e "Next steps for your deployment:"
echo -e " 1. Configure your domain DNS (A record pointing to this VPS IP)."
echo -e " 2. Update your domain in ${BLUE}/etc/nginx/sites-available/globdot${NC} and run ${BLUE}sudo nginx -t && sudo systemctl reload nginx${NC}."
echo -e " 3. Obtain free HTTPS certificates via Certbot:"
echo -e "    ${GREEN}sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com${NC}"
echo -e " 4. View application status and live logs:"
echo -e "    ${BLUE}pm2 status${NC}"
echo -e "    ${BLUE}pm2 logs globdot${NC}"
echo -e " 5. Deploy future updates anytime with: ${GREEN}./deploy.sh${NC}"
