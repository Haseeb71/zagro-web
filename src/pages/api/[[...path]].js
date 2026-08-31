import { createRequire } from 'module';

// Static path so Next/Amplify file-tracing packages server/ into the Lambda
const require = createRequire(import.meta.url);
const { getApp } = require('../../../server/app');

let appPromise;

async function getExpressApp() {
  if (!appPromise) {
    appPromise = getApp().catch((err) => {
      appPromise = null;
      throw err;
    });
  }
  return appPromise;
}

function normalizeUrl(req) {
  let url = req.url || '/';
  if (!url.startsWith('/api') && req.query?.path) {
    const parts = Array.isArray(req.query.path) ? req.query.path : [req.query.path];
    url = `/api/${parts.filter(Boolean).join('/')}`;
    if (req.url?.includes('?')) {
      url += req.url.slice(req.url.indexOf('?'));
    }
  }
  return url;
}

export default async function handler(req, res) {
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
    // Amplify/CloudFront — keep responses unbounded; request body stays small (JSON keys only)
    responseLimit: false,
  },
};
