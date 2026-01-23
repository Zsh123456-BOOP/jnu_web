import '../src/env.js';
import { sequelize } from '../src/db/sequelize.js';
import { Settings } from '../src/models/index.js';
import { DEFAULT_FOOTER, DEFAULT_SITE_META } from '../src/services/site-settings.js';

const FOOTER_KEY = 'site.footer';
const META_KEY = 'site.meta';

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

  const metaExisting = await Settings.findByPk(META_KEY);
  if (metaExisting) {
    console.log(`[seed] ${META_KEY} already exists, skip.`);
  } else {
    await Settings.create({
      key: META_KEY,
      value_json: DEFAULT_SITE_META
    });
    console.log(`[seed] ${META_KEY} created.`);
  }

  await sequelize.close();
}

run().catch((err) => {
  console.error('[seed] failed:', err);
  process.exit(1);
});
