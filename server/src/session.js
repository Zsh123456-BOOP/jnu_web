import session from 'express-session';
import MySQLSession from 'express-mysql-session';
import { config } from './config.js';
import { pool } from './db.js';

const MySQLStore = MySQLSession(session);

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
  pool
);

export const sessionMiddleware = session({
  name: config.sessionName,
  secret: config.sessionSecret,
  resave: false,
  saveUninitialized: false,
  store: sessionStore,
  proxy: true,
  cookie: {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.SESSION_SECURE === '1' || process.env.SESSION_SECURE === 'true',
    maxAge: 1000 * 60 * 60 * 24
  }
});
