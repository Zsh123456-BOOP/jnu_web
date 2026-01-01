# jnu_web monorepo

## Requirements
- Node.js >= 18
- pnpm >= 9

## Install
pnpm i

## Development
pnpm dev

## Build
pnpm build
Builds web and admin packages only.

## Workspace scripts
- pnpm -C server dev (nodemon, JavaScript)
- pnpm -C web dev
- pnpm -C admin dev

pnpm --filter server dev
pnpm --filter web dev
pnpm --filter admin dev

## Ports
- web: http://localhost:5173
- admin: http://localhost:5174
- server: http://localhost:3000
- static: http://localhost:3000/static -> storage/

## Default admin
- username: admin
- password: ChangeMe_123! (change before production)

## Environment variables (server)
- PORT: Server port, default 3000
- MYSQL_HOST: MySQL host
- MYSQL_PORT: MySQL port
- MYSQL_USER: MySQL username
- MYSQL_PASSWORD: MySQL password
- MYSQL_DATABASE: MySQL database name
- SESSION_SECRET: Session secret
- STORAGE_DIR: Path to storage directory, default ../storage
- CORS_ORIGINS: Comma-separated allowlist, default http://localhost:5173,http://localhost:5174

## API proxy
Vite dev servers proxy /api to http://localhost:3000. Admin uses axios with credentials enabled.
