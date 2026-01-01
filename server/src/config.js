import fs from 'fs';
import path from 'path';
import './env.js';

const cwd = process.cwd();
const rootDir = path.basename(cwd) === 'server' ? path.resolve(cwd, '..') : cwd;

const storageDir = process.env.STORAGE_DIR
  ? path.resolve(process.env.STORAGE_DIR)
  : path.resolve(rootDir, 'storage');

const uploadsDir = path.join(storageDir, 'uploads');
const corsOriginsRaw =
  process.env.CORS_ORIGINS ||
  process.env.CORS_ORIGIN ||
  'http://localhost:5173,http://localhost:5174';

export const config = {
  env: process.env.NODE_ENV || 'development',
  port: Number(process.env.PORT || 3000),
  db: {
    host: process.env.MYSQL_HOST || 'localhost',
    port: Number(process.env.MYSQL_PORT || 3306),
    user: process.env.MYSQL_USER || 'root',
    password: process.env.MYSQL_PASSWORD || '',
    database: process.env.MYSQL_DATABASE || 'lab_site'
  },
  sessionName: process.env.SESSION_NAME || 'jnu.sid',
  sessionSecret: process.env.SESSION_SECRET || 'dev-session-secret',
  storageDir,
  uploadsDir,
  corsOrigins: corsOriginsRaw
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean)
};

for (const dir of [storageDir, uploadsDir]) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}
