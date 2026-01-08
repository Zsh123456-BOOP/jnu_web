#!/usr/bin/env bash
set -euo pipefail

# ===== Config (defaults match what you provided) =====
MYSQL_HOST="${MYSQL_HOST:-localhost}"
MYSQL_PORT="${MYSQL_PORT:-3306}"
MYSQL_USER="${MYSQL_USER:-root}"
MYSQL_PASSWORD="${MYSQL_PASSWORD:-root}"
MYSQL_DATABASE="${MYSQL_DATABASE:-lab_site}"

# ===== Paths =====
ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SQL_FILE="${ROOT_DIR}/db/lab_site.sql"

if [[ ! -f "$SQL_FILE" ]]; then
  echo "[ERROR] SQL file not found: $SQL_FILE" >&2
  exit 1
fi

echo "[INFO] Using SQL: $SQL_FILE"
echo "[INFO] Target DB: ${MYSQL_DATABASE} @ ${MYSQL_HOST}:${MYSQL_PORT} (user=${MYSQL_USER})"

# Optional: quick connectivity check
mysql \
  -h "${MYSQL_HOST}" -P "${MYSQL_PORT}" -u "${MYSQL_USER}" -p"${MYSQL_PASSWORD}" \
  -e "SELECT 1;" >/dev/null

# Safety: show what will happen
echo "[WARN] This will DROP DATABASE '${MYSQL_DATABASE}' and recreate it, then import '${SQL_FILE}'."

# ===== Drop & recreate database (full replace) =====
mysql \
  -h "${MYSQL_HOST}" -P "${MYSQL_PORT}" -u "${MYSQL_USER}" -p"${MYSQL_PASSWORD}" \
  -e "DROP DATABASE IF EXISTS \`${MYSQL_DATABASE}\`; CREATE DATABASE \`${MYSQL_DATABASE}\` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci;"

# ===== Import SQL =====
mysql \
  -h "${MYSQL_HOST}" -P "${MYSQL_PORT}" -u "${MYSQL_USER}" -p"${MYSQL_PASSWORD}" \
  "${MYSQL_DATABASE}" < "${SQL_FILE}"

echo "[OK] Database '${MYSQL_DATABASE}' replaced successfully from ${SQL_FILE}"
