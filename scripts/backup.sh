#!/bin/bash
# scripts/backup.sh — Globdot Automated Database & Media Backup
set -e

GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
BACKUP_DIR="${ROOT_DIR}/backups"
TIMESTAMP="$(date +%Y-%m-%d_%H%M%S)"
TARGET_BACKUP="${BACKUP_DIR}/globdot_backup_${TIMESTAMP}"
RETENTION_DAYS=14

mkdir -p "${BACKUP_DIR}"
mkdir -p "${TARGET_BACKUP}"

echo -e "${BLUE}======================================================${NC}"
echo -e "${GREEN}📦 Starting Globdot Backup: ${TIMESTAMP}${NC}"
echo -e "${BLUE}======================================================${NC}"

# Source environment variables for DB credentials
if [ -f "${ROOT_DIR}/.env" ]; then
    export $(grep -v '^#' "${ROOT_DIR}/.env" | xargs -d '\n')
fi

DB_USER="${POSTGRES_USER:-globdot}"
DB_NAME="${POSTGRES_DB:-globdot}"

# 1. PostgreSQL Database Dump
echo -e "${YELLOW}🐘 Exporting PostgreSQL database...${NC}"
if docker compose -f "${ROOT_DIR}/docker-compose.yml" ps --services --filter "status=running" | grep -q "db"; then
    docker compose -f "${ROOT_DIR}/docker-compose.yml" exec -T db pg_dump -U "${DB_USER}" -d "${DB_NAME}" > "${TARGET_BACKUP}/database.sql"
    echo -e "${GREEN}✓ Database exported (${TARGET_BACKUP}/database.sql)${NC}"
else
    echo -e "${RED}❌ Error: PostgreSQL container is not running! Cannot dump DB.${NC}"
    rm -rf "${TARGET_BACKUP}"
    exit 1
fi

# 2. Copy Media Assets
echo -e "${YELLOW}🖼️  Archiving public media files...${NC}"
if [ -d "${ROOT_DIR}/public/media" ]; then
    cp -r "${ROOT_DIR}/public/media" "${TARGET_BACKUP}/media"
    echo -e "${GREEN}✓ Media assets archived (${TARGET_BACKUP}/media)${NC}"
else
    mkdir -p "${TARGET_BACKUP}/media"
fi

# 3. Create compressed tarball
echo -e "${YELLOW}🗜️  Compressing backup archive...${NC}"
ARCHIVE_FILE="${BACKUP_DIR}/globdot_backup_${TIMESTAMP}.tar.gz"
tar -czf "${ARCHIVE_FILE}" -C "${BACKUP_DIR}" "globdot_backup_${TIMESTAMP}"
rm -rf "${TARGET_BACKUP}"

ARCHIVE_SIZE=$(du -h "${ARCHIVE_FILE}" | cut -f1)
echo -e "${GREEN}✓ Backup successfully created: ${ARCHIVE_FILE} (${ARCHIVE_SIZE})${NC}"

# 4. Enforce Retention Policy
echo -e "${YELLOW}🧹 Purging backups older than ${RETENTION_DAYS} days...${NC}"
find "${BACKUP_DIR}" -type f -name "globdot_backup_*.tar.gz" -mtime +${RETENTION_DAYS} -exec rm -f {} \;

echo -e "${BLUE}======================================================${NC}"
echo -e "${GREEN}✅ Backup complete!${NC}"
echo -e "${BLUE}======================================================${NC}"
