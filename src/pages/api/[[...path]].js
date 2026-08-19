import { createRequire } from 'module';

const require = createRequire(import.meta.url);

let appPromise;

async function getExpressApp() {
  if (!appPromise) {
    const { getApp } = require('../../../server/app');
    appPromise = getApp();
  }
  return appPromise;
}

export default async function handler(req, res) {
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
}

export const config = {
  api: {
    bodyParser: false,
    externalResolver: true,
  },
};
