import '../src/env.js';
import bcrypt from 'bcryptjs';
import { config } from '../src/config.js';
import { queryOne } from '../src/db.js';

const args = process.argv.slice(2);
const getArg = (name) => {
  const idx = args.indexOf(name);
  if (idx >= 0 && idx < args.length - 1) {
    return args[idx + 1];
  }
  return null;
};

const username = getArg('--username') || 'admin';
const password = getArg('--password') || process.env.ADMIN_PASSWORD || null;

const configSnapshot = {
  env: config.env,
  db: {
    host: config.db.host,
    port: config.db.port,
    database: config.db.database,
    user: config.db.user
  },
  sessionName: config.sessionName,
  corsOrigins: config.corsOrigins
};

console.log('config', configSnapshot);

const dbInfo = await queryOne('SELECT DATABASE() AS db, @@hostname AS host, @@port AS port');
console.log('db_info', dbInfo);

const user = await queryOne(
  'SELECT id, username, password_hash, is_active FROM admin_user WHERE username = ? LIMIT 1',
  [username]
);

if (!user) {
  console.error(`admin_user not found for username="${username}"`);
  process.exit(2);
}

const hashParts = String(user.password_hash || '').split('$');
const hashVersion = hashParts.length > 1 ? `$${hashParts[1]}` : 'unknown';
const hashRounds = hashParts.length > 2 ? hashParts[2] : 'unknown';

console.log('admin_user', {
  id: user.id,
  username: user.username,
  is_active: user.is_active,
  hash_version: hashVersion,
  hash_rounds: hashRounds
});

if (!password) {
  console.log('password_match', 'skipped (provide --password or ADMIN_PASSWORD)');
  process.exit(0);
}

const isMatch = await bcrypt.compare(password, user.password_hash);
console.log('password_match', isMatch);
