import session from 'express-session';
import MySQLSession from 'express-mysql-session';
import mysql from 'mysql2/promise';
import { config } from './config.js';

const MySQLStore = MySQLSession(session);
const sessionPool = mysql.createPool({
  host: config.db.host,
  port: config.db.port,
  user: config.db.user,
  password: config.db.password,
  database: config.db.database,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

const sessionStore = new MySQLStore(
  {
    createDatabaseTable: false,
    schema: {
      tableName: 'sessions',
      columnNames: {
        session_id: 'session_id',
        expires: 'expires',
        data: 'data'
      }
    },
    clearExpired: true,
    checkExpirationInterval: 1000 * 60 * 10,
    expiration: 1000 * 60 * 60 * 24
  },
  sessionPool
);

export const sessionMiddleware = session({
  name: config.sessionName,
  secret: config.sessionSecret,
  resave: false,
  saveUninitialized: false,
  store: sessionStore,
  cookie: {
    httpOnly: true,
    sameSite: 'lax',
    secure: config.env === 'production',
    maxAge: 1000 * 60 * 60 * 24
  }
});
