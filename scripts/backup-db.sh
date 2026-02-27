#!/usr/bin/env bash
# =============================================================================
# PLO-GA Mapping System — Nightly MySQL Database Backup
# =============================================================================
# Usage: ./scripts/backup-db.sh
# Cron (nightly at 2 AM): 0 2 * * * /path/to/project/scripts/backup-db.sh >> /var/log/plo-ga-backup.log 2>&1
#
# Retains the last 7 daily backups. Older files are deleted automatically.
# =============================================================================

set -euo pipefail

# ---------------------------------------------------------------------------
# Configuration — edit these to match your VPS environment
# ---------------------------------------------------------------------------
PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
BACKUP_DIR="${PROJECT_DIR}/backups"
DB_NAME="plo_ga_mapping"           # Your MySQL database name
DB_USER="root"                     # MySQL user
DB_PASSWORD_FILE="${PROJECT_DIR}/.db_password"  # File containing the DB password (one line)
RETAIN_DAYS=7                      # Number of daily backups to keep

# ---------------------------------------------------------------------------
# Resolve DB password
# ---------------------------------------------------------------------------
if [[ -f "$DB_PASSWORD_FILE" ]]; then
  DB_PASS=$(cat "$DB_PASSWORD_FILE")
elif [[ -n "${DATABASE_URL:-}" ]]; then
  # Parse password from DATABASE_URL: mysql://user:pass@host:port/dbname
  DB_PASS=$(echo "$DATABASE_URL" | sed -E 's|.*://[^:]+:([^@]+)@.*|\1|')
  DB_USER=$(echo "$DATABASE_URL" | sed -E 's|.*://([^:]+):.*|\1|')
  DB_HOST=$(echo "$DATABASE_URL" | sed -E 's|.*@([^:/]+).*|\1|')
  DB_PORT=$(echo "$DATABASE_URL" | sed -E 's|.*:([0-9]+)/.*|\1|')
  DB_NAME=$(echo "$DATABASE_URL" | sed -E 's|.*/([^?]+).*|\1|')
else
  echo "[backup] ERROR: No database credentials found. Create .db_password or set DATABASE_URL."
  exit 1
fi

DB_HOST="${DB_HOST:-127.0.0.1}"
DB_PORT="${DB_PORT:-3306}"

# ---------------------------------------------------------------------------
# Create backup directory
# ---------------------------------------------------------------------------
mkdir -p "$BACKUP_DIR"

# ---------------------------------------------------------------------------
# Run mysqldump
# ---------------------------------------------------------------------------
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_FILE="${BACKUP_DIR}/plo_ga_backup_${TIMESTAMP}.sql.gz"

echo "[backup] Starting backup at $(date)"
echo "[backup] Database: ${DB_NAME} on ${DB_HOST}:${DB_PORT}"
echo "[backup] Output: ${BACKUP_FILE}"

MYSQL_PWD="$DB_PASS" mysqldump \
  --host="$DB_HOST" \
  --port="$DB_PORT" \
  --user="$DB_USER" \
  --single-transaction \
  --routines \
  --triggers \
  --add-drop-table \
  "$DB_NAME" | gzip > "$BACKUP_FILE"

BACKUP_SIZE=$(du -sh "$BACKUP_FILE" | cut -f1)
echo "[backup] Backup complete. Size: ${BACKUP_SIZE}"

# ---------------------------------------------------------------------------
# Prune old backups (keep last RETAIN_DAYS)
# ---------------------------------------------------------------------------
echo "[backup] Pruning backups older than ${RETAIN_DAYS} days..."
find "$BACKUP_DIR" -name "plo_ga_backup_*.sql.gz" -mtime "+${RETAIN_DAYS}" -delete
REMAINING=$(find "$BACKUP_DIR" -name "plo_ga_backup_*.sql.gz" | wc -l)
echo "[backup] Retained ${REMAINING} backup(s)."

echo "[backup] Done at $(date)"
