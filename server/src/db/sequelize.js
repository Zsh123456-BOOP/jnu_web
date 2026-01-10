import { Sequelize } from 'sequelize';
import { config } from '../config.js';

const timezone = process.env.MYSQL_TIMEZONE || '+00:00';

export const sequelize = new Sequelize(
  config.db.database,
  config.db.user,
  config.db.password,
  {
    host: config.db.host,
    port: config.db.port,
    dialect: 'mysql',
    logging: false,
    timezone
  }
);

export async function connect() {
  await sequelize.authenticate();
}

export async function healthcheck() {
  await sequelize.authenticate();
  return true;
}
