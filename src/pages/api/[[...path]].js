import { createRequire } from 'module';

const require = createRequire(import.meta.url);

let appPromise;

async function getExpressApp() {
  if (!appPromise) {
    appPromise = (async () => {
      try {
        const { getApp } = require('../../../server/app');
        return await getApp();
      } catch (err) {
        appPromise = null;
        throw err;
      }
    })();
  }
  return appPromise;
}

function normalizeUrl(req) {
  // Amplify / Next catch-all sometimes strips or rewrites path
  let url = req.url || '/';
  if (!url.startsWith('/api') && req.query?.path) {
    const parts = Array.isArray(req.query.path) ? req.query.path : [req.query.path];
    url = `/api/${parts.filter(Boolean).join('/')}`;
    if (url.includes('?')) {
      /* keep */
    } else if (req.url?.includes('?')) {
      url += req.url.slice(req.url.indexOf('?'));
    }
  }
  return url;
}

export default async function handler(req, res) {
  // Fast health — works even if Mongo/Express fails (diagnose Amplify env)
  const raw = req.url || '';
  if (raw === '/api/health' || raw.startsWith('/api/health?') || raw === '/health' || raw.startsWith('/health?')) {
    return res.status(200).json({
      ok: true,
      service: 'khareedo-api',
      hasMongoEnv: Boolean(process.env.MONGO_DB_URL),
      node: process.version,
    });
  }

  try {
    req.url = normalizeUrl(req);
    const app = await getExpressApp();
    await new Promise((resolve, reject) => {
      res.on('finish', resolve);
      res.on('close', resolve);
      res.on('error', reject);
      try {
        app(req, res);
      } catch (err) {
        reject(err);
      }
    });
  } catch (err) {
    console.error('[api]', err);
    if (!res.headersSent) {
      res.status(500).json({
        ok: false,
        message: err?.message || 'API failed to start',
        hasMongoEnv: Boolean(process.env.MONGO_DB_URL),
      });
    }
  }
}

export const config = {
  api: {
    bodyParser: false,
    externalResolver: true,
  },
};
