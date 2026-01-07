// server/db.js
import mysql from 'mysql2';
import { config } from './config.js';

const corePool = mysql.createPool({
  host: config.db.host,
  port: config.db.port,
  user: config.db.user,
  password: config.db.password,
  database: config.db.database,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

const pool = corePool.promise();

export async function queryRows(sql, params = []) {
  const [rows] = await pool.query(sql, params);
  return rows;
}

export async function queryOne(sql, params = []) {
  const rows = await queryRows(sql, params);
  return rows[0] ?? null;
}

export async function execute(sql, params = []) {
  const [result] = await pool.execute(sql, params);
  return result;
}

// 如需 callback pool（例如某些第三方中间件），请使用 corePool。
export { pool, corePool };
