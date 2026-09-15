#!/bin/bash
# deploy.sh — Zero-Downtime Globdot Production Deployment Script
set -e

GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

BRANCH="${1:-main}"

echo -e "${BLUE}======================================================${NC}"
echo -e "${GREEN}🚀 Deploying Globdot (Branch: ${BRANCH})...${NC}"
echo -e "${BLUE}======================================================${NC}"

# 1. Verify PostgreSQL container status
echo -e "${YELLOW}🐘 Checking database container...${NC}"
if ! docker compose ps --services --filter "status=running" | grep -q "db"; then
    echo -e "Starting PostgreSQL container..."
    docker compose up -d db
    sleep 3
fi

# 2. Pull latest code
echo -e "${YELLOW}📥 Pulling latest code from origin/${BRANCH}...${NC}"
git fetch origin "$BRANCH"
git checkout "$BRANCH"
git pull origin "$BRANCH"

# 3. Install dependencies cleanly
echo -e "${YELLOW}📦 Checking dependencies (npm ci)...${NC}"
npm ci --prefer-offline --no-audit

# 4. Generate Payload types if necessary
echo -e "${YELLOW}🧬 Generating schema types...${NC}"
npm run generate:types || true

# 5. Build production Next.js application
echo -e "${YELLOW}🔨 Building Next.js production bundle...${NC}"
NODE_OPTIONS="--max-old-space-size=1536" npm run build

# 6. Zero-downtime PM2 reload
echo -e "${YELLOW}♻️  Reloading PM2 process (zero-downtime)...${NC}"
pm2 reload ecosystem.config.cjs --env production || pm2 start ecosystem.config.cjs --env production
pm2 save

# 7. Health Check
APP_PORT="${PORT:-3001}"
echo -e "${YELLOW}🔍 Performing health check on port ${APP_PORT}...${NC}"
HEALTHY=false
for i in {1..10}; do
    sleep 2
    if curl -s -o /dev/null -w "%{http_code}" "http://127.0.0.1:${APP_PORT}/" | grep -qE "200|301|302|307|308"; then
        HEALTHY=true
        break
    fi
    echo "Waiting for app to respond (attempt $i/10)..."
done

if [ "$HEALTHY" = true ]; then
    echo -e "${GREEN}✓ Application is healthy and serving traffic!${NC}"
else
    echo -e "${RED}⚠️  Warning: Health check did not return HTTP 200/3xx. Inspect logs:${NC}"
    echo -e "   ${BLUE}pm2 logs globdot --lines 50${NC}"
fi

echo -e "${BLUE}======================================================${NC}"
echo -e "${GREEN}✅ Deployment finished!${NC}"
echo -e "${BLUE}======================================================${NC}"
