#!/usr/bin/env bash
set -euo pipefail

PROJECT_DIR="/mnt/projects/jnu_web/admin"
DIST_DIR="$PROJECT_DIR/dist"
TARGET_DIR="/var/www/luo-sysbiomed-cn/admin"

cd "$PROJECT_DIR"

pnpm install --frozen-lockfile
pnpm build

sudo rsync -av --delete "$DIST_DIR"/ "$TARGET_DIR"/
sudo nginx -t
sudo systemctl reload nginx

echo "DEPLOY ADMIN DONE"
