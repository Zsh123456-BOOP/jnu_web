import '../src/env.js';
import { sequelize } from '../src/db/sequelize.js';
import { Settings } from '../src/models/index.js';
import { DEFAULT_FOOTER } from '../src/services/site-settings.js';

const FOOTER_KEY = 'site.footer';

async function run() {
  await sequelize.authenticate();

  const existing = await Settings.findByPk(FOOTER_KEY);
  if (existing) {
    console.log(`[seed] ${FOOTER_KEY} already exists, skip.`);
  } else {
    await Settings.create({
      key: FOOTER_KEY,
      value_json: DEFAULT_FOOTER
    });
    console.log(`[seed] ${FOOTER_KEY} created.`);
  }

  await sequelize.close();
}

run().catch((err) => {
  console.error('[seed] failed:', err);
  process.exit(1);
});
