const path = require('path');
const { createRequire } = require('module');
const { existsSync } = require('fs');

const requireFromHere = createRequire(__filename);

let appPromise;

function loadServerApp() {
  const candidates = [
    path.join(process.cwd(), 'server', 'app.js'),
    path.join(process.cwd(), '..', 'server', 'app.js'),
  ];
  for (const p of candidates) {
    if (existsSync(p)) return requireFromHere(p);
  }
  return requireFromHere(path.join(process.cwd(), 'server', 'app.js'));
}

async function getExpressApp() {
  if (!appPromise) {
    appPromise = (async () => {
      try {
        const { getApp } = loadServerApp();
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
  let url = req.url || '/';
  if (!url.startsWith('/api') && req.query && req.query.path) {
    const parts = Array.isArray(req.query.path) ? req.query.path : [req.query.path];
    url = '/api/' + parts.filter(Boolean).join('/');
    if (req.url && req.url.includes('?')) {
      url += req.url.slice(req.url.indexOf('?'));
    }
  }
  return url;
}

module.exports = async function handler(req, res) {
  try {
    req.url = normalizeUrl(req);
    const app = await getExpressApp();
    await new Promise(function (resolve, reject) {
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
        message: (err && err.message) || 'API failed to start',
        hasMongoEnv: Boolean(process.env.MONGO_DB_URL),
      });
    }
  }
};

module.exports.config = {
  api: {
    bodyParser: false,
    externalResolver: true,
  },
};
