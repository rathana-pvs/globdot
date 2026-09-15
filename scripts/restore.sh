#!/bin/bash
# scripts/restore.sh — Restore Globdot Database & Media from Backup Archive
set -e

GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

if [ -z "$1" ]; then
    echo -e "${RED}Usage: $0 <path_to_backup_archive.tar.gz>${NC}"
    echo "Example: $0 backups/globdot_backup_2026-09-15_180000.tar.gz"
    exit 1
fi

ARCHIVE_PATH="$1"
if [ ! -f "$ARCHIVE_PATH" ]; then
    echo -e "${RED}❌ Error: Backup archive '$ARCHIVE_PATH' not found.${NC}"
    exit 1
fi

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
TEMP_DIR=$(mktemp -d)

trap "rm -rf ${TEMP_DIR}" EXIT

echo -e "${BLUE}======================================================${NC}"
echo -e "${GREEN}🔄 Restoring Globdot from: ${ARCHIVE_PATH}${NC}"
echo -e "${BLUE}======================================================${NC}"

# Source environment variables for DB credentials
if [ -f "${ROOT_DIR}/.env" ]; then
    export $(grep -v '^#' "${ROOT_DIR}/.env" | xargs -d '\n')
fi

DB_USER="${POSTGRES_USER:-globdot}"
DB_NAME="${POSTGRES_DB:-globdot}"

# Extract archive
echo -e "${YELLOW}📂 Extracting archive...${NC}"
tar -xzf "$ARCHIVE_PATH" -C "$TEMP_DIR"
EXTRACTED_DIR=$(find "$TEMP_DIR" -mindepth 1 -maxdepth 1 -type d | head -n 1)

if [ -z "$EXTRACTED_DIR" ]; then
    echo -e "${RED}❌ Error: Failed to locate extracted contents.${NC}"
    exit 1
fi

# Restore database
if [ -f "${EXTRACTED_DIR}/database.sql" ]; then
    echo -e "${YELLOW}🐘 Restoring PostgreSQL database...${NC}"
    docker compose -f "${ROOT_DIR}/docker-compose.yml" exec -T db psql -U "${DB_USER}" -d "${DB_NAME}" < "${EXTRACTED_DIR}/database.sql"
    echo -e "${GREEN}✓ Database restored successfully.${NC}"
else
    echo -e "${YELLOW}⚠️  No database.sql found in archive, skipping DB restore.${NC}"
fi

# Restore media
if [ -d "${EXTRACTED_DIR}/media" ]; then
    echo -e "${YELLOW}🖼️  Restoring media files...${NC}"
    mkdir -p "${ROOT_DIR}/public/media"
    cp -r "${EXTRACTED_DIR}/media/"* "${ROOT_DIR}/public/media/"
    echo -e "${GREEN}✓ Media assets restored to public/media/${NC}"
else
    echo -e "${YELLOW}⚠️  No media directory found in archive, skipping media restore.${NC}"
fi

echo -e "${BLUE}======================================================${NC}"
echo -e "${GREEN}✅ Restore completed successfully!${NC}"
echo -e "${BLUE}======================================================${NC}"
