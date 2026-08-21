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

export default async function handler(req, res) {
  try {
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
