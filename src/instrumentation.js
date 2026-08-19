import { createRequire } from 'module';

const require = createRequire(import.meta.url);

export async function register() {
  if (process.env.NEXT_RUNTIME !== 'nodejs') return;

  const connectToDB = require('../server/src/config/db');
  const ensureAdminSeed = require('../server/src/Seeder/ensureAdmin');
  const ensureDefaultCategories = require('../server/src/Seeder/ensureCategories');
  const ensureDemoCatalog = require('../server/src/Seeder/ensureDemoCatalog');

  try {
    await connectToDB();
    await ensureAdminSeed();
    await ensureDefaultCategories();
    await ensureDemoCatalog();
    console.log('[instrumentation] DB connected and seeds applied');
  } catch (err) {
    console.error('[instrumentation] Startup failed:', err.message);
  }
}
